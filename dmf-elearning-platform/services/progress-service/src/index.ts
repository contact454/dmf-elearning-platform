/**
 * Progress Service Bootstrap (Khởi động Dịch vụ Tiến độ)
 *
 * Event consumer only. Owns ProgressState (derived state).
 * Uses in-memory ProgressState store + shared EventBus (M3).
 */

import { sharedEventBus } from '@dmf/infra/adapters';
import { InMemoryLogger } from '@dmf/infra/adapters';
import { InMemoryHttpClient } from '@dmf/infra/adapters';
import { createInMemoryProgressRepository } from './state/in-memory-progress.repository.js';
import { registerProgressDashboardRoute } from './http/queries/dashboard.route.js';
import { registerCourseProgressRoute } from './http/queries/course-progress.route.js';
import { registerProgressStateDebugRoute } from './http/debug/progress-state.debug.route.js';
import { registerHealthRoute } from './http/health.route.js';
import { setupEventConsumers } from './events/consumers/index.js';
import Fastify from 'fastify';
import {
  registerMetricsRoute,
  httpMetricsMiddleware,
  registerHttpMetricsResponseHook,
  setupEventMetricsConsumers,
} from '@dmf/ops-metrics';
import { requestContextMiddleware } from '@dmf/shared/http/middlewares';

const logger = new InMemoryLogger();
const eventBus = sharedEventBus;
const httpClient = new InMemoryHttpClient();
const progressRepo = createInMemoryProgressRepository();

setupEventConsumers(eventBus, { progressRepo, logger });

const app = Fastify({ logger: false });

app.addHook('onRequest', requestContextMiddleware('progress-service'));
app.addHook('onRequest', httpMetricsMiddleware('progress-service'));
registerHttpMetricsResponseHook(app, 'progress-service');

setupEventMetricsConsumers(eventBus, 'progress-service', logger);

registerHealthRoute(app);
registerMetricsRoute(app);
registerProgressDashboardRoute(app, { progressRepo, logger, httpClient });
registerCourseProgressRoute(app, { progressRepo, logger });
registerProgressStateDebugRoute(app, progressRepo);

const start = async () => {
  try {
    const port = Number(process.env.DMF_PORT_PROGRESS || process.env.PORT || 3004);
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';

    await app.listen({ port, host: '0.0.0.0' });
    logger.info('Progress service started', { port, mode: isE2EMode ? 'e2e' : 'dev' });

    if (isE2EMode) {
      console.log(`[Progress Service] Listening on http://0.0.0.0:${port} (E2E mode)`);
    }
  } catch (err) {
    logger.error('Progress service failed to start', err as Error);
    process.exit(1);
  }
};

start();
