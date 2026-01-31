/**
 * Curriculum Service Bootstrap (Khởi động Dịch vụ Chương trình)
 * 
 * Handles course enrollment and owns Enrollment, Course, Unit, Lesson state.
 */

import Fastify from 'fastify';
import { InMemoryEventBus } from '@dmf/infra/adapters';
import { InMemoryLogger, InMemoryAuditLogger } from '@dmf/infra/adapters';
import { InMemoryDatabase } from '@dmf/infra/adapters';
import { InMemoryIdempotencyStore } from '@dmf/infra/adapters';
import { InMemoryOutbox } from '@dmf/infra/adapters';
import { registerCurriculumCourseEnrollRoute } from './http/commands/curriculum.course.enroll.route';
import { registerCurriculumCoursesRoute } from './http/queries/courses.route';
import { registerCurriculumLessonsRoute } from './http/queries/lessons.route';
import { registerHealthRoute } from './http/health.route';
import { registerMetricsRoute, httpMetricsMiddleware, registerHttpMetricsResponseHook, setupEventMetricsConsumers } from '@dmf/ops-metrics';
import { requestContextMiddleware } from '@dmf/shared/http/middlewares';

const logger = new InMemoryLogger();
const auditLogger = new InMemoryAuditLogger();
const eventBus = new InMemoryEventBus();
const database = new InMemoryDatabase();
const idempotencyStore = new InMemoryIdempotencyStore();
const outbox = new InMemoryOutbox();

await database.connect({ host: 'localhost', port: 5432, database: 'curriculum' });

const app = Fastify({ logger: false });

// Register middleware (must be before routes)
app.addHook('onRequest', requestContextMiddleware('curriculum-service'));
app.addHook('onRequest', httpMetricsMiddleware('curriculum-service'));
registerHttpMetricsResponseHook(app, 'curriculum-service');

// Setup event metrics consumers
setupEventMetricsConsumers(eventBus, 'curriculum-service', logger);

// Health check endpoint
registerHealthRoute(app);

// Metrics endpoint
registerMetricsRoute(app);

registerCurriculumCourseEnrollRoute(app, { eventBus, database, logger, auditLogger, idempotencyStore, outbox });
registerCurriculumCoursesRoute(app, { logger });
registerCurriculumLessonsRoute(app, { logger });

const start = async () => {
  try {
    const port = Number(process.env.DMF_PORT_CURRICULUM || process.env.PORT || 3003);
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    await app.listen({ port, host: '0.0.0.0' });
    logger.info('Curriculum service started', { port, mode: isE2EMode ? 'e2e' : 'dev' });
    
    if (isE2EMode) {
      console.log(`[Curriculum Service] Listening on http://0.0.0.0:${port} (E2E mode)`);
    }
  } catch (err) {
    logger.error('Curriculum service failed to start', err as Error);
    process.exit(1);
  }
};

start();
