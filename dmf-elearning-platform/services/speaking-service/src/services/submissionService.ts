import { prisma } from '../database/connection';
import { SpeechAnalysisService } from './speechAnalysisService';
import { Prisma } from '@prisma/client';

const speechAnalysisService = new SpeechAnalysisService();

export class SubmissionService {
  /**
   * Create a new speaking submission
   */
  async createSubmission(
    userId: string,
    promptId: string,
    audioUrl: string,
    durationSeconds: number
  ) {
    // Verify prompt exists
    const prompt = await prisma.speakingPrompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    // Create submission
    const submission = await prisma.speakingSubmission.create({
      data: {
        userId,
        promptId,
        audioUrl,
        durationSeconds: new Prisma.Decimal(durationSeconds),
        status: 'pending',
      },
      include: {
        prompt: {
          select: {
            title: true,
            cefrLevel: true,
            questionText: true,
          },
        },
      },
    });

    return submission;
  }

  /**
   * Get user's submissions with optional filters
   */
  async getUserSubmissions(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [submissions, total] = await Promise.all([
      prisma.speakingSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          prompt: {
            select: {
              title: true,
              cefrLevel: true,
              topic: true,
            },
          },
        },
      }),
      prisma.speakingSubmission.count({ where }),
    ]);

    return {
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single submission by ID (with ownership check)
   */
  async getSubmission(submissionId: string, userId: string) {
    const submission = await prisma.speakingSubmission.findUnique({
      where: { id: submissionId },
      include: {
        prompt: true,
        pronunciationFeedback: true,
      },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    if (submission.userId !== userId) {
      throw new Error('Access denied');
    }

    return submission;
  }

  /**
   * Delete submission (with ownership check)
   */
  async deleteSubmission(submissionId: string, userId: string) {
    const submission = await prisma.speakingSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    if (submission.userId !== userId) {
      throw new Error('Access denied');
    }

    await prisma.speakingSubmission.delete({
      where: { id: submissionId },
    });

    return { message: 'Submission deleted successfully' };
  }

  /**
   * Update submission with analysis results
   */
  async updateSubmissionAnalysis(
    submissionId: string,
    analysis: {
      transcriptText: string;
      overallScore: number;
      pronunciationScore: number;
      fluencyScore: number;
      vocabularyScore: number;
      grammarScore: number;
      aiFeedback: any;
      pronunciationFeedback?: any[];
    }
  ) {
    // Update submission
    const submission = await prisma.speakingSubmission.update({
      where: { id: submissionId },
      data: {
        transcriptText: analysis.transcriptText,
        overallScore: new Prisma.Decimal(analysis.overallScore),
        pronunciationScore: new Prisma.Decimal(analysis.pronunciationScore),
        fluencyScore: new Prisma.Decimal(analysis.fluencyScore),
        vocabularyScore: new Prisma.Decimal(analysis.vocabularyScore),
        grammarScore: new Prisma.Decimal(analysis.grammarScore),
        aiFeedback: analysis.aiFeedback,
        status: 'analyzed',
      },
    });

    // Create pronunciation feedback records
    if (analysis.pronunciationFeedback && analysis.pronunciationFeedback.length > 0) {
      await prisma.pronunciationFeedback.createMany({
        data: analysis.pronunciationFeedback.map((pf) => ({
          submissionId,
          word: pf.word,
          phoneme: pf.phoneme || null,
          expectedPronunciation: pf.expectedPronunciation || null,
          actualPronunciation: pf.actualPronunciation || null,
          accuracyScore: new Prisma.Decimal(pf.accuracyScore),
          feedbackText: pf.feedbackText || null,
          timestampMs: pf.timestampMs || null,
        })),
      });
    }

    return submission;
  }
}
