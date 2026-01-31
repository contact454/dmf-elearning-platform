/**
 * Overload Control Routes
 * 
 * GET /api/ops/overload/status
 * POST /api/ops/degrade/set
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger, EventBus, AuditLogger } from '@dmf/infra';
import { buildOpsSnapshot, detectOverload, getDegradeModeRegistry } from '@dmf/ops';

// Generate event ID helper
function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function registerOverloadControlRoutes(
  app: FastifyInstance,
  deps: { logger: Logger; eventBus: EventBus; auditLogger: AuditLogger }
) {
  // Get overload status
  app.get('/api/ops/overload/status', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get snapshot for last 24 hours
      const toDate = new Date();
      const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
      const snapshot = buildOpsSnapshot(fromDate.toISOString(), toDate.toISOString());

      // Detect overload
      const overloadStatus = detectOverload(snapshot.reviewQueue);

      // Get degrade mode state
      const degradeRegistry = getDegradeModeRegistry();
      const degradeState = degradeRegistry.getState();

      return reply.code(200).send({
        overload: overloadStatus,
        degrade: degradeState,
      });
    } catch (error: any) {
      deps.logger.error('Get overload status failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });

  // Set degrade mode (manual override)
  app.post('/api/ops/degrade/set', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const actorUserId = (request as any).requestContext?.userId || 'admin-system';

    try {
      const degradeRegistry = getDegradeModeRegistry();

      if (body.mode === 'normal') {
        // Deactivate degrade mode
        degradeRegistry.deactivate(actorUserId);

        // Emit event
        await deps.eventBus.emit({
          eventName: 'ops.degrade.deactivated',
          payload: {
            eventId: generateEventId(),
            occurredAt: new Date().toISOString(),
            deactivatedBy: actorUserId,
          },
        });

        // Audit log
        deps.auditLogger.logCommandReceived('ops.degrade.deactivate', actorUserId, 'normal');

        return reply.code(200).send({
          mode: 'normal',
          message: 'Degrade mode deactivated',
        });
      } else {
        // Activate degrade mode (manual override)
        degradeRegistry.setManualOverride(actorUserId, body.reason, body.autoActions);

        const state = degradeRegistry.getState();

        // Emit event
        await deps.eventBus.emit({
          eventName: 'ops.degrade.activated',
          payload: {
            eventId: generateEventId(),
            occurredAt: new Date().toISOString(),
            activatedBy: actorUserId,
            reason: body.reason,
            autoActions: state.autoActions,
          },
        });

        // Audit log
        deps.auditLogger.logCommandReceived('ops.degrade.activate', actorUserId, body.mode);

        return reply.code(200).send({
          mode: state.mode,
          state,
        });
      }
    } catch (error: any) {
      deps.logger.error('Set degrade mode failed', error);
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
