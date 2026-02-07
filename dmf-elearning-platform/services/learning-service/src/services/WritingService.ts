import {
  PrismaClient,
  WritingPrompt,
  WritingSubmission,
  UserWritingProgress,
} from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface WritingFilters {
  level?: string;
  category?: string;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface WritingWithProgress extends WritingPrompt {
  userProgress?: UserWritingProgress | null;
  submissionCount?: number;
}

export interface GrammarError {
  text: string;
  error: string;
  rule: string;
  correction: string;
  position: number;
}

export interface WritingCorrection {
  original: string;
  corrected: string;
  explanation: string;
  explanationVi: string;
  type: 'grammar' | 'spelling' | 'vocabulary' | 'style';
}

export interface WritingSuggestion {
  suggestion: string;
  suggestionVi: string;
  category: 'vocabulary' | 'structure' | 'expression' | 'clarity';
}

export interface WritingEvaluation {
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  coherenceScore: number;
  taskScore: number;
  feedback: string;
  feedbackVi: string;
  corrections: WritingCorrection[];
  suggestions: WritingSuggestion[];
  grammarErrors: GrammarError[];
  keywordsUsed: string[];
  keywordsMissing: string[];
}

export interface WritingStats {
  totalPrompts: number;
  byLevel: { level: string; count: number }[];
  byCategory: { category: string; count: number }[];
}

// ═══════════════════════════════════════════════════════════════
// Writing Service
// ═══════════════════════════════════════════════════════════════

export class WritingService {
  /**
   * Get writing prompts with filters
   */
  async getPrompts(filters: WritingFilters): Promise<{ items: WritingPrompt[]; total: number }> {
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
      prisma.writingPrompt.findMany({
        where,
        take: filters.limit || 20,
        skip: filters.offset || 0,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.writingPrompt.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Get single prompt by ID
   */
  async getById(id: string): Promise<WritingPrompt | null> {
    return prisma.writingPrompt.findUnique({ where: { id } });
  }

  /**
   * Get prompt with user progress
   */
  async getWithProgress(id: string, userId: string): Promise<WritingWithProgress | null> {
    const prompt = await prisma.writingPrompt.findUnique({
      where: { id },
      include: {
        progress: {
          where: { userId },
          take: 1,
        },
        submissions: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    if (!prompt) return null;

    return {
      ...prompt,
      userProgress: prompt.progress[0] || null,
      submissionCount: prompt.submissions.length,
    };
  }

  /**
   * Get featured prompts
   */
  async getFeatured(limit: number = 5): Promise<WritingPrompt[]> {
    return prisma.writingPrompt.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get writing statistics
   */
  async getStats(): Promise<WritingStats> {
    const [total, byLevel, byCategory] = await Promise.all([
      prisma.writingPrompt.count({ where: { isPublished: true } }),
      prisma.writingPrompt.groupBy({
        by: ['level'],
        where: { isPublished: true },
        _count: true,
        orderBy: { level: 'asc' },
      }),
      prisma.writingPrompt.groupBy({
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
    const result = await prisma.writingPrompt.findMany({
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
    const result = await prisma.writingPrompt.findMany({
      where: { isPublished: true },
      distinct: ['category'],
      select: { category: true },
    });
    return result.map(r => r.category);
  }

  // ═══════════════════════════════════════════════════════════════
  // Writing Submissions
  // ═══════════════════════════════════════════════════════════════

  /**
   * Submit writing with evaluation
   */
  async submitWriting(
    promptId: string,
    userId: string,
    data: {
      content: string;
      answers?: any;
      timeSpent?: number;
    }
  ): Promise<WritingSubmission> {
    // Get prompt for evaluation
    const prompt = await prisma.writingPrompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) throw new Error('Prompt not found');

    // Count words
    const wordCount = data.content.split(/\s+/).filter(Boolean).length;

    // Evaluate the submission
    const evaluation = this.evaluateWriting(data.content, prompt);

    // Get submission number
    const submissionNum = await prisma.writingSubmission.count({
      where: { promptId, userId },
    });

    // Create submission
    const submission = await prisma.writingSubmission.create({
      data: {
        promptId,
        userId,
        content: data.content,
        wordCount,
        answers: data.answers,
        timeSpent: data.timeSpent || 0,
        submissionNum: submissionNum + 1,
        overallScore: evaluation.overallScore,
        grammarScore: evaluation.grammarScore,
        vocabularyScore: evaluation.vocabularyScore,
        coherenceScore: evaluation.coherenceScore,
        taskScore: evaluation.taskScore,
        feedback: evaluation.feedback,
        feedbackVi: evaluation.feedbackVi,
        corrections: evaluation.corrections as any,
        suggestions: evaluation.suggestions as any,
        grammarErrors: evaluation.grammarErrors as any,
        keywordsUsed: evaluation.keywordsUsed,
        keywordsMissing: evaluation.keywordsMissing,
        status: 'reviewed',
      },
    });

    // Update user progress
    await this.updateProgressAfterSubmission(userId, promptId, evaluation.overallScore, wordCount, data.timeSpent || 0);

    return submission;
  }

  /**
   * Evaluate writing submission
   */
  private evaluateWriting(content: string, prompt: WritingPrompt): WritingEvaluation {
    const words = content.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Check keywords
    const keywordsUsed: string[] = [];
    const keywordsMissing: string[] = [];

    for (const keyword of prompt.keywords) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        keywordsUsed.push(keyword);
      } else {
        keywordsMissing.push(keyword);
      }
    }

    // Task completion score
    let taskScore = 60; // Base score

    // Word count check
    if (prompt.minWords > 0 && wordCount >= prompt.minWords) {
      taskScore += 15;
    } else if (prompt.minWords > 0) {
      taskScore -= 10;
    }

    if (prompt.wordLimit && wordCount <= prompt.wordLimit) {
      taskScore += 10;
    } else if (prompt.wordLimit && wordCount > prompt.wordLimit) {
      taskScore -= 10;
    }

    // Keyword usage bonus
    if (prompt.keywords.length > 0) {
      taskScore += (keywordsUsed.length / prompt.keywords.length) * 15;
    } else {
      taskScore += 15;
    }

    // Grammar analysis (simplified - in production, use AI)
    const grammarErrors = this.detectGrammarErrors(content);
    const grammarScore = Math.max(0, 100 - grammarErrors.length * 5);

    // Vocabulary score (based on word diversity and length)
    const uniqueWords = new Set(words);
    const vocabularyRatio = uniqueWords.size / Math.max(wordCount, 1);
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / Math.max(wordCount, 1);
    const vocabularyScore = Math.min(100, (vocabularyRatio * 50) + (avgWordLength * 10));

    // Coherence score (based on sentence structure)
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    const avgSentenceLength = wordCount / Math.max(sentences.length, 1);
    const coherenceScore = avgSentenceLength >= 5 && avgSentenceLength <= 20 ? 80 : 60;

    // Overall score
    const overallScore = Math.round(
      grammarScore * 0.3 +
      vocabularyScore * 0.2 +
      coherenceScore * 0.2 +
      taskScore * 0.3
    );

    // Generate corrections and suggestions
    const corrections = this.generateCorrections(content, grammarErrors);
    const suggestions = this.generateSuggestions(content, prompt, vocabularyScore, coherenceScore);

    // Generate feedback
    const { feedback, feedbackVi } = this.generateFeedback(
      overallScore,
      grammarScore,
      vocabularyScore,
      coherenceScore,
      taskScore,
      grammarErrors.length,
      keywordsMissing
    );

    return {
      overallScore,
      grammarScore: Math.round(grammarScore),
      vocabularyScore: Math.round(vocabularyScore),
      coherenceScore: Math.round(coherenceScore),
      taskScore: Math.round(taskScore),
      feedback,
      feedbackVi,
      corrections,
      suggestions,
      grammarErrors,
      keywordsUsed,
      keywordsMissing,
    };
  }

  /**
   * Simple grammar error detection
   */
  private detectGrammarErrors(content: string): GrammarError[] {
    const errors: GrammarError[] = [];

    // Common German grammar patterns to check
    const patterns = [
      { regex: /\b(ich|du|er|sie|es|wir|ihr|Sie)\s+([A-ZÄÖÜ])/g, error: 'Verb should be lowercase', rule: 'Großschreibung' },
      { regex: /\.\s*[a-zäöüß]/g, error: 'Capitalize after period', rule: 'Satzanfang' },
      { regex: /\s+,/g, error: 'No space before comma', rule: 'Kommasetzung' },
      { regex: /,(?!\s)/g, error: 'Space after comma', rule: 'Kommasetzung' },
      { regex: /\s{2,}/g, error: 'Double space', rule: 'Formatierung' },
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        errors.push({
          text: match[0],
          error: pattern.error,
          rule: pattern.rule,
          correction: '', // Would be filled by AI
          position: match.index,
        });
      }
    }

    return errors;
  }

  /**
   * Generate corrections from grammar errors
   */
  private generateCorrections(content: string, errors: GrammarError[]): WritingCorrection[] {
    return errors.slice(0, 5).map(error => ({
      original: error.text,
      corrected: error.text.trim(), // Simplified
      explanation: error.error,
      explanationVi: `Lỗi: ${error.rule}`,
      type: 'grammar' as const,
    }));
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(
    content: string,
    prompt: WritingPrompt,
    vocabScore: number,
    coherenceScore: number
  ): WritingSuggestion[] {
    const suggestions: WritingSuggestion[] = [];

    if (vocabScore < 70) {
      suggestions.push({
        suggestion: 'Try using more varied vocabulary to express your ideas.',
        suggestionVi: 'Hãy sử dụng từ vựng đa dạng hơn để diễn đạt ý tưởng của bạn.',
        category: 'vocabulary',
      });
    }

    if (coherenceScore < 70) {
      suggestions.push({
        suggestion: 'Consider varying your sentence length for better flow.',
        suggestionVi: 'Hãy thay đổi độ dài câu để bài viết mạch lạc hơn.',
        category: 'structure',
      });
    }

    if (prompt.grammarPoints.length > 0) {
      suggestions.push({
        suggestion: `Focus on using: ${prompt.grammarPoints.join(', ')}`,
        suggestionVi: `Tập trung sử dụng: ${prompt.grammarPoints.join(', ')}`,
        category: 'expression',
      });
    }

    return suggestions;
  }

  /**
   * Generate feedback message
   */
  private generateFeedback(
    overall: number,
    grammar: number,
    vocab: number,
    coherence: number,
    task: number,
    errorCount: number,
    missingKeywords: string[]
  ): { feedback: string; feedbackVi: string } {
    let feedback = '';
    let feedbackVi = '';

    if (overall >= 85) {
      feedback = 'Excellent writing! Your text is well-structured and grammatically sound.';
      feedbackVi = 'Bài viết xuất sắc! Văn bản của bạn có cấu trúc tốt và đúng ngữ pháp.';
    } else if (overall >= 70) {
      feedback = 'Good work! There are a few areas for improvement.';
      feedbackVi = 'Làm tốt lắm! Có một vài điểm cần cải thiện.';
    } else if (overall >= 50) {
      feedback = 'Nice effort! Focus on the grammar points and try to use more vocabulary.';
      feedbackVi = 'Cố gắng tốt! Tập trung vào các điểm ngữ pháp và sử dụng nhiều từ vựng hơn.';
    } else {
      feedback = 'Keep practicing! Review the grammar rules and try again.';
      feedbackVi = 'Tiếp tục luyện tập! Xem lại các quy tắc ngữ pháp và thử lại.';
    }

    if (errorCount > 3) {
      feedback += ' Pay attention to grammar and punctuation.';
      feedbackVi += ' Chú ý đến ngữ pháp và dấu câu.';
    }

    if (missingKeywords.length > 0 && missingKeywords.length <= 3) {
      feedback += ` Try to include: ${missingKeywords.join(', ')}.`;
      feedbackVi += ` Hãy bao gồm: ${missingKeywords.join(', ')}.`;
    }

    return { feedback, feedbackVi };
  }

  // ═══════════════════════════════════════════════════════════════
  // User Progress
  // ═══════════════════════════════════════════════════════════════

  /**
   * Update progress after submission
   */
  private async updateProgressAfterSubmission(
    userId: string,
    promptId: string,
    score: number,
    wordCount: number,
    timeSpent: number
  ): Promise<void> {
    const existing = await prisma.userWritingProgress.findUnique({
      where: { userId_promptId: { userId, promptId } },
    });

    if (existing) {
      await prisma.userWritingProgress.update({
        where: { userId_promptId: { userId, promptId } },
        data: {
          submissionCount: { increment: 1 },
          lastScore: score,
          bestScore: Math.max(existing.bestScore, score),
          totalWordsWritten: { increment: wordCount },
          totalTimeSpent: { increment: timeSpent },
          status: score >= 80 ? 'mastered' : score >= 50 ? 'completed' : 'in_progress',
          lastSubmissionAt: new Date(),
          draftContent: null,
          draftUpdatedAt: null,
        },
      });
    } else {
      await prisma.userWritingProgress.create({
        data: {
          userId,
          promptId,
          submissionCount: 1,
          lastScore: score,
          bestScore: score,
          totalWordsWritten: wordCount,
          totalTimeSpent: timeSpent,
          status: score >= 80 ? 'mastered' : score >= 50 ? 'completed' : 'in_progress',
          firstSubmissionAt: new Date(),
          lastSubmissionAt: new Date(),
        },
      });
    }
  }

  /**
   * Save draft
   */
  async saveDraft(userId: string, promptId: string, content: string): Promise<UserWritingProgress> {
    return prisma.userWritingProgress.upsert({
      where: { userId_promptId: { userId, promptId } },
      update: {
        draftContent: content,
        draftUpdatedAt: new Date(),
        status: 'in_progress',
      },
      create: {
        userId,
        promptId,
        draftContent: content,
        draftUpdatedAt: new Date(),
        status: 'in_progress',
      },
    });
  }

  /**
   * Get user's draft
   */
  async getDraft(userId: string, promptId: string): Promise<string | null> {
    const progress = await prisma.userWritingProgress.findUnique({
      where: { userId_promptId: { userId, promptId } },
      select: { draftContent: true },
    });
    return progress?.draftContent || null;
  }

  /**
   * Get user's writing history
   */
  async getUserHistory(
    userId: string,
    status?: string
  ): Promise<Array<UserWritingProgress & { prompt: WritingPrompt }>> {
    const where: any = { userId };
    if (status) where.status = status;

    return prisma.userWritingProgress.findMany({
      where,
      include: { prompt: true },
      orderBy: { lastSubmissionAt: 'desc' },
    });
  }

  /**
   * Get user's writing statistics
   */
  async getUserStats(userId: string): Promise<{
    totalSubmissions: number;
    promptsAttempted: number;
    promptsMastered: number;
    averageScore: number;
    totalWordsWritten: number;
    totalTimeSpent: number;
  }> {
    const [submissions, progress] = await Promise.all([
      prisma.writingSubmission.aggregate({
        where: { userId },
        _count: true,
        _sum: { wordCount: true, timeSpent: true },
        _avg: { overallScore: true },
      }),
      prisma.userWritingProgress.findMany({
        where: { userId },
        select: { status: true, totalWordsWritten: true },
      }),
    ]);

    return {
      totalSubmissions: submissions._count,
      promptsAttempted: progress.length,
      promptsMastered: progress.filter(p => p.status === 'mastered').length,
      averageScore: Math.round(submissions._avg.overallScore || 0),
      totalWordsWritten: submissions._sum.wordCount || 0,
      totalTimeSpent: submissions._sum.timeSpent || 0,
    };
  }

  /**
   * Get user's submissions for a prompt
   */
  async getUserSubmissions(userId: string, promptId: string): Promise<WritingSubmission[]> {
    return prisma.writingSubmission.findMany({
      where: { userId, promptId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Content Management
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create writing prompt
   */
  async createPrompt(data: {
    title: string;
    level: string;
    category?: string;
    topic?: string;
    promptText: string;
    promptTextVi?: string;
    instructions?: string;
    instructionsVi?: string;
    sampleResponse?: string;
    sampleResponseVi?: string;
    keywords?: string[];
    grammarPoints?: string[];
    minWords?: number;
    wordLimit?: number;
    difficulty?: number;
  }): Promise<WritingPrompt> {
    return prisma.writingPrompt.create({
      data: {
        title: data.title,
        level: data.level.toUpperCase(),
        category: data.category || 'free_writing',
        topic: data.topic,
        promptText: data.promptText,
        promptTextVi: data.promptTextVi,
        instructions: data.instructions,
        instructionsVi: data.instructionsVi,
        sampleResponse: data.sampleResponse,
        sampleResponseVi: data.sampleResponseVi,
        keywords: data.keywords || [],
        grammarPoints: data.grammarPoints || [],
        minWords: data.minWords || 0,
        wordLimit: data.wordLimit,
        difficulty: data.difficulty || 1,
        isPublished: true,
      },
    });
  }

  /**
   * Seed sample writing prompts
   */
  async seedPrompts(): Promise<number> {
    const samplePrompts = [
      {
        title: 'Stellen Sie sich vor',
        level: 'A1',
        category: 'free_writing',
        topic: 'Einführung',
        promptText: 'Schreiben Sie einen kurzen Text über sich selbst. Wer sind Sie? Woher kommen Sie? Was machen Sie?',
        promptTextVi: 'Viết một đoạn văn ngắn về bản thân. Bạn là ai? Bạn đến từ đâu? Bạn làm gì?',
        instructions: 'Schreiben Sie mindestens 30 Wörter. Verwenden Sie die Verben "sein", "kommen" und "machen".',
        instructionsVi: 'Viết ít nhất 30 từ. Sử dụng các động từ "sein", "kommen" và "machen".',
        sampleResponse: 'Ich heiße Anna. Ich komme aus Vietnam. Ich bin Studentin und lerne Deutsch. Ich wohne in Hanoi. Ich mag Musik und lese gern Bücher.',
        keywords: ['ich', 'bin', 'komme', 'mache'],
        grammarPoints: ['Präsens', 'sein', 'Personalpronomen'],
        minWords: 30,
        wordLimit: 100,
        difficulty: 1,
        isFeatured: true,
      },
      {
        title: 'Meine Familie',
        level: 'A1',
        category: 'free_writing',
        topic: 'Familie',
        promptText: 'Beschreiben Sie Ihre Familie. Wie viele Personen gibt es? Wer sind sie?',
        promptTextVi: 'Mô tả gia đình của bạn. Có bao nhiêu người? Họ là ai?',
        instructions: 'Verwenden Sie Familienbezeichnungen: Mutter, Vater, Bruder, Schwester, etc.',
        instructionsVi: 'Sử dụng các từ chỉ quan hệ gia đình: Mutter, Vater, Bruder, Schwester, v.v.',
        sampleResponse: 'Meine Familie hat fünf Personen. Mein Vater heißt Peter. Meine Mutter heißt Maria. Ich habe einen Bruder und eine Schwester.',
        keywords: ['Familie', 'Mutter', 'Vater'],
        grammarPoints: ['Possessivartikel', 'haben'],
        minWords: 40,
        wordLimit: 120,
        difficulty: 1,
        isFeatured: true,
      },
      {
        title: 'Ein Brief an einen Freund',
        level: 'A2',
        category: 'free_writing',
        topic: 'Kommunikation',
        promptText: 'Schreiben Sie einen informellen Brief an einen Freund. Erzählen Sie von Ihrem letzten Wochenende.',
        promptTextVi: 'Viết một bức thư không trang trọng cho một người bạn. Kể về cuối tuần vừa qua của bạn.',
        instructions: 'Beginnen Sie mit "Lieber/Liebe..." und enden Sie mit "Viele Grüße". Verwenden Sie das Perfekt.',
        instructionsVi: 'Bắt đầu bằng "Lieber/Liebe..." và kết thúc bằng "Viele Grüße". Sử dụng thì Perfekt.',
        sampleResponse: 'Lieber Max,\n\nwie geht es dir? Am Wochenende bin ich mit meiner Familie in den Park gegangen. Wir haben ein Picknick gemacht und viel gelacht.\n\nViele Grüße,\nAnna',
        keywords: ['Lieber', 'Wochenende', 'Grüße'],
        grammarPoints: ['Perfekt', 'Akkusativ'],
        minWords: 60,
        wordLimit: 150,
        difficulty: 2,
        isFeatured: true,
      },
      {
        title: 'Satzergänzung: Tagesablauf',
        level: 'A1',
        category: 'fill_blank',
        topic: 'Alltag',
        promptText: 'Ergänzen Sie die Sätze mit den richtigen Verben.',
        promptTextVi: 'Điền các động từ đúng vào câu.',
        templateText: 'Ich ___ um 7 Uhr auf. Dann ___ ich Frühstück. Um 8 Uhr ___ ich zur Arbeit. Abends ___ ich fern.',
        correctAnswers: [
          ['stehe', 'wache'],
          ['esse', 'nehme', 'mache'],
          ['gehe', 'fahre'],
          ['sehe', 'schaue']
        ],
        instructions: 'Verwenden Sie: aufstehen, essen, gehen/fahren, fernsehen',
        instructionsVi: 'Sử dụng: aufstehen, essen, gehen/fahren, fernsehen',
        keywords: ['aufstehen', 'essen', 'gehen', 'fernsehen'],
        grammarPoints: ['trennbare Verben', 'Präsens'],
        difficulty: 1,
      },
      {
        title: 'Meine Meinung zum Thema Umwelt',
        level: 'B1',
        category: 'essay',
        topic: 'Umwelt',
        promptText: 'Schreiben Sie Ihre Meinung zum Thema Umweltschutz. Was können wir tun, um die Umwelt zu schützen?',
        promptTextVi: 'Viết ý kiến của bạn về chủ đề bảo vệ môi trường. Chúng ta có thể làm gì để bảo vệ môi trường?',
        instructions: 'Schreiben Sie einen strukturierten Text mit Einleitung, Hauptteil und Schluss. Mindestens 100 Wörter.',
        instructionsVi: 'Viết một văn bản có cấu trúc với mở bài, thân bài và kết luận. Ít nhất 100 từ.',
        sampleResponse: 'Der Umweltschutz ist heute sehr wichtig. Ich denke, dass jeder von uns etwas tun kann. Zum Beispiel können wir weniger Plastik benutzen und mehr recyceln. Außerdem sollten wir öfter mit dem Fahrrad fahren statt mit dem Auto. Meiner Meinung nach ist es auch wichtig, Energie zu sparen. Wenn wir alle zusammenarbeiten, können wir unsere Umwelt schützen.',
        keywords: ['Umwelt', 'Meinung', 'können', 'sollten'],
        grammarPoints: ['Konjunktiv II', 'Nebensätze', 'dass-Sätze'],
        minWords: 100,
        wordLimit: 250,
        difficulty: 3,
        isFeatured: true,
      },
    ];

    let created = 0;
    for (const prompt of samplePrompts) {
      const existing = await prisma.writingPrompt.findFirst({
        where: { title: prompt.title },
      });

      if (!existing) {
        await prisma.writingPrompt.create({
          data: {
            ...prompt,
            correctAnswers: prompt.correctAnswers as any,
            isPublished: true,
          },
        });
        created++;
      }
    }

    return created;
  }
}
