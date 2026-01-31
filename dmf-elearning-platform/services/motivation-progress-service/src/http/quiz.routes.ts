/**
 * Quiz API Routes
 * GET /api/quiz/:courseId - Get all quizzes for a course
 * POST /api/learning/verify-answer - Verify quiz answer and award XP
 */

import type { FastifyInstance } from 'fastify';
import type { QuizRepository, QuizAttempt } from '../state/in-memory-quiz.repository.js';

interface VerifyAnswerBody {
  userId: string;
  quizId: string;
  answer: string;
}

export function registerQuizRoutes(
  app: FastifyInstance,
  deps: {
    quizRepo: QuizRepository;
  }
): void {
  // GET /api/quiz/:courseId - Get quizzes for a course
  app.get<{ Params: { courseId: string } }>('/api/quiz/:courseId', async (request, reply) => {
    const { courseId } = request.params;

    try {
      const quizzes = await deps.quizRepo.findByCourseId(courseId);

      // Don't send correct answers to client
      const safeQuizzes = quizzes.map(quiz => ({
        id: quiz.id,
        courseId: quiz.courseId,
        question: quiz.question,
        options: quiz.options,
        xpReward: quiz.xpReward,
      }));

      return reply.code(200).send({ quizzes: safeQuizzes });
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch quizzes',
        },
      });
    }
  });

  // POST /api/learning/verify-answer - Verify answer and award XP
  app.post<{ Body: VerifyAnswerBody }>('/api/learning/verify-answer', async (request, reply) => {
    const { userId, quizId, answer } = request.body;

    if (!userId || !quizId || !answer) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'userId, quizId, and answer are required',
        },
      });
    }

    try {
      // 1. Find quiz
      const quiz = await deps.quizRepo.findById(quizId);
      if (!quiz) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            message: 'Quiz not found',
          },
        });
      }

      // 2. Check answer
      const isCorrect = answer === quiz.correctAnswerId;
      const xpGained = isCorrect ? quiz.xpReward : 0;

      // 3. Save attempt
      const attempt: QuizAttempt = {
        id: `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        quizId,
        selectedAnswerId: answer,
        isCorrect,
        xpGained,
        attemptedAt: new Date(),
      };

      await deps.quizRepo.saveAttempt(attempt);

      // 4. If correct, call Gamification Service to add XP
      let currentLevelStats = null;
      if (isCorrect && xpGained > 0) {
        try {
          const gamificationResponse = await fetch('http://127.0.0.1:3006/api/gamification/add-xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, amount: xpGained }),
          });

          if (gamificationResponse.ok) {
            currentLevelStats = await gamificationResponse.json();
          }
        } catch (gamificationError) {
          console.error('Failed to update gamification:', gamificationError);
          // Continue anyway - quiz verification succeeded
        }
      }

      // 5. Return result
      return reply.code(200).send({
        isCorrect,
        explanation: quiz.explanation,
        correctAnswerId: quiz.correctAnswerId,
        xpGained,
        currentLevelStats,
      });
    } catch (error) {
      console.error('Error verifying answer:', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify answer',
        },
      });
    }
  });
}
