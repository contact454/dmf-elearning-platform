import { PrismaClient, ReviewStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface SkillProgress {
  skill: string;
  level: string;
  progress: number;
  itemsLearned: number;
  itemsTotal: number;
  lastPracticed: string | null;
  streak: number;
}

export interface DailyGoal {
  type: 'vocabulary' | 'reading' | 'listening';
  target: number;
  completed: number;
  isCompleted: boolean;
  unit: string;
}

export interface HubSummary {
  totalWordsLearned: number;
  wordsInReview: number;
  currentStreak: number;
  readingCompleted: number;
  listeningCompleted: number;
  speakingCompleted: number;
  writingCompleted: number;
}

export interface HubData {
  userId: string;
  overallLevel: string;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  summary: HubSummary;
  skillProgress: SkillProgress[];
  dailyGoals: DailyGoal[];
  recentAchievements: unknown[];
  recommendedActivity: {
    type: string;
    title: string;
    reason: string;
    link: string;
  };
}

type DailyActivity = {
  vocabulary: number;
  reading: number;
  listening: number;
};

type DailyGoalConfig = {
  vocabulary: number;
  reading: number;
  listening: number;
};

export class HubService {
  private static readonly defaultDailyGoalConfig: DailyGoalConfig = {
    vocabulary: 10,
    reading: 1,
    listening: 1,
  };

  // In-memory user goal config store (defaulted per user).
  private static readonly dailyGoalConfigByUser = new Map<string, DailyGoalConfig>();

  static async getHubData(userId: string): Promise<HubData> {
    const [
      vocabProgress,
      readingProgress,
      listeningProgress,
      speakingProgress,
      writingProgress,
      dailyActivity,
      totalXP,
      streaks,
      summaryStats,
    ] = await Promise.all([
      this.getVocabularyProgress(userId),
      this.getReadingProgress(userId),
      this.getListeningProgress(userId),
      this.getSpeakingProgress(userId),
      this.getWritingProgress(userId),
      this.getDailyActivity(userId),
      this.calculateTotalXP(userId),
      this.calculateStreaks(userId),
      this.getHubSummary(userId),
    ]);

    const skillProgress: SkillProgress[] = [
      vocabProgress,
      readingProgress,
      listeningProgress,
      speakingProgress,
      writingProgress,
    ];

    const dailyGoals = this.calculateDailyGoals(userId, dailyActivity);
    const recommendedActivity = this.getRecommendedActivity(skillProgress, dailyGoals);

    return {
      userId,
      overallLevel: this.calculateOverallLevel(skillProgress),
      totalXP,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      summary: {
        ...summaryStats,
        currentStreak: streaks.currentStreak,
      },
      skillProgress,
      dailyGoals,
      recentAchievements: [],
      recommendedActivity,
    };
  }

  private static async getVocabularyProgress(userId: string): Promise<SkillProgress> {
    try {
      const [progress, totalVocab] = await Promise.all([
        prisma.userWordProgress.findMany({
          where: { userId },
          include: {
            word: {
              select: { level: true },
            },
          },
        }),
        prisma.vocabularyItem.count(),
      ]);

      const learned = progress.filter((p) => p.status === ReviewStatus.MASTERED).length;
      const lastPracticed =
        progress.length > 0
          ? progress.reduce<Date | null>(
              (latest, p) => (!latest || p.updatedAt > latest ? p.updatedAt : latest),
              null
            )
          : null;

      return {
        skill: 'vocabulary',
        level: this.inferLevel(progress.map((p) => p.word.level)),
        progress: totalVocab > 0 ? Math.round((learned / totalVocab) * 100) : 0,
        itemsLearned: learned,
        itemsTotal: totalVocab,
        lastPracticed: lastPracticed?.toISOString() ?? null,
        streak: await this.calculateSkillStreak(userId, 'vocabulary'),
      };
    } catch (error) {
      console.error('Error getting vocabulary progress:', error);
      return this.getDefaultProgress('vocabulary');
    }
  }

  private static async getReadingProgress(userId: string): Promise<SkillProgress> {
    try {
      const [progress, totalContent] = await Promise.all([
        prisma.userReadingProgress.findMany({
          where: { userId },
          include: {
            content: {
              select: { level: true },
            },
          },
        }),
        prisma.readingContent.count({ where: { isPublished: true } }),
      ]);

      const completed = progress.filter((p) => ['completed', 'mastered'].includes(p.status)).length;
      const lastPracticed =
        progress.length > 0
          ? progress.reduce<Date | null>((latest, p) => {
              const candidate = p.completedAt ?? p.updatedAt;
              return !latest || candidate > latest ? candidate : latest;
            }, null)
          : null;

      return {
        skill: 'reading',
        level: this.inferLevel(progress.map((p) => p.content.level)),
        progress: totalContent > 0 ? Math.round((completed / totalContent) * 100) : 0,
        itemsLearned: completed,
        itemsTotal: totalContent,
        lastPracticed: lastPracticed?.toISOString() ?? null,
        streak: await this.calculateSkillStreak(userId, 'reading'),
      };
    } catch (error) {
      console.error('Error getting reading progress:', error);
      return this.getDefaultProgress('reading');
    }
  }

  private static async getListeningProgress(userId: string): Promise<SkillProgress> {
    try {
      const [progress, totalContent] = await Promise.all([
        prisma.userListeningProgress.findMany({
          where: { userId },
          include: {
            content: {
              select: { level: true },
            },
          },
        }),
        prisma.listeningContent.count({ where: { isPublished: true } }),
      ]);

      const completed = progress.filter((p) => ['completed', 'mastered'].includes(p.status)).length;
      const lastPracticed =
        progress.length > 0
          ? progress.reduce<Date | null>((latest, p) => {
              const candidate = p.completedAt ?? p.updatedAt;
              return !latest || candidate > latest ? candidate : latest;
            }, null)
          : null;

      return {
        skill: 'listening',
        level: this.inferLevel(progress.map((p) => p.content.level)),
        progress: totalContent > 0 ? Math.round((completed / totalContent) * 100) : 0,
        itemsLearned: completed,
        itemsTotal: totalContent,
        lastPracticed: lastPracticed?.toISOString() ?? null,
        streak: await this.calculateSkillStreak(userId, 'listening'),
      };
    } catch (error) {
      console.error('Error getting listening progress:', error);
      return this.getDefaultProgress('listening');
    }
  }

  private static async getSpeakingProgress(userId: string): Promise<SkillProgress> {
    try {
      const [progress, totalPrompts] = await Promise.all([
        prisma.userSpeakingProgress.findMany({
          where: { userId },
          include: {
            prompt: {
              select: { level: true },
            },
          },
        }),
        prisma.speakingPrompt.count({ where: { isPublished: true } }),
      ]);

      const completed = progress.filter((p) => ['attempted', 'completed', 'mastered'].includes(p.status)).length;
      const lastPracticed =
        progress.length > 0
          ? progress.reduce<Date | null>((latest, p) => {
              const candidate = p.lastAttemptAt ?? p.updatedAt;
              return !latest || candidate > latest ? candidate : latest;
            }, null)
          : null;

      return {
        skill: 'speaking',
        level: this.inferLevel(progress.map((p) => p.prompt.level)),
        progress: totalPrompts > 0 ? Math.round((completed / totalPrompts) * 100) : 0,
        itemsLearned: completed,
        itemsTotal: totalPrompts,
        lastPracticed: lastPracticed?.toISOString() ?? null,
        streak: await this.calculateSkillStreak(userId, 'speaking'),
      };
    } catch (error) {
      console.error('Error getting speaking progress:', error);
      return this.getDefaultProgress('speaking');
    }
  }

  private static async getWritingProgress(userId: string): Promise<SkillProgress> {
    try {
      const [progress, totalPrompts] = await Promise.all([
        prisma.userWritingProgress.findMany({
          where: { userId },
          include: {
            prompt: {
              select: { level: true },
            },
          },
        }),
        prisma.writingPrompt.count({ where: { isPublished: true } }),
      ]);

      const completed = progress.filter((p) => ['completed', 'mastered'].includes(p.status)).length;
      const lastPracticed =
        progress.length > 0
          ? progress.reduce<Date | null>((latest, p) => {
              const candidate = p.lastSubmissionAt ?? p.updatedAt;
              return !latest || candidate > latest ? candidate : latest;
            }, null)
          : null;

      return {
        skill: 'writing',
        level: this.inferLevel(progress.map((p) => p.prompt.level)),
        progress: totalPrompts > 0 ? Math.round((completed / totalPrompts) * 100) : 0,
        itemsLearned: completed,
        itemsTotal: totalPrompts,
        lastPracticed: lastPracticed?.toISOString() ?? null,
        streak: await this.calculateSkillStreak(userId, 'writing'),
      };
    } catch (error) {
      console.error('Error getting writing progress:', error);
      return this.getDefaultProgress('writing');
    }
  }

  private static async getDailyActivity(userId: string): Promise<DailyActivity> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const [vocabulary, reading, listening] = await Promise.all([
        prisma.userWordProgress.count({
          where: {
            userId,
            updatedAt: { gte: today },
            totalReviews: { gt: 0 },
          },
        }),
        prisma.userReadingProgress.count({
          where: {
            userId,
            completedAt: { gte: today },
            status: { in: ['completed', 'mastered'] },
          },
        }),
        prisma.userListeningProgress.count({
          where: {
            userId,
            completedAt: { gte: today },
            status: { in: ['completed', 'mastered'] },
          },
        }),
      ]);

      return { vocabulary, reading, listening };
    } catch (error) {
      console.error('Error getting daily activity:', error);
      return { vocabulary: 0, reading: 0, listening: 0 };
    }
  }

  private static calculateDailyGoals(userId: string, dailyActivity: DailyActivity): DailyGoal[] {
    const config = this.getDailyGoalConfig(userId);
    return [
      {
        type: 'vocabulary',
        target: config.vocabulary,
        completed: dailyActivity.vocabulary,
        isCompleted: dailyActivity.vocabulary >= config.vocabulary,
        unit: 'reviews',
      },
      {
        type: 'reading',
        target: config.reading,
        completed: dailyActivity.reading,
        isCompleted: dailyActivity.reading >= config.reading,
        unit: 'passages',
      },
      {
        type: 'listening',
        target: config.listening,
        completed: dailyActivity.listening,
        isCompleted: dailyActivity.listening >= config.listening,
        unit: 'sessions',
      },
    ];
  }

  private static getDailyGoalConfig(userId: string): DailyGoalConfig {
    const existing = this.dailyGoalConfigByUser.get(userId);
    if (existing) {
      return existing;
    }

    const config = { ...this.defaultDailyGoalConfig };
    this.dailyGoalConfigByUser.set(userId, config);
    return config;
  }

  private static async calculateSkillStreak(_userId: string, _skill: string): Promise<number> {
    return 0;
  }

  private static async calculateStreaks(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true },
    });

    if (!user) return { currentStreak: 0, longestStreak: 0 };
    return { currentStreak: user.currentStreak, longestStreak: user.longestStreak };
  }

  private static async calculateTotalXP(userId: string): Promise<number> {
    const [vocabMastered, readingCompleted, listeningCompleted, speakingAttempts, writingSubmissions] =
      await Promise.all([
        prisma.userWordProgress.count({
          where: { userId, status: ReviewStatus.MASTERED },
        }),
        prisma.userReadingProgress.count({
          where: { userId, status: { in: ['completed', 'mastered'] } },
        }),
        prisma.userListeningProgress.count({
          where: { userId, status: { in: ['completed', 'mastered'] } },
        }),
        prisma.speakingAttempt.count({ where: { userId } }),
        prisma.writingSubmission.count({ where: { userId } }),
      ]);

    return (
      vocabMastered * 5 +
      readingCompleted * 20 +
      listeningCompleted * 20 +
      speakingAttempts * 10 +
      writingSubmissions * 15
    );
  }

  private static async getHubSummary(userId: string): Promise<
    Omit<HubSummary, 'currentStreak'>
  > {
    const [
      totalWordsLearned,
      wordsInReview,
      readingCompleted,
      listeningCompleted,
      speakingCompleted,
      writingCompleted,
    ] = await Promise.all([
      prisma.userWordProgress.count({
        where: {
          userId,
          status: ReviewStatus.MASTERED,
        },
      }),
      prisma.userWordProgress.count({
        where: {
          userId,
          status: ReviewStatus.REVIEW,
        },
      }),
      prisma.userReadingProgress.count({
        where: {
          userId,
          status: { in: ['completed', 'mastered'] },
        },
      }),
      prisma.userListeningProgress.count({
        where: {
          userId,
          status: { in: ['completed', 'mastered'] },
        },
      }),
      prisma.userSpeakingProgress.count({
        where: {
          userId,
          status: { in: ['attempted', 'completed', 'mastered'] },
        },
      }),
      prisma.userWritingProgress.count({
        where: {
          userId,
          status: { in: ['completed', 'mastered'] },
        },
      }),
    ]);

    return {
      totalWordsLearned,
      wordsInReview,
      readingCompleted,
      listeningCompleted,
      speakingCompleted,
      writingCompleted,
    };
  }

  private static calculateOverallLevel(skillProgress: SkillProgress[]): string {
    const levelCounts: Record<string, number> = {};
    for (const skill of skillProgress) {
      levelCounts[skill.level] = (levelCounts[skill.level] || 0) + 1;
    }

    let maxCount = 0;
    let mostCommonLevel = 'A1';
    for (const [level, count] of Object.entries(levelCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonLevel = level;
      }
    }
    return mostCommonLevel;
  }

  private static inferLevel(levels: string[]): string {
    if (levels.length === 0) return 'A1';

    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const highestIndex = levels.reduce((maxIdx, level) => {
      const idx = levelOrder.indexOf(level);
      return idx > maxIdx ? idx : maxIdx;
    }, 0);

    return levelOrder[highestIndex] ?? 'A1';
  }

  private static getRecommendedActivity(
    skillProgress: SkillProgress[],
    dailyGoals: DailyGoal[]
  ): { type: string; title: string; reason: string; link: string } {
    const skillLinks: Record<string, string> = {
      vocabulary: '/learn/german',
      reading: '/learn/reading',
      listening: '/learn/listening',
      speaking: '/learn/speaking',
      writing: '/learn/writing',
    };

    const skillNames: Record<string, string> = {
      vocabulary: 'Vocabulary Practice',
      reading: 'Reading Comprehension',
      listening: 'Listening Practice',
      speaking: 'Speaking Practice',
      writing: 'Writing Exercise',
    };

    const incompleteGoals = dailyGoals.filter((g) => g.completed < g.target);
    if (incompleteGoals.length > 0) {
      const goal = incompleteGoals[0];
      return {
        type: goal.type,
        title: `Complete ${skillNames[goal.type]}`,
        reason: `${goal.target - goal.completed} ${goal.unit} remaining for today's goal`,
        link: skillLinks[goal.type],
      };
    }

    const staleSkills = skillProgress
      .filter((s) => !s.lastPracticed || this.daysSince(s.lastPracticed) > 2)
      .sort((a, b) => {
        if (!a.lastPracticed) return -1;
        if (!b.lastPracticed) return 1;
        return new Date(a.lastPracticed).getTime() - new Date(b.lastPracticed).getTime();
      });

    if (staleSkills.length > 0) {
      const skill = staleSkills[0];
      return {
        type: skill.skill,
        title: `Review ${skillNames[skill.skill]}`,
        reason: skill.lastPracticed
          ? `Not practiced in ${this.daysSince(skill.lastPracticed)} days`
          : 'Start your first lesson',
        link: skillLinks[skill.skill],
      };
    }

    const lowestProgress = [...skillProgress].sort((a, b) => a.progress - b.progress)[0];
    return {
      type: lowestProgress.skill,
      title: `Continue ${skillNames[lowestProgress.skill]}`,
      reason: `${100 - lowestProgress.progress}% remaining to complete`,
      link: skillLinks[lowestProgress.skill],
    };
  }

  private static daysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / 86400000);
  }

  private static getDefaultProgress(skill: string): SkillProgress {
    return {
      skill,
      level: 'A1',
      progress: 0,
      itemsLearned: 0,
      itemsTotal: 0,
      lastPracticed: null,
      streak: 0,
    };
  }
}
