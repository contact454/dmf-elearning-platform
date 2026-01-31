/**
 * Hard Gate Policy Routes
 * 
 * GET /api/ops/policies/hard-gate
 * POST /api/ops/policies/hard-gate
 * POST /api/ops/policies/hard-gate/bulk
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger, EventBus, AuditLogger } from '@dmf/infra';
import { getHardGatePolicyRegistry } from '@dmf/shared';
import type { HardGateScope } from '@dmf/ops';

// Generate event ID helper
function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function registerHardGatePolicyRoutes(
  app: FastifyInstance,
  deps: { logger: Logger; eventBus: EventBus; auditLogger: AuditLogger }
) {
  // Get hard gate policies
  app.get('/api/ops/policies/hard-gate', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const registry = getHardGatePolicyRegistry();
      const policies = registry.getAllPolicies();

      return reply.code(200).send({ policies });
    } catch (error: any) {
      deps.logger.error('Get hard gate policies failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });

  // Set hard gate policy
  app.post('/api/ops/policies/hard-gate', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const actorUserId = (request as any).requestContext?.userId || 'admin-system';

    try {
      if (!body.scope || typeof body.enabled !== 'boolean') {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            category: 'ClientError',
            message: 'scope and enabled are required',
          },
        });
      }

      const registry = getHardGatePolicyRegistry();
      const policy = {
        scope: body.scope as HardGateScope,
        scopeId: body.scopeId,
        enabled: body.enabled,
        updatedAt: new Date().toISOString(),
        updatedBy: actorUserId,
        reason: body.reason,
      };

      registry.setPolicy(policy);

      // Emit event
      await deps.eventBus.emit({
        eventName: 'policy.hard_gate.updated',
        payload: {
          eventId: generateEventId(),
          occurredAt: new Date().toISOString(),
          actorUserId,
          scope: policy.scope,
          scopeId: policy.scopeId,
          enabled: policy.enabled,
          reason: policy.reason,
        },
      });

      // Audit log
      deps.auditLogger.logCommandReceived('policy.hard_gate.set', actorUserId, `${policy.scope}:${policy.scopeId || 'global'}`);

      return reply.code(200).send({ policy });
    } catch (error: any) {
      deps.logger.error('Set hard gate policy failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });

  // Bulk set hard gate policies
  app.post('/api/ops/policies/hard-gate/bulk', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const actorUserId = (request as any).requestContext?.userId || 'admin-system';

    try {
      if (!Array.isArray(body.policies)) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            category: 'ClientError',
            message: 'policies array is required',
          },
        });
      }

      const registry = getHardGatePolicyRegistry();
      const policies = [];

      for (const policyData of body.policies) {
        const policy = {
          scope: policyData.scope as HardGateScope,
          scopeId: policyData.scopeId,
          enabled: policyData.enabled,
          updatedAt: new Date().toISOString(),
          updatedBy: actorUserId,
          reason: policyData.reason,
        };

        registry.setPolicy(policy);
        policies.push(policy);

        // Emit event for each policy
        await deps.eventBus.emit({
          eventName: 'policy.hard_gate.updated',
          payload: {
            eventId: generateEventId(),
            occurredAt: new Date().toISOString(),
            actorUserId,
            scope: policy.scope,
            scopeId: policy.scopeId,
            enabled: policy.enabled,
            reason: policy.reason,
          },
        });
      }

      // Audit log
      deps.auditLogger.logCommandReceived('policy.hard_gate.bulk_set', actorUserId, `${policies.length} policies`);

      return reply.code(200).send({ policies });
    } catch (error: any) {
      deps.logger.error('Bulk set hard gate policies failed', error);
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
