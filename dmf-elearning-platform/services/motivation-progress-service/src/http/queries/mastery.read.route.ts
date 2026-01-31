/**
 * GET /api/read/mastery/:userId – internal read model.
 * GET /api/learner/mastery – learner-scoped (userId from query or auth).
 * Uses in-memory MasteryState. Returns 0–100 scale for backward compat with dashboard.
 */

import type { FastifyInstance } from 'fastify';
import type { MasteryStateRepository } from '../../state/in-memory-mastery.repository.js';
import type { SkillScoreRepository } from '../../state/in-memory-skillscore.repository.js';
import type { Logger } from '@dmf/infra';
import { makeNotFound, getHttpStatusCode, type StandardError } from '@dmf/shared';
import type { MasteryState } from '../../state/models.js';

function toDto(state: MasteryState): Record<string, unknown> {
  const sb: Record<string, number> = {};
  for (const [k, v] of Object.entries(state.skillBreakdown)) {
    sb[k] = Math.round((v ?? 0) * 100);
  }
  return {
    userId: state.userId,
    overallScore: Math.round(state.overallScore * 100),
    skillBreakdown: sb,
    lessonMastery: state.lessonMastery,
    version: state.version,
    lastCalculatedAt: state.updatedAt,
  };
}

export function registerMasteryReadRoute(
  app: FastifyInstance,
  deps: {
    masteryRepo: MasteryStateRepository;
    skillScoreRepo: SkillScoreRepository;
    logger: Logger;
  }
): void {
  app.get<{ Params: { userId: string } }>('/api/read/mastery/:userId', async (request, reply) => {
    const userId = request.params.userId as import('@dmf/shared').UserId;
    try {
      const state = await deps.masteryRepo.findByUserId(userId);
      if (!state) {
        const err = makeNotFound('MasteryState', userId);
        return reply.code(404).send({ error: err });
      }
      return reply.code(200).send(toDto(state));
    } catch (e) {
      deps.logger.error('MasteryState read failed', e as Error, { userId });
      const se = (e as { standardError?: StandardError }).standardError;
      if (se) return reply.code(getHttpStatusCode(se)).send({ error: se });
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: (e as Error).message || 'Internal server error',
        },
      });
    }
  });

  app.get<{ Querystring: { userId?: string } }>('/api/learner/mastery', async (request, reply) => {
    const userId =
      (request.query as { userId?: string }).userId ??
      (request as unknown as { user?: { userId?: string } }).user?.userId ??
      '';
    if (!userId) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          category: 'ClientError',
          message: 'userId required (query or auth)',
        },
      });
    }
    try {
      const state = await deps.masteryRepo.findByUserId(userId as import('@dmf/shared').UserId);
      if (!state) {
        const err = makeNotFound('MasteryState', userId);
        return reply.code(404).send({ error: err });
      }
      return reply.code(200).send({ mastery: toDto(state) });
    } catch (e) {
      deps.logger.error('Learner mastery read failed', e as Error, { userId });
      const se = (e as { standardError?: StandardError }).standardError;
      if (se) return reply.code(getHttpStatusCode(se)).send({ error: se });
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: (e as Error).message || 'Internal server error',
        },
      });
    }
  });
}
