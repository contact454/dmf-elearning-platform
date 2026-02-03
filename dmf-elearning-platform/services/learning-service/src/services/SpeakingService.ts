import {
  PrismaClient,
  SpeakingPrompt,
  SpeakingAttempt,
  UserSpeakingProgress,
} from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface SpeakingFilters {
  level?: string;
  category?: string;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SpeakingWithProgress extends SpeakingPrompt {
  userProgress?: UserSpeakingProgress | null;
  attemptCount?: number;
}

export interface WordScore {
  word: string;
  userWord: string;
  score: number;
  isCorrect: boolean;
}

export interface AttemptEvaluation {
  pronunciationScore: number;
  fluencyScore: number;
  accuracyScore: number;
  overallScore: number;
  wordScores: WordScore[];
  feedback: string;
}

export interface SpeakingStats {
  totalPrompts: number;
  byLevel: { level: string; count: number }[];
  byCategory: { category: string; count: number }[];
}

// ═══════════════════════════════════════════════════════════════
// Speaking Service
// ═══════════════════════════════════════════════════════════════

export class SpeakingService {
  /**
   * Get speaking prompts with filters
   */
  async getPrompts(filters: SpeakingFilters): Promise<{ items: SpeakingPrompt[]; total: number }> {
    const where: any = { isPublished: true };

    if (filters.level) {
      where.level = filters.level.toUpperCase();
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.topic) {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { promptText: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.speakingPrompt.findMany({
        where,
        take: filters.limit || 20,
        skip: filters.offset || 0,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.speakingPrompt.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Get single prompt by ID
   */
  async getById(id: string): Promise<SpeakingPrompt | null> {
    return prisma.speakingPrompt.findUnique({ where: { id } });
  }

  /**
   * Get prompt with user progress
   */
  async getWithProgress(id: string, userId: string): Promise<SpeakingWithProgress | null> {
    const prompt = await prisma.speakingPrompt.findUnique({
      where: { id },
      include: {
        progress: {
          where: { userId },
          take: 1,
        },
        attempts: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    if (!prompt) return null;

    return {
      ...prompt,
      userProgress: prompt.progress[0] || null,
      attemptCount: prompt.attempts.length,
    };
  }

  /**
   * Get featured prompts
   */
  async getFeatured(limit: number = 5): Promise<SpeakingPrompt[]> {
    return prisma.speakingPrompt.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get speaking statistics
   */
  async getStats(): Promise<SpeakingStats> {
    const [total, byLevel, byCategory] = await Promise.all([
      prisma.speakingPrompt.count({ where: { isPublished: true } }),
      prisma.speakingPrompt.groupBy({
        by: ['level'],
        where: { isPublished: true },
        _count: true,
        orderBy: { level: 'asc' },
      }),
      prisma.speakingPrompt.groupBy({
        by: ['category'],
        where: { isPublished: true },
        _count: true,
      }),
    ]);

    return {
      totalPrompts: total,
      byLevel: byLevel.map(l => ({ level: l.level, count: l._count })),
      byCategory: byCategory.map(c => ({ category: c.category, count: c._count })),
    };
  }

  /**
   * Get available levels
   */
  async getLevels(): Promise<string[]> {
    const result = await prisma.speakingPrompt.findMany({
      where: { isPublished: true },
      distinct: ['level'],
      select: { level: true },
      orderBy: { level: 'asc' },
    });
    return result.map(r => r.level);
  }

  /**
   * Get available categories
   */
  async getCategories(): Promise<string[]> {
    const result = await prisma.speakingPrompt.findMany({
      where: { isPublished: true },
      distinct: ['category'],
      select: { category: true },
    });
    return result.map(r => r.category);
  }

  // ═══════════════════════════════════════════════════════════════
  // Speaking Attempts
  // ═══════════════════════════════════════════════════════════════

  /**
   * Submit speaking attempt with evaluation
   */
  async submitAttempt(
    promptId: string,
    userId: string,
    data: {
      transcript: string;
      audioUrl?: string;
      audioDuration?: number;
      recordingTime?: number;
    }
  ): Promise<SpeakingAttempt> {
    // Get prompt for evaluation
    const prompt = await prisma.speakingPrompt.findUnique({
      where: { id: promptId },
      select: { sampleResponse: true, promptText: true, targetWords: true },
    });

    if (!prompt) throw new Error('Prompt not found');

    // Evaluate the attempt
    const evaluation = this.evaluateAttempt(
      data.transcript,
      prompt.sampleResponse || prompt.promptText,
      prompt.targetWords
    );

    // Get attempt number
    const attemptCount = await prisma.speakingAttempt.count({
      where: { promptId, userId },
    });

    // Create attempt
    const attempt = await prisma.speakingAttempt.create({
      data: {
        promptId,
        userId,
        transcript: data.transcript,
        audioUrl: data.audioUrl,
        audioDuration: data.audioDuration || 0,
        recordingTime: data.recordingTime || 0,
        attemptNumber: attemptCount + 1,
        pronunciationScore: evaluation.pronunciationScore,
        fluencyScore: evaluation.fluencyScore,
        accuracyScore: evaluation.accuracyScore,
        overallScore: evaluation.overallScore,
        wordScores: evaluation.wordScores as any,
        feedback: evaluation.feedback,
      },
    });

    // Update user progress
    await this.updateProgressAfterAttempt(userId, promptId, evaluation.overallScore);

    return attempt;
  }

  /**
   * Evaluate speaking attempt
   */
  private evaluateAttempt(
    userTranscript: string,
    expectedText: string,
    targetWords: string[]
  ): AttemptEvaluation {
    const userWords = userTranscript.toLowerCase().split(/\s+/).filter(Boolean);
    const expectedWords = expectedText.toLowerCase().split(/\s+/).filter(Boolean);

    const wordScores: WordScore[] = [];
    let totalScore = 0;

    // Compare words
    for (let i = 0; i < expectedWords.length; i++) {
      const expected = expectedWords[i].replace(/[.,!?;:]/g, '');
      const user = (userWords[i] || '').replace(/[.,!?;:]/g, '');
      const score = this.calculateWordSimilarity(user, expected);
      const isCorrect = score >= 80;

      wordScores.push({ word: expected, userWord: user, score, isCorrect });
      totalScore += score;
    }

    // Calculate scores
    const accuracyScore = expectedWords.length > 0 ? totalScore / expectedWords.length : 0;

    // Fluency score based on word count ratio
    const wordCountRatio = Math.min(userWords.length / expectedWords.length, 1.5);
    const fluencyScore = wordCountRatio > 0.5 && wordCountRatio < 1.3 ? 80 + (1 - Math.abs(1 - wordCountRatio)) * 20 : 50;

    // Pronunciation score (average of word scores for target words)
    let pronunciationScore = accuracyScore;
    if (targetWords.length > 0) {
      const targetScores = wordScores.filter(ws =>
        targetWords.some(tw => tw.toLowerCase() === ws.word)
      );
      if (targetScores.length > 0) {
        pronunciationScore = targetScores.reduce((sum, ws) => sum + ws.score, 0) / targetScores.length;
      }
    }

    // Overall weighted score
    const overallScore = Math.round(
      accuracyScore * 0.4 + fluencyScore * 0.3 + pronunciationScore * 0.3
    );

    // Generate feedback
    const feedback = this.generateFeedback(accuracyScore, fluencyScore, pronunciationScore, wordScores);

    return {
      pronunciationScore: Math.round(pronunciationScore),
      fluencyScore: Math.round(fluencyScore),
      accuracyScore: Math.round(accuracyScore),
      overallScore,
      wordScores,
      feedback,
    };
  }

  /**
   * Calculate word similarity (Levenshtein-based)
   */
  private calculateWordSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 100;
    if (!str1 || !str2) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= str1.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[str1.length][str2.length];
    const maxLength = Math.max(str1.length, str2.length);
    return Math.round(((maxLength - distance) / maxLength) * 100);
  }

  /**
   * Generate feedback message
   */
  private generateFeedback(
    accuracy: number,
    fluency: number,
    pronunciation: number,
    wordScores: WordScore[]
  ): string {
    const incorrectWords = wordScores.filter(ws => !ws.isCorrect && ws.userWord);
    const missingWords = wordScores.filter(ws => !ws.userWord);

    let feedback = '';

    if (accuracy >= 90) {
      feedback = 'Excellent! Your pronunciation is very accurate. ';
    } else if (accuracy >= 70) {
      feedback = 'Good job! Keep practicing to improve further. ';
    } else if (accuracy >= 50) {
      feedback = 'Nice try! Focus on the words you missed. ';
    } else {
      feedback = 'Keep practicing! Try listening to the sample again. ';
    }

    if (incorrectWords.length > 0 && incorrectWords.length <= 3) {
      const words = incorrectWords.map(w => `"${w.word}"`).join(', ');
      feedback += `Pay attention to: ${words}. `;
    }

    if (missingWords.length > 0 && missingWords.length <= 3) {
      const words = missingWords.map(w => `"${w.word}"`).join(', ');
      feedback += `Don't forget: ${words}. `;
    }

    if (fluency < 60) {
      feedback += 'Try to speak more naturally and at a steady pace.';
    }

    return feedback.trim();
  }

  // ═══════════════════════════════════════════════════════════════
  // User Progress
  // ═══════════════════════════════════════════════════════════════

  /**
   * Update progress after attempt
   */
  private async updateProgressAfterAttempt(
    userId: string,
    promptId: string,
    score: number
  ): Promise<void> {
    const existing = await prisma.userSpeakingProgress.findUnique({
      where: { userId_promptId: { userId, promptId } },
    });

    if (existing) {
      await prisma.userSpeakingProgress.update({
        where: { userId_promptId: { userId, promptId } },
        data: {
          attemptCount: { increment: 1 },
          lastScore: score,
          bestScore: Math.max(existing.bestScore, score),
          status: score >= 80 ? 'mastered' : 'attempted',
          lastAttemptAt: new Date(),
        },
      });
    } else {
      await prisma.userSpeakingProgress.create({
        data: {
          userId,
          promptId,
          attemptCount: 1,
          lastScore: score,
          bestScore: score,
          status: score >= 80 ? 'mastered' : 'attempted',
          firstAttemptAt: new Date(),
          lastAttemptAt: new Date(),
        },
      });
    }
  }

  /**
   * Get user's speaking history
   */
  async getUserHistory(
    userId: string,
    status?: string
  ): Promise<Array<UserSpeakingProgress & { prompt: SpeakingPrompt }>> {
    const where: any = { userId };
    if (status) where.status = status;

    return prisma.userSpeakingProgress.findMany({
      where,
      include: { prompt: true },
      orderBy: { lastAttemptAt: 'desc' },
    });
  }

  /**
   * Get user's speaking statistics
   */
  async getUserStats(userId: string): Promise<{
    totalAttempts: number;
    promptsAttempted: number;
    promptsMastered: number;
    averageScore: number;
    totalPracticeTime: number;
  }> {
    const [attempts, progress] = await Promise.all([
      prisma.speakingAttempt.aggregate({
        where: { userId },
        _count: true,
        _sum: { recordingTime: true },
        _avg: { overallScore: true },
      }),
      prisma.userSpeakingProgress.findMany({
        where: { userId },
        select: { status: true },
      }),
    ]);

    return {
      totalAttempts: attempts._count,
      promptsAttempted: progress.length,
      promptsMastered: progress.filter(p => p.status === 'mastered').length,
      averageScore: Math.round(attempts._avg.overallScore || 0),
      totalPracticeTime: attempts._sum.recordingTime || 0,
    };
  }

  /**
   * Get user's attempts for a prompt
   */
  async getUserAttempts(userId: string, promptId: string): Promise<SpeakingAttempt[]> {
    return prisma.speakingAttempt.findMany({
      where: { userId, promptId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Content Management
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create speaking prompt
   */
  async createPrompt(data: {
    title: string;
    level: string;
    category?: string;
    topic?: string;
    promptText: string;
    promptTextVi?: string;
    sampleResponse?: string;
    sampleAudioUrl?: string;
    targetWords?: string[];
    difficulty?: number;
  }): Promise<SpeakingPrompt> {
    return prisma.speakingPrompt.create({
      data: {
        title: data.title,
        level: data.level.toUpperCase(),
        category: data.category || 'general',
        topic: data.topic,
        promptText: data.promptText,
        promptTextVi: data.promptTextVi,
        sampleResponse: data.sampleResponse,
        sampleAudioUrl: data.sampleAudioUrl,
        targetWords: data.targetWords || [],
        difficulty: data.difficulty || 1,
        isPublished: true,
      },
    });
  }
}
