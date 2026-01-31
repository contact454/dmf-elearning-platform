/**
 * Overload Monitor Job (Công việc Giám sát Quá tải)
 * 
 * Periodically checks for overload and activates degrade mode if needed.
 */

import type { EventBus, Logger, AuditLogger } from '@dmf/infra';
import { buildOpsSnapshot, detectOverload, getDegradeModeRegistry } from '@dmf/ops';
import { getHardGatePolicyRegistry } from '@dmf/shared';

// Generate event ID helper
function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check for overload and activate degrade mode if needed
 */
export async function checkAndHandleOverload(
  eventBus: EventBus,
  logger: Logger,
  auditLogger: AuditLogger
): Promise<void> {
  try {
    // Get snapshot for last 24 hours
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
    const snapshot = buildOpsSnapshot(fromDate.toISOString(), toDate.toISOString());

    // Detect overload
    const overloadStatus = detectOverload(snapshot.reviewQueue);

    if (overloadStatus.overloaded) {
      // Emit overload detected event
      await eventBus.emit({
        eventName: 'ops.overload.detected',
        payload: {
          eventId: generateEventId(),
          occurredAt: new Date().toISOString(),
          reasons: overloadStatus.reasons,
          roleOverloads: overloadStatus.roleOverloads,
        },
      });

      // Check if degrade mode is already active
      const degradeRegistry = getDegradeModeRegistry();
      if (!degradeRegistry.isActive()) {
        // Auto-activate degrade mode
        const hardGateRegistry = getHardGatePolicyRegistry();
        const allPolicies = hardGateRegistry.getAllPolicies();

        // Find low-critical scopes to disable (course/lesson scopes)
        const lowCriticalScopes = allPolicies.filter(
          (p) => (p.scope === 'course' || p.scope === 'lesson') && p.enabled
        );

        degradeRegistry.activate('system', 'Auto-activated due to overload', {
          hardGateDisabledScopes: lowCriticalScopes.map((p) => ({
            scope: p.scope as 'course' | 'lesson',
            scopeId: p.scopeId!,
          })),
          reviewTypesDowngraded: [], // Can be extended
        });

        // Emit degrade activated event
        const state = degradeRegistry.getState();
        await eventBus.emit({
          eventName: 'ops.degrade.activated',
          payload: {
            eventId: generateEventId(),
            occurredAt: new Date().toISOString(),
            activatedBy: 'system',
            reason: 'Auto-activated due to overload',
            autoActions: state.autoActions,
          },
        });

        const reasonsText = overloadStatus.reasons.join(', ');
        const disabledScopesText = state.autoActions.hardGateDisabledScopes
          .map((s) => `${s.scope}:${s.scopeId}`)
          .join(', ');

        logger.warn('Degrade mode auto-activated due to overload', {
          reasons: reasonsText,
          disabledScopes: disabledScopesText,
        });

        // Audit log
        auditLogger.logCommandReceived('ops.degrade.auto_activate', 'system', 'overload');
      }
    } else {
      // Check if we should deactivate degrade mode (if overload resolved)
      const degradeRegistry = getDegradeModeRegistry();
      if (degradeRegistry.isActive()) {
        // Check if overload is resolved (can be extended with hysteresis)
        // For now, only deactivate if manually requested
        // Auto-deactivation can be added with hysteresis logic
      }
    }
  } catch (error: any) {
    logger.error('Overload monitor job failed', error);
  }
}

/**
 * Setup overload monitor job (runs periodically)
 */
export function setupOverloadMonitorJob(
  eventBus: EventBus,
  logger: Logger,
  auditLogger: AuditLogger,
  intervalMs: number = 15 * 60 * 1000 // Default: 15 minutes
): NodeJS.Timeout {
  // Run immediately
  checkAndHandleOverload(eventBus, logger, auditLogger);

  // Then run periodically
  return setInterval(() => {
    checkAndHandleOverload(eventBus, logger, auditLogger);
  }, intervalMs);
}
