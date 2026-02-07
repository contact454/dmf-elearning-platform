import { prisma } from '../database/connection';

export class AnalyticsService {
  async getUserStats(userId: string, period: 'week' | 'month' | 'all' = 'month') {
    const cutoffDate = this.getCutoffDate(period);

    // Total essays
    const totalEssays = await prisma.essay.count({
      where: {
        userId,
        ...(cutoffDate && { createdAt: { gte: cutoffDate } }),
      },
    });

    // Total words written
    const wordsResult = await prisma.essay.aggregate({
      where: {
        userId,
        ...(cutoffDate && { createdAt: { gte: cutoffDate } }),
      },
      _sum: { wordCount: true },
    });
    const totalWords = wordsResult._sum.wordCount || 0;

    // Average words per essay
    const averageWords = totalEssays > 0 ? Math.round(totalWords / totalEssays) : 0;

    // Error rate calculation (safely handle division by zero)
    const essays = await prisma.essay.findMany({
      where: {
        userId,
        ...(cutoffDate && { createdAt: { gte: cutoffDate } }),
        wordCount: { gt: 0 },
      },
      select: {
        errorCount: true,
        wordCount: true,
      },
    });

    let errorRate = 0;
    if (essays.length > 0) {
      const totalErrors = essays.reduce((sum, e) => sum + e.errorCount, 0);
      const totalWordsWithErrors = essays.reduce((sum, e) => sum + e.wordCount, 0);
      errorRate = totalWordsWithErrors > 0 
        ? (totalErrors / totalWordsWithErrors) * 100 
        : 0;
    }

    // Error trends (by day) - last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyEssays = await prisma.essay.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate || thirtyDaysAgo },
        wordCount: { gt: 0 },
      },
      select: {
        createdAt: true,
        errorCount: true,
        wordCount: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by date
    const trendsByDate = new Map<string, { errors: number; words: number }>();
    dailyEssays.forEach(essay => {
      const date = essay.createdAt.toISOString().split('T')[0];
      const existing = trendsByDate.get(date) || { errors: 0, words: 0 };
      trendsByDate.set(date, {
        errors: existing.errors + essay.errorCount,
        words: existing.words + essay.wordCount,
      });
    });

    const errorTrends = Array.from(trendsByDate.entries())
      .map(([date, data]) => ({
        date,
        errorRate: data.words > 0 ? (data.errors / data.words) * 100 : 0,
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    // Most common errors
    const commonErrors = await prisma.grammarError.groupBy({
      by: ['errorType'],
      where: {
        essay: {
          userId,
          ...(cutoffDate && { createdAt: { gte: cutoffDate } }),
        },
      },
      _count: { errorType: true },
      orderBy: { _count: { errorType: 'desc' } },
    });

    return {
      totalEssays,
      totalWords,
      averageWords,
      errorRate: Number(errorRate.toFixed(2)),
      errorTrends,
      commonErrors: commonErrors.map((e) => ({
        type: e.errorType,
        count: e._count.errorType,
      })),
    };
  }

  private getCutoffDate(period: 'week' | 'month' | 'all'): Date | null {
    if (period === 'all') return null;

    const now = new Date();
    if (period === 'week') {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (period === 'month') {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return null;
  }
}
