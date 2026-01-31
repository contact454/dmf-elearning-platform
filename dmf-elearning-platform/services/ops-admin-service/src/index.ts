/**
 * Ops Admin Service Bootstrap
 * 
 * Provides ops/admin APIs for RBAC, Policy Center, and Versioning.
 */

import Fastify from 'fastify';
import { sharedEventBus } from '@dmf/infra/adapters';
import { InMemoryLogger, InMemoryAuditLogger } from '@dmf/infra/adapters';
import { registerHealthRoute } from './http/health.route';
import { registerRbacDiffRoute } from './http/rbac-diff.route';
import { registerPoliciesRoutes } from './http/policies.route';
import { registerVersioningRoutes } from './http/versioning.route';
import { registerMetricsRoute, httpMetricsMiddleware, registerHttpMetricsResponseHook, setupEventMetricsConsumers } from '@dmf/ops-metrics';
import { requestContextMiddleware } from '@dmf/shared';

const logger = new InMemoryLogger();
const auditLogger = new InMemoryAuditLogger();
const eventBus = sharedEventBus;

const app = Fastify({ logger: false });

// Register middleware (must be before routes)
app.addHook('onRequest', requestContextMiddleware('ops-admin-service'));
app.addHook('onRequest', httpMetricsMiddleware('ops-admin-service'));
registerHttpMetricsResponseHook(app, 'ops-admin-service');

// Setup event metrics consumers
setupEventMetricsConsumers(eventBus, 'ops-admin-service', logger);

// Health check endpoint
registerHealthRoute(app);

// Metrics endpoint
registerMetricsRoute(app);

// Ops routes
registerRbacDiffRoute(app, { logger });
registerPoliciesRoutes(app, { logger, eventBus, auditLogger });
registerVersioningRoutes(app, { logger, eventBus, auditLogger });

const start = async () => {
  try {
    const port = Number(process.env.DMF_PORT_OPS_ADMIN || process.env.PORT || 3010);
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    await app.listen({ port, host: '0.0.0.0' });
    logger.info('Ops admin service started', { port, mode: isE2EMode ? 'e2e' : 'dev' });
    
    if (isE2EMode) {
      console.log(`[Ops Admin Service] Listening on http://0.0.0.0:${port} (E2E mode)`);
    }
  } catch (err) {
    logger.error('Ops admin service failed to start', err as Error);
    process.exit(1);
  }
};

start();
