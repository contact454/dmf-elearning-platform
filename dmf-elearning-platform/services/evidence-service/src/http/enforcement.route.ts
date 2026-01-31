/**
 * Enforcement Routes (Policy Toggle & Ops Control)
 * 
 * GET /api/ops/evidence/enforcement
 * PATCH /api/ops/evidence/enforcement
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger, EventBus, AuditLogger } from '@dmf/infra';
import { getEvidencePolicyRegistry, checkProgressAllowed } from '@dmf/evidence';
import type { EnforcementLevel, EnforcementAction } from '@dmf/evidence';

export function registerEnforcementRoutes(
  app: FastifyInstance,
  deps: { logger: Logger; eventBus: EventBus; auditLogger: AuditLogger }
) {
  // Get current enforcement level
  app.get('/api/ops/evidence/enforcement', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const registry = getEvidencePolicyRegistry();
      const level = registry.getEnforcementLevel();
      const policies = registry.getAllPolicies();

      return reply.code(200).send({
        enforcementLevel: level,
        policies: policies.map((p) => ({
          id: p.id,
          scope: p.scope,
          action: p.action,
          requiredEvidence: p.requiredEvidence,
          description: p.description,
        })),
      });
    } catch (error: any) {
      deps.logger.error('Get enforcement config failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });

  // Update enforcement level (runtime toggle)
  app.patch('/api/ops/evidence/enforcement', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const actorUserId = (request as any).requestContext?.userId || 'admin-system';

    try {
      const level = body.enforcementLevel as EnforcementLevel;

      if (!level || !['observe', 'soft_gate', 'hard_gate'].includes(level)) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            category: 'ClientError',
            message: 'enforcementLevel must be one of: observe, soft_gate, hard_gate',
          },
        });
      }

      const registry = getEvidencePolicyRegistry();
      registry.setEnforcementLevel(level);

      // Audit log
      deps.auditLogger.logCommandReceived('evidence.enforcement.update', actorUserId, level);

      return reply.code(200).send({
        enforcementLevel: level,
        message: `Enforcement level updated to ${level}`,
      });
    } catch (error: any) {
      deps.logger.error('Update enforcement config failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });

  // Check progress allowed (for testing/debugging)
  app.post('/api/ops/evidence/check', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;

    try {
      if (!body.userId || !body.action) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            category: 'ClientError',
            message: 'userId and action are required',
          },
        });
      }

      const result = checkProgressAllowed({
        userId: body.userId,
        lessonId: body.lessonId,
        courseId: body.courseId,
        attemptId: body.attemptId,
        action: body.action as EnforcementAction,
      });

      return reply.code(200).send({ result });
    } catch (error: any) {
      deps.logger.error('Check progress allowed failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });
}
