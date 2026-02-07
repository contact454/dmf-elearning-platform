import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SubmissionService } from '../submissionService';
import { AuthService } from '../authService';
import { prisma } from '../../database/connection';

const submissionService = new SubmissionService();
const authService = new AuthService();

describe('SubmissionService', () => {
  let testUserId: string;
  let testPromptId: string;
  let testSubmissionId: string;

  beforeAll(async () => {
    // Create test user
    const testEmail = `test-submission-${Date.now()}@example.com`;
    const { user } = await authService.register(testEmail, 'TestPassword123!');
    testUserId = user.id;

    // Create test prompt
    const prompt = await prisma.speakingPrompt.create({
      data: {
        cefrLevel: 'A1',
        topic: 'daily_conversation',
        title: 'Test Prompt',
        description: 'Test description',
        questionText: 'Describe your daily routine',
        preparationTimeSeconds: 30,
        speakingTimeSeconds: 60,
        difficultyLevel: 1,
        evaluationCriteria: {
          pronunciation: { weight: 0.25, description: 'Test' },
          fluency: { weight: 0.25, description: 'Test' },
          vocabulary: { weight: 0.25, description: 'Test' },
          grammar: { weight: 0.25, description: 'Test' },
        },
      },
    });
    testPromptId = prompt.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testSubmissionId) {
      await prisma.speakingSubmission.delete({ where: { id: testSubmissionId } }).catch(() => {});
    }
    if (testPromptId) {
      await prisma.speakingPrompt.delete({ where: { id: testPromptId } }).catch(() => {});
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('createSubmission', () => {
    it('should create a new submission', async () => {
      const submission = await submissionService.createSubmission(
        testUserId,
        testPromptId,
        'https://example.com/audio.mp3',
        45.5
      );

      expect(submission).toHaveProperty('id');
      expect(submission.userId).toBe(testUserId);
      expect(submission.promptId).toBe(testPromptId);
      expect(submission.audioUrl).toBe('https://example.com/audio.mp3');
      expect(submission.status).toBe('pending');

      testSubmissionId = submission.id;
    });

    it('should throw error if prompt not found', async () => {
      await expect(
        submissionService.createSubmission(
          testUserId,
          '00000000-0000-0000-0000-000000000000',
          'https://example.com/audio.mp3',
          45.5
        )
      ).rejects.toThrow('Prompt not found');
    });
  });

  describe('getUserSubmissions', () => {
    it('should get user submissions with pagination', async () => {
      const result = await submissionService.getUserSubmissions(testUserId, {
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('getSubmission', () => {
    it('should get submission by id', async () => {
      const submission = await submissionService.getSubmission(testSubmissionId, testUserId);

      expect(submission.id).toBe(testSubmissionId);
      expect(submission.userId).toBe(testUserId);
    });

    it('should throw error if submission not found', async () => {
      await expect(
        submissionService.getSubmission('00000000-0000-0000-0000-000000000000', testUserId)
      ).rejects.toThrow('Submission not found');
    });

    it('should throw error if user does not own submission', async () => {
      const otherUser = await authService.register(`other-${Date.now()}@example.com`, 'TestPass123!');
      
      await expect(
        submissionService.getSubmission(testSubmissionId, otherUser.user.id)
      ).rejects.toThrow('Access denied');

      // Cleanup
      await prisma.user.delete({ where: { id: otherUser.user.id } }).catch(() => {});
    });
  });

  describe('updateSubmissionAnalysis', () => {
    it('should update submission with analysis results', async () => {
      const analysis = {
        transcriptText: 'Test transcript',
        overallScore: 75.5,
        pronunciationScore: 80,
        fluencyScore: 70,
        vocabularyScore: 75,
        grammarScore: 77,
        aiFeedback: {
          strengths: ['Good pronunciation'],
          weaknesses: ['Grammar needs work'],
          suggestions: ['Practice more'],
          detailedFeedback: 'Overall good performance',
        },
      };

      const updated = await submissionService.updateSubmissionAnalysis(testSubmissionId, analysis);

      expect(updated.transcriptText).toBe('Test transcript');
      expect(Number(updated.overallScore)).toBe(75.5);
      expect(updated.status).toBe('analyzed');
    });
  });
});
