/**
 * Versioning Routes
 * 
 * POST /api/ops/versioning/:resourceId/rollback
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger, EventBus, AuditLogger } from '@dmf/infra';
import { VersionedResourceStore } from '@dmf/ops-admin';
// Generate event ID helper
function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generic versioned resource store (for demo, can be specialized per resource type)
const versionedStore = new VersionedResourceStore<any>();

export function registerVersioningRoutes(
  app: FastifyInstance,
  deps: { logger: Logger; eventBus: EventBus; auditLogger: AuditLogger }
) {
  // Rollback resource
  app.post('/api/ops/versioning/:resourceId/rollback', async (request: FastifyRequest, reply: FastifyReply) => {
    const resourceId = (request.params as any).resourceId as string;
    const body = request.body as any;
    const targetVersion = body.targetVersion as number;
    const actorUserId = (request as any).requestContext?.userId || 'system';

    if (!targetVersion || typeof targetVersion !== 'number') {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          category: 'ClientError',
          message: 'targetVersion (number) is required',
        },
      });
    }

    try {
      const current = versionedStore.getCurrent(resourceId);
      if (!current) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            category: 'ClientError',
            message: `Resource ${resourceId} not found`,
          },
        });
      }

      const rolledBack = versionedStore.rollback(resourceId, targetVersion, actorUserId);

      if (!rolledBack) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            category: 'ClientError',
            message: `Version ${targetVersion} of resource ${resourceId} not found`,
          },
        });
      }

      // Emit event
      const eventId = generateEventId();
      await deps.eventBus.emit({
        eventName: 'ops.resource.rolled_back',
        payload: {
          eventId,
          occurredAt: new Date().toISOString(),
          actorUserId,
          resourceId,
          targetVersion,
          previousVersion: current.version,
        },
      });

      // Audit log
      deps.auditLogger.logCommandReceived('ops.resource.rollback', actorUserId, eventId);

      return reply.code(200).send({
        resource: rolledBack,
        message: `Rolled back to version ${targetVersion}`,
      });
    } catch (error: any) {
      deps.logger.error('Rollback failed', error);
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
