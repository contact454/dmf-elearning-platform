/**
 * Command Endpoints (Điểm cuối Lệnh)
 * HTTP routes for learning commands
 */

import type { FastifyInstance } from 'fastify';
import { commandRegistry } from '@dmf/contracts';
import type { LearningLessonStartCommand, LearningLessonCompleteCommand, LearningLessonAbandonCommand, LearningActivitySubmitCommand } from '@dmf/contracts';
import { handleLearningLessonStart } from '../application/handlers/learningLessonStart';
import { handleLearningLessonComplete } from '../application/handlers/learningLessonComplete';
import { handleLearningLessonAbandon } from '../application/handlers/learningLessonAbandon';
import { handleLearningActivitySubmit } from '../application/handlers/learningActivitySubmit';
import type { EventBus } from '@dmf/infra';
import type { AuditLogger } from '@dmf/infra';

interface ServiceContext {
  logger: AuditLogger;
  eventEmitter: EventBus;
}

export function setupCommandRoutes(server: FastifyInstance, context: ServiceContext): void {
  // POST /api/learning/lesson/start
  server.post('/api/learning/lesson/start', async (request, reply) => {
    try {
      const authUser = (request as any).user as { userId?: string; role?: string } | undefined;
      const schema = commandRegistry['learning.lesson.start'];
      const parsed = schema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.message });
      }
      const command = parsed.data as LearningLessonStartCommand;
      
      const result = await handleLearningLessonStart(command, {
        userId: authUser?.userId || '',
        role: authUser?.role || '',
        logger: context.logger,
        eventEmitter: context.eventEmitter,
      });
      
      return reply.code(201).send(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(400).send({ error: message });
    }
  });

  // POST /api/learning/lesson/complete
  server.post('/api/learning/lesson/complete', async (request, reply) => {
    try {
      const authUser = (request as any).user as { userId?: string; role?: string } | undefined;
      const schema = commandRegistry['learning.lesson.complete'];
      const parsed = schema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.message });
      }
      const command = parsed.data as LearningLessonCompleteCommand;
      
      const result = await handleLearningLessonComplete(command, {
        userId: authUser?.userId || '',
        role: authUser?.role || '',
        logger: context.logger,
        eventEmitter: context.eventEmitter,
      });
      
      return reply.code(200).send(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(400).send({ error: message });
    }
  });

  // POST /api/learning/lesson/abandon
  server.post('/api/learning/lesson/abandon', async (request, reply) => {
    try {
      const authUser = (request as any).user as { userId?: string; role?: string } | undefined;
      const schema = commandRegistry['learning.lesson.abandon'];
      const parsed = schema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.message });
      }
      const command = parsed.data as LearningLessonAbandonCommand;
      
      const result = await handleLearningLessonAbandon(command, {
        userId: authUser?.userId || '',
        role: authUser?.role || '',
        logger: context.logger,
        eventEmitter: context.eventEmitter,
      });
      
      return reply.code(200).send(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(400).send({ error: message });
    }
  });

  // POST /api/learning/activity/submit
  server.post('/api/learning/activity/submit', async (request, reply) => {
    try {
      const authUser = (request as any).user as { userId?: string; role?: string } | undefined;
      const schema = commandRegistry['learning.activity.submit'];
      const parsed = schema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.message });
      }
      const command = parsed.data as LearningActivitySubmitCommand;
      
      const result = await handleLearningActivitySubmit(command, {
        userId: authUser?.userId || '',
        role: authUser?.role || '',
        logger: context.logger,
        eventEmitter: context.eventEmitter,
      });
      
      return reply.code(201).send(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(400).send({ error: message });
    }
  });
}
