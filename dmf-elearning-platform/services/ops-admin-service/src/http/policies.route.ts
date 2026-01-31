/**
 * Policies Routes
 * 
 * GET /api/ops/policies
 * GET /api/ops/policies/:id
 * POST /api/ops/policies
 * POST /api/ops/policies/:id/activate
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger, EventBus, AuditLogger } from '@dmf/infra';
import { getPolicyRegistry, type PolicyStatus } from '@dmf/ops-admin';
// Generate event ID helper
function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function registerPoliciesRoutes(
  app: FastifyInstance,
  deps: { logger: Logger; eventBus: EventBus; auditLogger: AuditLogger }
) {
  // Get all policies
  app.get('/api/ops/policies', async (request: FastifyRequest, reply: FastifyReply) => {
    const status = (request.query as any).status as PolicyStatus | undefined;

    try {
      const registry = getPolicyRegistry();
      const policies = status ? registry.getPoliciesByStatus(status) : registry.getAllPolicies();

      return reply.code(200).send({ policies });
    } catch (error: any) {
      deps.logger.error('Get policies failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });

  // Get policy by ID
  app.get('/api/ops/policies/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const policyId = (request.params as any).id as string;

    try {
      const registry = getPolicyRegistry();
      const policy = registry.getPolicy(policyId);

      if (!policy) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            category: 'ClientError',
            message: `Policy ${policyId} not found`,
          },
        });
      }

      return reply.code(200).send({ policy });
    } catch (error: any) {
      deps.logger.error('Get policy failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });

  // Create policy
  app.post('/api/ops/policies', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const actorUserId = (request as any).requestContext?.userId || 'system';

    try {
      const registry = getPolicyRegistry();

      // Validate required fields
      if (!body.id || !body.scope || !body.appliesTo || !body.rule) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            category: 'ClientError',
            message: 'Missing required fields: id, scope, appliesTo, rule',
          },
        });
      }

      const policy = registry.createPolicy(
        {
          id: body.id,
          scope: body.scope,
          appliesTo: body.appliesTo,
          rule: body.rule,
          status: body.status || 'draft',
          description: body.description,
          createdBy: actorUserId,
        },
        actorUserId
      );

      // Emit event
      const eventId = generateEventId();
      await deps.eventBus.emit({
        eventName: 'ops.policy.created',
        payload: {
          eventId,
          occurredAt: new Date().toISOString(),
          actorUserId,
          policyId: policy.id,
          version: policy.version,
        },
      });

      // Audit log
      deps.auditLogger.logCommandReceived('ops.policy.create', actorUserId, eventId);

      return reply.code(201).send({ policy });
    } catch (error: any) {
      deps.logger.error('Create policy failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });

  // Activate policy
  app.post('/api/ops/policies/:id/activate', async (request: FastifyRequest, reply: FastifyReply) => {
    const policyId = (request.params as any).id as string;
    const actorUserId = (request as any).requestContext?.userId || 'system';

    try {
      const registry = getPolicyRegistry();
      const policy = registry.activatePolicy(policyId, actorUserId);

      if (!policy) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            category: 'ClientError',
            message: `Policy ${policyId} not found`,
          },
        });
      }

      // Emit event
      const eventId = generateEventId();
      await deps.eventBus.emit({
        eventName: 'ops.policy.activated',
        payload: {
          eventId,
          occurredAt: new Date().toISOString(),
          actorUserId,
          policyId: policy.id,
          version: policy.version,
        },
      });

      // Audit log
      deps.auditLogger.logCommandReceived('ops.policy.activate', actorUserId, eventId);

      return reply.code(200).send({ policy });
    } catch (error: any) {
      deps.logger.error('Activate policy failed', error);
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
