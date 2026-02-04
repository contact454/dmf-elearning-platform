import {
  PrismaClient,
  ListeningContent,
  UserListeningProgress,
  DictationExercise,
  DictationAttempt,
} from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface ListeningFilters {
  level?: string;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListeningWithProgress extends ListeningContent {
  userProgress?: UserListeningProgress | null;
  exerciseCount?: number;
}

export interface DictationMistake {
  expected: string;
  actual: string;
  position: number;
  type: 'missing' | 'extra' | 'wrong';
}

export interface ListeningStats {
  totalContent: number;
  byLevel: { level: string; count: number }[];
  totalDuration: number;
}

// ═══════════════════════════════════════════════════════════════
// Listening Service
// ═══════════════════════════════════════════════════════════════

export class ListeningService {
  /**
   * Get listening content with filters
   */
  async getContent(filters: ListeningFilters): Promise<{ items: ListeningContent[]; total: number }> {
    const where: any = { isPublished: true };

    if (filters.level) {
      where.level = filters.level.toUpperCase();
    }
    if (filters.topic) {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.listeningContent.findMany({
        where,
        take: filters.limit || 20,
        skip: filters.offset || 0,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.listeningContent.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Get single listening content by ID
   */
  async getById(id: string): Promise<ListeningContent | null> {
    return prisma.listeningContent.findUnique({ where: { id } });
  }

  /**
   * Get listening content with user progress
   */
  async getWithProgress(id: string, userId: string): Promise<ListeningWithProgress | null> {
    const content = await prisma.listeningContent.findUnique({
      where: { id },
      include: {
        progress: {
          where: { userId },
          take: 1,
        },
        exercises: {
          select: { id: true },
        },
      },
    });

    if (!content) return null;

    return {
      ...content,
      userProgress: content.progress[0] || null,
      exerciseCount: content.exercises.length,
    };
  }

  /**
   * Get featured listening content
   */
  async getFeatured(limit: number = 5): Promise<ListeningContent[]> {
    return prisma.listeningContent.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get listening statistics
   */
  async getStats(): Promise<ListeningStats> {
    const [total, byLevel, durationSum] = await Promise.all([
      prisma.listeningContent.count({ where: { isPublished: true } }),
      prisma.listeningContent.groupBy({
        by: ['level'],
        where: { isPublished: true },
        _count: true,
        orderBy: { level: 'asc' },
      }),
      prisma.listeningContent.aggregate({
        where: { isPublished: true },
        _sum: { duration: true },
      }),
    ]);

    return {
      totalContent: total,
      byLevel: byLevel.map(l => ({ level: l.level, count: l._count })),
      totalDuration: durationSum._sum.duration || 0,
    };
  }

  /**
   * Get available levels
   */
  async getLevels(): Promise<string[]> {
    const result = await prisma.listeningContent.findMany({
      where: { isPublished: true },
      distinct: ['level'],
      select: { level: true },
      orderBy: { level: 'asc' },
    });
    return result.map(r => r.level);
  }

  // ═══════════════════════════════════════════════════════════════
  // Dictation Exercises
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get exercises for a content
   */
  async getExercises(contentId: string): Promise<DictationExercise[]> {
    return prisma.dictationExercise.findMany({
      where: { contentId },
      orderBy: { segmentIndex: 'asc' },
    });
  }

  /**
   * Get single exercise by ID
   */
  async getExerciseById(exerciseId: string): Promise<DictationExercise | null> {
    return prisma.dictationExercise.findUnique({
      where: { id: exerciseId },
    });
  }

  /**
   * Submit dictation attempt
   */
  async submitAttempt(
    exerciseId: string,
    userId: string,
    data: {
      userText: string;
      accuracy: number;
      wordsCorrect: number;
      wordsTotal: number;
      mistakes: DictationMistake[];
      listenCount: number;
      timeSpent: number;
    }
  ): Promise<DictationAttempt> {
    const attempt = await prisma.dictationAttempt.create({
      data: {
        exerciseId,
        userId,
        userText: data.userText,
        accuracy: data.accuracy,
        wordsCorrect: data.wordsCorrect,
        wordsTotal: data.wordsTotal,
        mistakes: data.mistakes as any,
        listenCount: data.listenCount,
        timeSpent: data.timeSpent,
      },
    });

    // Update user progress
    const exercise = await prisma.dictationExercise.findUnique({
      where: { id: exerciseId },
      select: { contentId: true },
    });

    if (exercise) {
      await this.updateProgressAfterAttempt(userId, exercise.contentId);
    }

    return attempt;
  }

  /**
   * Get user's attempts for an exercise
   */
  async getUserAttempts(userId: string, exerciseId: string): Promise<DictationAttempt[]> {
    return prisma.dictationAttempt.findMany({
      where: { userId, exerciseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // User Progress
  // ═══════════════════════════════════════════════════════════════

  /**
   * Start listening content
   */
  async startListening(userId: string, contentId: string): Promise<UserListeningProgress> {
    return prisma.userListeningProgress.upsert({
      where: { userId_contentId: { userId, contentId } },
      update: {
        status: 'in_progress',
        playCount: { increment: 1 },
        startedAt: new Date(),
      },
      create: {
        userId,
        contentId,
        status: 'in_progress',
        playCount: 1,
        startedAt: new Date(),
      },
    });
  }

  /**
   * Update listening progress
   */
  async updateProgress(
    userId: string,
    contentId: string,
    data: {
      totalListenTime?: number;
      lastPosition?: number;
      playCount?: number;
    }
  ): Promise<UserListeningProgress> {
    const updateData: any = {};

    if (data.totalListenTime !== undefined) {
      updateData.totalListenTime = data.totalListenTime;
    }
    if (data.lastPosition !== undefined) {
      updateData.lastPosition = data.lastPosition;
    }
    if (data.playCount !== undefined) {
      updateData.playCount = { increment: data.playCount };
    }

    return prisma.userListeningProgress.update({
      where: { userId_contentId: { userId, contentId } },
      data: updateData,
    });
  }

  /**
   * Update progress after dictation attempt
   */
  private async updateProgressAfterAttempt(userId: string, contentId: string): Promise<void> {
    // Count completed exercises and calculate average accuracy
    const exercises = await prisma.dictationExercise.findMany({
      where: { contentId },
      select: { id: true },
    });

    const exerciseIds = exercises.map(e => e.id);

    const attempts = await prisma.dictationAttempt.findMany({
      where: {
        userId,
        exerciseId: { in: exerciseIds },
      },
      distinct: ['exerciseId'],
      orderBy: { createdAt: 'desc' },
      select: {
        exerciseId: true,
        accuracy: true,
      },
    });

    const completedCount = attempts.length;
    const avgAccuracy = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length
      : 0;

    const isCompleted = completedCount >= exercises.length;

    await prisma.userListeningProgress.upsert({
      where: { userId_contentId: { userId, contentId } },
      update: {
        exercisesCompleted: completedCount,
        exercisesTotal: exercises.length,
        averageAccuracy: avgAccuracy,
        status: isCompleted ? 'completed' : 'in_progress',
        completedAt: isCompleted ? new Date() : undefined,
      },
      create: {
        userId,
        contentId,
        status: isCompleted ? 'completed' : 'in_progress',
        exercisesCompleted: completedCount,
        exercisesTotal: exercises.length,
        averageAccuracy: avgAccuracy,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });
  }

  /**
   * Get user's listening history
   */
  async getUserHistory(
    userId: string,
    status?: string
  ): Promise<Array<UserListeningProgress & { content: ListeningContent }>> {
    const where: any = { userId };
    if (status) where.status = status;

    return prisma.userListeningProgress.findMany({
      where,
      include: { content: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get user's listening statistics
   */
  async getUserStats(userId: string): Promise<{
    totalListened: number;
    completed: number;
    inProgress: number;
    totalTime: number;
    averageAccuracy: number;
  }> {
    const progress = await prisma.userListeningProgress.findMany({
      where: { userId },
      select: {
        status: true,
        totalListenTime: true,
        averageAccuracy: true,
      },
    });

    const completed = progress.filter(p => p.status === 'completed').length;
    const inProgress = progress.filter(p => p.status === 'in_progress').length;
    const totalTime = progress.reduce((sum, p) => sum + p.totalListenTime, 0);
    const avgAccuracy = progress.length > 0
      ? progress.reduce((sum, p) => sum + p.averageAccuracy, 0) / progress.length
      : 0;

    return {
      totalListened: progress.length,
      completed,
      inProgress,
      totalTime,
      averageAccuracy: Math.round(avgAccuracy),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Content Management
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create listening content
   */
  async createContent(data: {
    title: string;
    description?: string;
    level: string;
    topic?: string;
    audioUrl?: string;
    duration?: number;
    transcript: string;
    transcriptVi?: string;
    segments?: any;
    source?: string;
    speaker?: string;
  }): Promise<ListeningContent> {
    // Count words in transcript
    const wordCount = data.transcript.split(/\s+/).filter(w => w.length > 0).length;

    return prisma.listeningContent.create({
      data: {
        title: data.title,
        description: data.description,
        level: data.level.toUpperCase(),
        topic: data.topic,
        audioUrl: data.audioUrl,
        duration: data.duration || 0,
        transcript: data.transcript,
        transcriptVi: data.transcriptVi,
        segments: data.segments,
        source: data.source,
        speaker: data.speaker,
        wordCount,
        isPublished: true,
      },
    });
  }

  /**
   * Create dictation exercise for content
   */
  async createExercise(
    contentId: string,
    data: {
      exerciseType?: string;
      segmentIndex?: number;
      audioStart?: number;
      audioEnd?: number;
      correctText: string;
      hints?: string[];
      difficulty?: number;
    }
  ): Promise<DictationExercise> {
    return prisma.dictationExercise.create({
      data: {
        contentId,
        exerciseType: data.exerciseType || 'full',
        segmentIndex: data.segmentIndex,
        audioStart: data.audioStart || 0,
        audioEnd: data.audioEnd,
        correctText: data.correctText,
        hints: data.hints || [],
        difficulty: data.difficulty || 1,
      },
    });
  }

  /**
   * Generate exercises from transcript segments
   */
  async generateExercisesFromSegments(contentId: string): Promise<DictationExercise[]> {
    const content = await prisma.listeningContent.findUnique({
      where: { id: contentId },
      select: { segments: true, transcript: true },
    });

    if (!content) throw new Error('Content not found');

    const exercises: DictationExercise[] = [];

    if (content.segments && Array.isArray(content.segments)) {
      // Create exercise for each segment
      for (let i = 0; i < (content.segments as any[]).length; i++) {
        const segment = (content.segments as any[])[i];
        const exercise = await this.createExercise(contentId, {
          exerciseType: 'segment',
          segmentIndex: i,
          audioStart: segment.start,
          audioEnd: segment.end,
          correctText: segment.text,
          difficulty: Math.min(5, Math.ceil(segment.text.split(' ').length / 5)),
        });
        exercises.push(exercise);
      }
    } else {
      // Create single exercise for full transcript
      const exercise = await this.createExercise(contentId, {
        exerciseType: 'full',
        correctText: content.transcript,
        difficultyScore: 3,
      });
      exercises.push(exercise);
    }

    return exercises;
  }

  /**
   * Seed sample listening content
   */
  async seedContent(): Promise<number> {
    const sampleContent = [
      {
        title: 'Begrüßungen und Vorstellungen',
        description: 'Lernen Sie grundlegende Begrüßungen auf Deutsch.',
        level: 'A1',
        topic: 'Alltag',
        transcript: 'Hallo! Guten Tag! Ich heiße Anna. Wie heißt du? Freut mich, dich kennenzulernen.',
        audioUrl: null,
        duration: 15,
        difficultyScore: 1,
        segments: [
          { start: 0, end: 3, text: 'Hallo! Guten Tag!' },
          { start: 3, end: 8, text: 'Ich heiße Anna.' },
          { start: 8, end: 12, text: 'Wie heißt du?' },
          { start: 12, end: 15, text: 'Freut mich, dich kennenzulernen.' },
        ],
      },
      {
        title: 'Im Supermarkt einkaufen',
        description: 'Ein kurzes Gespräch beim Einkaufen.',
        level: 'A1',
        topic: 'Einkaufen',
        transcript: 'Guten Tag! Ich möchte bitte zwei Kilo Äpfel. Das macht drei Euro fünfzig. Hier bitte. Danke schön! Auf Wiedersehen!',
        audioUrl: null,
        duration: 20,
        difficultyScore: 1,
        segments: [
          { start: 0, end: 5, text: 'Guten Tag! Ich möchte bitte zwei Kilo Äpfel.' },
          { start: 5, end: 10, text: 'Das macht drei Euro fünfzig.' },
          { start: 10, end: 15, text: 'Hier bitte. Danke schön!' },
          { start: 15, end: 20, text: 'Auf Wiedersehen!' },
        ],
      },
      {
        title: 'Mein Tagesablauf',
        description: 'Eine Person erzählt von ihrem typischen Tag.',
        level: 'A2',
        topic: 'Alltag',
        transcript: 'Ich stehe jeden Tag um sieben Uhr auf. Dann dusche ich und esse Frühstück. Um acht Uhr fahre ich zur Arbeit. Ich arbeite von neun bis fünf. Nach der Arbeit gehe ich einkaufen oder treffe Freunde.',
        audioUrl: null,
        duration: 30,
        difficultyScore: 2,
        segments: [
          { start: 0, end: 8, text: 'Ich stehe jeden Tag um sieben Uhr auf.' },
          { start: 8, end: 14, text: 'Dann dusche ich und esse Frühstück.' },
          { start: 14, end: 20, text: 'Um acht Uhr fahre ich zur Arbeit.' },
          { start: 20, end: 25, text: 'Ich arbeite von neun bis fünf.' },
          { start: 25, end: 30, text: 'Nach der Arbeit gehe ich einkaufen oder treffe Freunde.' },
        ],
      },
      {
        title: 'Das Wetter in Deutschland',
        description: 'Ein Wetterbericht für die kommende Woche.',
        level: 'A2',
        topic: 'Wetter',
        transcript: 'Heute ist es sonnig und warm. Die Temperatur liegt bei fünfundzwanzig Grad. Morgen wird es bewölkt mit leichtem Regen. Am Wochenende erwarten wir wieder Sonnenschein.',
        audioUrl: null,
        duration: 25,
        difficultyScore: 2,
        segments: [
          { start: 0, end: 7, text: 'Heute ist es sonnig und warm.' },
          { start: 7, end: 14, text: 'Die Temperatur liegt bei fünfundzwanzig Grad.' },
          { start: 14, end: 20, text: 'Morgen wird es bewölkt mit leichtem Regen.' },
          { start: 20, end: 25, text: 'Am Wochenende erwarten wir wieder Sonnenschein.' },
        ],
      },
      {
        title: 'Ein Telefongespräch',
        description: 'Ein Telefongespräch zwischen zwei Kollegen.',
        level: 'B1',
        topic: 'Arbeit',
        transcript: 'Hallo, hier ist Müller. Guten Tag, Herr Müller. Hier spricht Schmidt von der Firma Bauer. Ich rufe an wegen unseres Termins morgen. Leider muss ich den Termin verschieben. Könnten wir uns stattdessen am Donnerstag treffen?',
        audioUrl: null,
        duration: 35,
        difficultyScore: 3,
        segments: [
          { start: 0, end: 8, text: 'Hallo, hier ist Müller. Guten Tag, Herr Müller.' },
          { start: 8, end: 16, text: 'Hier spricht Schmidt von der Firma Bauer.' },
          { start: 16, end: 24, text: 'Ich rufe an wegen unseres Termins morgen.' },
          { start: 24, end: 30, text: 'Leider muss ich den Termin verschieben.' },
          { start: 30, end: 35, text: 'Könnten wir uns stattdessen am Donnerstag treffen?' },
        ],
      },
    ];

    let count = 0;
    for (const content of sampleContent) {
      const exists = await prisma.listeningContent.findFirst({
        where: { title: content.title },
      });

      if (!exists) {
        await prisma.listeningContent.create({
          data: {
            ...content,
            vocabularyList: [],
            isPublished: true,
            isFeatured: count < 2,
          },
        });
        count++;
      }
    }

    return count;
  }
}
