/**
 * Assessment Service Bootstrap (Khởi động Dịch vụ Đánh giá)
 * 
 * This service handles assessment commands and owns Assessment state.
 */

import Fastify from 'fastify';
import { InMemoryEventBus } from '@dmf/infra/adapters';
import { InMemoryLogger, InMemoryAuditLogger } from '@dmf/infra/adapters';
import { InMemoryDatabase } from '@dmf/infra/adapters';
import { InMemoryIdempotencyStore } from '@dmf/infra/adapters';
import { InMemoryOutbox } from '@dmf/infra/adapters';
import { registerAssessmentQuizStartRoute } from './http/commands/assessment.quiz.start.route';
import { registerAssessmentQuizSubmitRoute } from './http/commands/assessment.quiz.submit.route';
import { registerAssessmentReadRoute } from './http/queries/assessment.read.route';
import { registerReadinessRoute } from './http/queries/readiness.route';
import { registerHealthRoute } from './http/health.route';
import { setupEventConsumers } from './events/consumers';
import { InMemoryHttpClient } from '@dmf/infra/adapters';
import { registerMetricsRoute, httpMetricsMiddleware, registerHttpMetricsResponseHook, setupEventMetricsConsumers } from '@dmf/ops-metrics';
import { requestContextMiddleware } from '@dmf/shared/http/middlewares';

const logger = new InMemoryLogger();
const auditLogger = new InMemoryAuditLogger();
const eventBus = new InMemoryEventBus();
const database = new InMemoryDatabase();
const idempotencyStore = new InMemoryIdempotencyStore();
const outbox = new InMemoryOutbox();
const httpClient = new InMemoryHttpClient();

await database.connect({ host: 'localhost', port: 5432, database: 'assessment' });

// Setup event consumers for cache invalidation (Thiết lập người tiêu dùng sự kiện để vô hiệu hóa cache)
setupEventConsumers(eventBus, database, logger, httpClient);

const app = Fastify({ logger: false });

// Register middleware (must be before routes)
app.addHook('onRequest', requestContextMiddleware('assessment-service'));
app.addHook('onRequest', httpMetricsMiddleware('assessment-service'));
registerHttpMetricsResponseHook(app, 'assessment-service');

// Setup event metrics consumers
setupEventMetricsConsumers(eventBus, 'assessment-service', logger);

// Health check endpoint
registerHealthRoute(app, database);

// Metrics endpoint
registerMetricsRoute(app);

registerAssessmentQuizStartRoute(app, { eventBus, database, logger, auditLogger, idempotencyStore, outbox });
registerAssessmentQuizSubmitRoute(app, { eventBus, database, logger, auditLogger, idempotencyStore, outbox });
registerAssessmentReadRoute(app, { database, logger });
registerReadinessRoute(app, { database, logger, httpClient });

const start = async () => {
  try {
    const port = Number(process.env.DMF_PORT_ASSESSMENT || process.env.PORT || 3014);
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    await app.listen({ port, host: '0.0.0.0' });
    logger.info('Assessment service started', { port, mode: isE2EMode ? 'e2e' : 'dev' });
    
    if (isE2EMode) {
      console.log(`[Assessment Service] Listening on http://0.0.0.0:${port} (E2E mode)`);
    }
  } catch (err) {
    logger.error('Assessment service failed to start', err as Error);
    process.exit(1);
  }
};

start();
