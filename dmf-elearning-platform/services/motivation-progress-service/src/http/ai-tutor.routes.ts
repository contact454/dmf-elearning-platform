import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AITutorService } from '../logic/ai-tutor.service.js';

// Validation schema cho request body
const ExplainAnswerSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  userAnswer: z.string().min(1, 'User answer is required'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
});

export async function registerAITutorRoutes(app: FastifyInstance) {
  // Khởi tạo AI Tutor Service
  const aiTutorService = new AITutorService();

  /**
   * POST /api/learning/ai-explain
   * Endpoint để lấy lời giải thích từ Gia sư AI
   */
  app.post('/api/learning/ai-explain', async (request, reply) => {
    try {
      // Validate request body
      const validationResult = ExplainAnswerSchema.safeParse(request.body);

      if (!validationResult.success) {
        return reply.status(400).send({
          error: 'Validation failed',
          details: validationResult.error.errors,
        });
      }

      const { question, userAnswer, correctAnswer } = validationResult.data;

      // Gọi AI Tutor Service
      const result = await aiTutorService.explainAnswer({
        question,
        userAnswer,
        correctAnswer,
      });

      return reply.status(200).send({
        success: true,
        explanation: result.explanation,
      });
    } catch (error) {
      console.error('[AI Tutor Route] Error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      return reply.status(500).send({
        success: false,
        error: errorMessage,
      });
    }
  });

  /**
   * GET /api/learning/ai-health
   * Health check cho Ollama service
   */
  app.get('/api/learning/ai-health', async (_request, reply) => {
    try {
      const isHealthy = await aiTutorService.healthCheck();
      const modelAvailable = await aiTutorService.isModelAvailable();

      return reply.status(200).send({
        healthy: isHealthy,
        modelAvailable,
        modelName: 'llama3.2:latest',
      });
    } catch (error) {
      return reply.status(500).send({
        healthy: false,
        modelAvailable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
