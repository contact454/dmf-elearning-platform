/**
 * Read Service Bootstrap (Khởi động Dịch vụ Đọc)
 * 
 * Provides read-only query endpoints for UI.
 * No domain logic, only read model queries.
 */

import Fastify from 'fastify';
import { InMemoryLogger } from '@dmf/infra/adapters';
import { sharedEventBus } from '@dmf/infra/adapters';
import { registerDashboardRoute } from './http/dashboard.route';
import { registerLessonProgressRoute } from './http/lesson-progress.route';
import { registerReadinessRoute } from './http/readiness.route';
import { registerHealthRoute } from './http/health.route';
import { setupProjections } from './projections/setup';
import { registerMetricsRoute, httpMetricsMiddleware, registerHttpMetricsResponseHook, setupEventMetricsConsumers } from '@dmf/ops-metrics';
import { requestContextMiddleware } from '@dmf/shared/http/middlewares';

const logger = new InMemoryLogger();
const eventBus = sharedEventBus; // Use shared event bus for dev mode

// Setup event projections (read-only listeners)
setupProjections(eventBus, logger);

const app = Fastify({ logger: false });

// Register middleware (must be before routes)
app.addHook('onRequest', requestContextMiddleware('read-service'));
app.addHook('onRequest', httpMetricsMiddleware('read-service'));
registerHttpMetricsResponseHook(app, 'read-service');

// Setup event metrics consumers
setupEventMetricsConsumers(eventBus, 'read-service', logger);

// Health check endpoint
registerHealthRoute(app);

// Metrics endpoint
registerMetricsRoute(app);

// Read-only query endpoints
registerDashboardRoute(app, { logger });
registerLessonProgressRoute(app, { logger });
registerReadinessRoute(app, { logger });

const start = async () => {
  try {
    const port = Number(process.env.DMF_PORT_READ || process.env.PORT || 3007);
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    await app.listen({ port, host: '0.0.0.0' });
    logger.info('Read service started', { port, mode: isE2EMode ? 'e2e' : 'dev' });
    
    if (isE2EMode) {
      console.log(`[Read Service] Listening on http://0.0.0.0:${port} (E2E mode)`);
    }
  } catch (err) {
    logger.error('Read service failed to start', err as Error);
    process.exit(1);
  }
};

start();
