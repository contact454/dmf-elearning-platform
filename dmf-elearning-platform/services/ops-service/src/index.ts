/**
 * Ops Service Bootstrap
 * 
 * Provides ops dashboard endpoints and human load control.
 */

import Fastify from 'fastify';
import { sharedEventBus } from '@dmf/infra/adapters';
import { InMemoryLogger, InMemoryAuditLogger } from '@dmf/infra/adapters';
import { registerHealthRoute } from './http/health.route';
import { registerOpsSnapshotRoute } from './http/ops-snapshot.route';
import { registerReviewQueueDrilldownRoute } from './http/review-queue-drilldown.route';
import { registerHardGatePolicyRoutes } from './http/hard-gate-policy.route';
import { registerOverloadControlRoutes } from './http/overload-control.route';
import { registerHeatmapRoute } from './http/heatmap.route';
import { setupOverloadMonitorJob } from './jobs/overload-monitor.job';
import { registerMetricsRoute, httpMetricsMiddleware, registerHttpMetricsResponseHook, setupEventMetricsConsumers } from '@dmf/ops-metrics';
import { requestContextMiddleware } from '@dmf/shared';

const logger = new InMemoryLogger();
const auditLogger = new InMemoryAuditLogger();
const eventBus = sharedEventBus;

const app = Fastify({ logger: false });

// Register middleware (must be before routes)
app.addHook('onRequest', requestContextMiddleware('ops-service'));
app.addHook('onRequest', httpMetricsMiddleware('ops-service'));
registerHttpMetricsResponseHook(app, 'ops-service');

// Setup event metrics consumers
setupEventMetricsConsumers(eventBus, 'ops-service', logger);

// Setup overload monitor job (runs every 15 minutes)
setupOverloadMonitorJob(eventBus, logger, auditLogger, 15 * 60 * 1000);

// Health check endpoint
registerHealthRoute(app);

// Metrics endpoint
registerMetricsRoute(app);

// Ops routes
registerOpsSnapshotRoute(app, { logger });
registerReviewQueueDrilldownRoute(app, { logger });
registerHardGatePolicyRoutes(app, { logger, eventBus, auditLogger });
registerOverloadControlRoutes(app, { logger, eventBus, auditLogger });
registerHeatmapRoute(app, { logger });

const start = async () => {
  try {
    const port = Number(process.env.DMF_PORT_OPS || process.env.PORT || 3012);
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    await app.listen({ port, host: '0.0.0.0' });
    logger.info('Ops service started', { port, mode: isE2EMode ? 'e2e' : 'dev' });
    
    if (isE2EMode) {
      console.log(`[Ops Service] Listening on http://0.0.0.0:${port} (E2E mode)`);
    }
  } catch (err) {
    logger.error('Ops service failed to start', err as Error);
    process.exit(1);
  }
};

start();
