import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

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
  type: 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing';
  target: number;
  completed: number;
  unit: string;
}

export interface HubData {
  userId: string;
  overallLevel: string;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  skillProgress: SkillProgress[];
  dailyGoals: DailyGoal[];
  recentAchievements: any[];
  recommendedActivity: {
    type: string;
    title: string;
    reason: string;
    link: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// Hub Service
// ═══════════════════════════════════════════════════════════════

export class HubService {
  /**
   * Get comprehensive hub data for a user
   */
  static async getHubData(userId: string): Promise<HubData> {
    // Fetch all skill progress in parallel
    const [
      vocabProgress,
      readingProgress,
      listeningProgress,
      speakingProgress,
      writingProgress,
      dailyActivity,
    ] = await Promise.all([
      this.getVocabularyProgress(userId),
      this.getReadingProgress(userId),
      this.getListeningProgress(userId),
      this.getSpeakingProgress(userId),
      this.getWritingProgress(userId),
      this.getDailyActivity(userId),
    ]);

    const skillProgress: SkillProgress[] = [
      vocabProgress,
      readingProgress,
      listeningProgress,
      speakingProgress,
      writingProgress,
    ];

    // Calculate overall stats
    const overallLevel = this.calculateOverallLevel(skillProgress);
    const totalXP = await this.calculateTotalXP(userId);
    const { currentStreak, longestStreak } = await this.calculateStreaks(userId);

    // Get daily goals with progress
    const dailyGoals = this.calculateDailyGoals(dailyActivity);

    // Get recommended activity
    const recommendedActivity = this.getRecommendedActivity(skillProgress, dailyGoals);

    return {
      userId,
      overallLevel,
      totalXP,
      currentStreak,
      longestStreak,
      skillProgress,
      dailyGoals,
      recentAchievements: [], // TODO: Implement achievements
      recommendedActivity,
    };
  }

  /**
   * Get vocabulary progress
   */
  private static async getVocabularyProgress(userId: string): Promise<SkillProgress> {
    try {
      const progress = await prisma.userVocabularyProgress.findMany({
        where: { userId },
        include: { vocabulary: true },
      });

      const totalVocab = await prisma.vocabulary.count({
        where: { isActive: true },
      });

      const learned = progress.filter(p => p.status === 'learned' || p.status === 'mastered').length;
      const mastered = progress.filter(p => p.status === 'mastered').length;
      const lastPracticed = progress.length > 0
        ? progress.reduce((latest, p) =>
            p.lastReviewedAt && (!latest || p.lastReviewedAt > latest) ? p.lastReviewedAt : latest,
          null as Date | null)
        : null;

      // Calculate streak from consecutive days
      const streak = await this.calculateSkillStreak(userId, 'vocabulary');

      return {
        skill: 'vocabulary',
        level: this.inferLevel(progress.map(p => p.vocabulary?.level || 'A1')),
        progress: totalVocab > 0 ? Math.round((learned / totalVocab) * 100) : 0,
        itemsLearned: learned,
        itemsTotal: totalVocab,
        lastPracticed: lastPracticed?.toISOString() || null,
        streak,
      };
    } catch (error) {
      console.error('Error getting vocabulary progress:', error);
      return this.getDefaultProgress('vocabulary');
    }
  }

  /**
   * Get reading progress
   */
  private static async getReadingProgress(userId: string): Promise<SkillProgress> {
    try {
      const progress = await prisma.userReadingProgress.findMany({
        where: { userId },
        include: { content: true },
      });

      const totalContent = await prisma.readingContent.count({
        where: { isPublished: true },
      });

      const completed = progress.filter(p => p.status === 'completed' || p.status === 'mastered').length;
      const lastPracticed = progress.length > 0
        ? progress.reduce((latest, p) =>
            p.lastAccessedAt && (!latest || p.lastAccessedAt > latest) ? p.lastAccessedAt : latest,
          null as Date | null)
        : null;

      const streak = await this.calculateSkillStreak(userId, 'reading');

      return {
        skill: 'reading',
        level: this.inferLevel(progress.map(p => p.content?.level || 'A1')),
        progress: totalContent > 0 ? Math.round((completed / totalContent) * 100) : 0,
        itemsLearned: completed,
        itemsTotal: totalContent,
        lastPracticed: lastPracticed?.toISOString() || null,
        streak,
      };
    } catch (error) {
      console.error('Error getting reading progress:', error);
      return this.getDefaultProgress('reading');
    }
  }

  /**
   * Get listening progress
   */
  private static async getListeningProgress(userId: string): Promise<SkillProgress> {
    try {
      const progress = await prisma.userListeningProgress.findMany({
        where: { userId },
        include: { content: true },
      });

      const totalContent = await prisma.listeningContent.count({
        where: { isPublished: true },
      });

      const completed = progress.filter(p => p.status === 'completed' || p.status === 'mastered').length;
      const lastPracticed = progress.length > 0
        ? progress.reduce((latest, p) =>
            p.lastAccessedAt && (!latest || p.lastAccessedAt > latest) ? p.lastAccessedAt : latest,
          null as Date | null)
        : null;

      const streak = await this.calculateSkillStreak(userId, 'listening');

      return {
        skill: 'listening',
        level: this.inferLevel(progress.map(p => p.content?.level || 'A1')),
        progress: totalContent > 0 ? Math.round((completed / totalContent) * 100) : 0,
        itemsLearned: completed,
        itemsTotal: totalContent,
        lastPracticed: lastPracticed?.toISOString() || null,
        streak,
      };
    } catch (error) {
      console.error('Error getting listening progress:', error);
      return this.getDefaultProgress('listening');
    }
  }

  /**
   * Get speaking progress
   */
  private static async getSpeakingProgress(userId: string): Promise<SkillProgress> {
    try {
      const progress = await prisma.userSpeakingProgress.findMany({
        where: { userId },
        include: { content: true },
      });

      const totalContent = await prisma.speakingContent.count({
        where: { isPublished: true },
      });

      const completed = progress.filter(p => p.status === 'completed' || p.status === 'mastered').length;
      const lastPracticed = progress.length > 0
        ? progress.reduce((latest, p) =>
            p.lastAccessedAt && (!latest || p.lastAccessedAt > latest) ? p.lastAccessedAt : latest,
          null as Date | null)
        : null;

      const streak = await this.calculateSkillStreak(userId, 'speaking');

      return {
        skill: 'speaking',
        level: this.inferLevel(progress.map(p => p.content?.level || 'A1')),
        progress: totalContent > 0 ? Math.round((completed / totalContent) * 100) : 0,
        itemsLearned: completed,
        itemsTotal: totalContent,
        lastPracticed: lastPracticed?.toISOString() || null,
        streak,
      };
    } catch (error) {
      console.error('Error getting speaking progress:', error);
      return this.getDefaultProgress('speaking');
    }
  }

  /**
   * Get writing progress
   */
  private static async getWritingProgress(userId: string): Promise<SkillProgress> {
    try {
      const progress = await prisma.userWritingProgress.findMany({
        where: { userId },
        include: { prompt: true },
      });

      const totalPrompts = await prisma.writingPrompt.count({
        where: { isPublished: true },
      });

      const completed = progress.filter(p => p.status === 'completed' || p.status === 'mastered').length;
      const lastPracticed = progress.length > 0
        ? progress.reduce((latest, p) =>
            p.lastAttemptAt && (!latest || p.lastAttemptAt > latest) ? p.lastAttemptAt : latest,
          null as Date | null)
        : null;

      const streak = await this.calculateSkillStreak(userId, 'writing');

      return {
        skill: 'writing',
        level: this.inferLevel(progress.map(p => p.prompt?.level || 'A1')),
        progress: totalPrompts > 0 ? Math.round((completed / totalPrompts) * 100) : 0,
        itemsLearned: completed,
        itemsTotal: totalPrompts,
        lastPracticed: lastPracticed?.toISOString() || null,
        streak,
      };
    } catch (error) {
      console.error('Error getting writing progress:', error);
      return this.getDefaultProgress('writing');
    }
  }

  /**
   * Get daily activity for calculating goals
   */
  private static async getDailyActivity(userId: string): Promise<Record<string, number>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Count today's vocabulary reviews
      const vocabReviews = await prisma.userVocabularyProgress.count({
        where: {
          userId,
          lastReviewedAt: { gte: today },
        },
      });

      // Count today's reading completions
      const readingCompletions = await prisma.userReadingProgress.count({
        where: {
          userId,
          lastAccessedAt: { gte: today },
          status: { in: ['completed', 'mastered'] },
        },
      });

      // Count today's listening completions
      const listeningCompletions = await prisma.userListeningProgress.count({
        where: {
          userId,
          lastAccessedAt: { gte: today },
          status: { in: ['completed', 'mastered'] },
        },
      });

      // Count today's speaking attempts
      const speakingAttempts = await prisma.speakingAttempt.count({
        where: {
          userId,
          createdAt: { gte: today },
        },
      });

      // Count today's writing submissions
      const writingSubmissions = await prisma.writingSubmission.count({
        where: {
          userId,
          submittedAt: { gte: today },
        },
      });

      return {
        vocabulary: vocabReviews,
        reading: readingCompletions,
        listening: listeningCompletions,
        speaking: speakingAttempts,
        writing: writingSubmissions,
      };
    } catch (error) {
      console.error('Error getting daily activity:', error);
      return {
        vocabulary: 0,
        reading: 0,
        listening: 0,
        speaking: 0,
        writing: 0,
      };
    }
  }

  /**
   * Calculate daily goals with progress
   */
  private static calculateDailyGoals(dailyActivity: Record<string, number>): DailyGoal[] {
    return [
      { type: 'vocabulary', target: 20, completed: dailyActivity.vocabulary || 0, unit: 'words' },
      { type: 'reading', target: 1, completed: dailyActivity.reading || 0, unit: 'articles' },
      { type: 'listening', target: 10, completed: dailyActivity.listening || 0, unit: 'minutes' },
      { type: 'speaking', target: 5, completed: dailyActivity.speaking || 0, unit: 'minutes' },
      { type: 'writing', target: 1, completed: dailyActivity.writing || 0, unit: 'exercises' },
    ];
  }

  /**
   * Calculate skill-specific streak
   */
  private static async calculateSkillStreak(userId: string, skill: string): Promise<number> {
    // Simplified streak calculation - count consecutive days with activity
    // In production, this should query actual activity logs
    return 0; // TODO: Implement proper streak tracking
  }

  /**
   * Calculate overall streaks
   */
  private static async calculateStreaks(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    // TODO: Implement proper streak tracking with activity logs
    return { currentStreak: 0, longestStreak: 0 };
  }

  /**
   * Calculate total XP
   */
  private static async calculateTotalXP(userId: string): Promise<number> {
    // XP calculation based on completed items
    // TODO: Implement XP tracking system
    return 0;
  }

  /**
   * Infer overall level from skill levels
   */
  private static calculateOverallLevel(skillProgress: SkillProgress[]): string {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const skillLevels = skillProgress.map(s => s.level);

    // Find the most common level
    const levelCounts: Record<string, number> = {};
    skillLevels.forEach(level => {
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

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

  /**
   * Infer level from a list of content levels
   */
  private static inferLevel(levels: string[]): string {
    if (levels.length === 0) return 'A1';

    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const highestIndex = levels.reduce((maxIdx, level) => {
      const idx = levelOrder.indexOf(level);
      return idx > maxIdx ? idx : maxIdx;
    }, 0);

    return levelOrder[highestIndex];
  }

  /**
   * Get recommended activity based on progress
   */
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

    // Priority 1: Incomplete daily goals
    const incompleteGoals = dailyGoals.filter(g => g.completed < g.target);
    if (incompleteGoals.length > 0) {
      const goal = incompleteGoals[0];
      return {
        type: goal.type,
        title: `Complete ${skillNames[goal.type]}`,
        reason: `${goal.target - goal.completed} ${goal.unit} remaining for today's goal`,
        link: skillLinks[goal.type],
      };
    }

    // Priority 2: Skills not practiced recently
    const staleSkills = skillProgress
      .filter(s => !s.lastPracticed || this.daysSince(s.lastPracticed) > 2)
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

    // Default: Continue with lowest progress skill
    const lowestProgress = [...skillProgress].sort((a, b) => a.progress - b.progress)[0];
    return {
      type: lowestProgress.skill,
      title: `Continue ${skillNames[lowestProgress.skill]}`,
      reason: `${100 - lowestProgress.progress}% remaining to complete`,
      link: skillLinks[lowestProgress.skill],
    };
  }

  /**
   * Calculate days since a date
   */
  private static daysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / 86400000);
  }

  /**
   * Get default progress for error cases
   */
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
