/**
 * Practice Service Bootstrap (Khởi động Dịch vụ Thực hành)
 * 
 * This service handles learning commands and owns Attempt/Submission state.
 * Creates SINGLE shared dependency container ONCE and passes it to all routes.
 */

import Fastify from 'fastify';
import { registerLearningLessonStartRoute } from './http/commands/learning.lesson.start.route';
import { registerLearningActivitySubmitRoute } from './http/commands/learning.activity.submit.route';
import { registerLearningLessonCompleteRoute } from './http/commands/learning.lesson.complete.route';
import { registerAttemptsDebugRoute } from './http/debug/attempts.debug.route';
import { registerAttemptsListDebugRoute } from './http/debug/attempts-list.route';
import { registerHealthRoute } from './http/health.route';
import { registerMetricsRoute, httpMetricsMiddleware, registerHttpMetricsResponseHook } from '@dmf/ops-metrics';
import { requestContextMiddleware } from '@dmf/shared/http/middlewares';
import { setupEventMetricsConsumers } from '@dmf/ops-metrics';
import { getPracticeDeps, getInstanceIds, type PracticeDeps } from './composition-root';

// Create singletons ONCE at bootstrap time
const deps: PracticeDeps = getPracticeDeps();
const instanceIds = getInstanceIds();

// Log bootstrap (temporary tracing)
deps.logger.info('[BOOTSTRAP] Practice service starting', {
  processId: instanceIds.processId,
  dbInstanceId: instanceIds.dbInstanceId,
  attemptRepoInstanceId: instanceIds.attemptRepoInstanceId,
  storeInstanceId: instanceIds.storeInstanceId,
});

await deps.database.connect({ host: 'localhost', port: 5432, database: 'practice' });

const app = Fastify({ logger: false });

// Register middleware (must be before routes)
app.addHook('onRequest', requestContextMiddleware('practice-service'));
app.addHook('onRequest', httpMetricsMiddleware('practice-service'));
registerHttpMetricsResponseHook(app, 'practice-service');

// Setup event metrics consumers
setupEventMetricsConsumers(deps.eventBus, 'practice-service', deps.logger);

// Health check endpoint
registerHealthRoute(app, deps.database);

// Metrics endpoint
registerMetricsRoute(app);

// Pass the SAME deps object to all route registrations
registerLearningLessonStartRoute(app, deps);
registerLearningActivitySubmitRoute(app, deps);
registerLearningLessonCompleteRoute(app, deps);

// Debug endpoints (dev/E2E only)
registerAttemptsDebugRoute(app);
registerAttemptsListDebugRoute(app);

const start = async () => {
  try {
    const port = Number(process.env.DMF_PORT_PRACTICE || process.env.PORT || 3001);
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    await app.listen({ port, host: '0.0.0.0' });
    
    deps.logger.info('Practice service started', { 
      port,
      mode: isE2EMode ? 'e2e' : 'dev',
      processId: instanceIds.processId,
    });
    
    // Print port in E2E mode for visibility
    if (isE2EMode) {
      console.log(`[Practice Service] Listening on http://0.0.0.0:${port} (E2E mode)`);
    }
  } catch (err) {
    deps.logger.error('Practice service failed to start', err as Error);
    process.exit(1);
  }
};

start();
