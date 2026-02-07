import { prisma } from '../database/connection';
import { Prisma } from '@prisma/client';

export class AnalyticsService {
  /**
   * Get user's speaking progress statistics
   */
  async getUserProgress(userId: string) {
    // Total submissions
    const totalSubmissions = await prisma.speakingSubmission.count({
      where: { userId },
    });

    // Submissions by status
    const submissionsByStatus = await prisma.speakingSubmission.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    });

    // Average scores
    const averageScores = await prisma.speakingSubmission.aggregate({
      where: { 
        userId,
        status: 'analyzed',
      },
      _avg: {
        overallScore: true,
        pronunciationScore: true,
        fluencyScore: true,
        vocabularyScore: true,
        grammarScore: true,
      },
    });

    // Submissions by CEFR level
    const submissionsByCefr = await prisma.speakingSubmission.groupBy({
      by: ['promptId'],
      where: { userId },
      _count: true,
    });

    // Get CEFR distribution
    const promptIds = submissionsByCefr.map(s => s.promptId);
    const prompts = await prisma.speakingPrompt.findMany({
      where: { id: { in: promptIds } },
      select: { id: true, cefrLevel: true },
    });

    const cefrMap = new Map(prompts.map(p => [p.id, p.cefrLevel]));
    const cefrDistribution: Record<string, number> = {};
    
    submissionsByCefr.forEach(s => {
      const level = cefrMap.get(s.promptId) || 'Unknown';
      cefrDistribution[level] = (cefrDistribution[level] || 0) + s._count;
    });

    // Recent submissions (last 10)
    const recentSubmissions = await prisma.speakingSubmission.findMany({
      where: { userId },
      take: 10,
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        submittedAt: true,
        overallScore: true,
        status: true,
        prompt: {
          select: {
            title: true,
            cefrLevel: true,
          },
        },
      },
    });

    // Score trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const scoreTrends = await prisma.speakingSubmission.findMany({
      where: {
        userId,
        submittedAt: { gte: thirtyDaysAgo },
        status: 'analyzed',
      },
      orderBy: { submittedAt: 'asc' },
      select: {
        submittedAt: true,
        overallScore: true,
        pronunciationScore: true,
        fluencyScore: true,
        vocabularyScore: true,
        grammarScore: true,
      },
    });

    // Practice time (total duration)
    const totalDuration = await prisma.speakingSubmission.aggregate({
      where: { userId },
      _sum: {
        durationSeconds: true,
      },
    });

    return {
      overview: {
        totalSubmissions,
        analyzedSubmissions: submissionsByStatus.find(s => s.status === 'analyzed')?._count || 0,
        pendingSubmissions: submissionsByStatus.find(s => s.status === 'pending')?._count || 0,
        totalPracticeTimeSeconds: totalDuration._sum.durationSeconds 
          ? parseFloat(totalDuration._sum.durationSeconds.toString()) 
          : 0,
      },
      averageScores: {
        overall: averageScores._avg.overallScore 
          ? parseFloat(averageScores._avg.overallScore.toString()) 
          : null,
        pronunciation: averageScores._avg.pronunciationScore 
          ? parseFloat(averageScores._avg.pronunciationScore.toString()) 
          : null,
        fluency: averageScores._avg.fluencyScore 
          ? parseFloat(averageScores._avg.fluencyScore.toString()) 
          : null,
        vocabulary: averageScores._avg.vocabularyScore 
          ? parseFloat(averageScores._avg.vocabularyScore.toString()) 
          : null,
        grammar: averageScores._avg.grammarScore 
          ? parseFloat(averageScores._avg.grammarScore.toString()) 
          : null,
      },
      cefrDistribution,
      recentSubmissions,
      scoreTrends: scoreTrends.map(s => ({
        date: s.submittedAt,
        overallScore: s.overallScore ? parseFloat(s.overallScore.toString()) : null,
        pronunciationScore: s.pronunciationScore ? parseFloat(s.pronunciationScore.toString()) : null,
        fluencyScore: s.fluencyScore ? parseFloat(s.fluencyScore.toString()) : null,
        vocabularyScore: s.vocabularyScore ? parseFloat(s.vocabularyScore.toString()) : null,
        grammarScore: s.grammarScore ? parseFloat(s.grammarScore.toString()) : null,
      })),
    };
  }

  /**
   * Get pronunciation weaknesses
   */
  async getPronunciationWeaknesses(userId: string, limit: number = 20) {
    const submissions = await prisma.speakingSubmission.findMany({
      where: { userId },
      select: { id: true },
    });

    const submissionIds = submissions.map(s => s.id);

    const weaknesses = await prisma.pronunciationFeedback.findMany({
      where: {
        submissionId: { in: submissionIds },
        accuracyScore: { lt: new Prisma.Decimal(70) }, // Below 70% accuracy
      },
      orderBy: { accuracyScore: 'asc' },
      take: limit,
    });

    return weaknesses;
  }
}
