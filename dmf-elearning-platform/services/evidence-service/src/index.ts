/**
 * Evidence Service Bootstrap
 * 
 * Provides evidence tracking and anti-virtual learning foundation.
 */

import Fastify from 'fastify';
import { sharedEventBus } from '@dmf/infra/adapters';
import { InMemoryLogger, InMemoryAuditLogger } from '@dmf/infra/adapters';
import { registerHealthRoute } from './http/health.route';
import { registerEvidenceSummaryRoute } from './http/evidence-summary.route';
import { registerValidationRoutes } from './http/validation.route';
import { registerEnforcementRoutes } from './http/enforcement.route';
import { registerReviewCommandsRoutes } from './http/review-commands.route';
import { registerReviewQueueRoute } from './http/review-queue.route';
import { setupLearningEventConsumers } from './consumers/learning-events.consumer';
import { setupReviewCreationConsumer } from './consumers/review-creation.consumer';
import { setupLearningEnforcementHooks } from './hooks/learning-enforcement.hooks';
import { setupSlaExpirationJob } from './jobs/sla-expiration.job';
import { registerMetricsRoute, httpMetricsMiddleware, registerHttpMetricsResponseHook, setupEventMetricsConsumers } from '@dmf/ops-metrics';
import { requestContextMiddleware } from '@dmf/shared';

const logger = new InMemoryLogger();
const auditLogger = new InMemoryAuditLogger();
const eventBus = sharedEventBus;

const app = Fastify({ logger: false });

// Register middleware (must be before routes)
app.addHook('onRequest', requestContextMiddleware('evidence-service'));
app.addHook('onRequest', httpMetricsMiddleware('evidence-service'));
registerHttpMetricsResponseHook(app, 'evidence-service');

// Setup event metrics consumers
setupEventMetricsConsumers(eventBus, 'evidence-service', logger);

// Setup learning event consumers (passive hooks)
setupLearningEventConsumers(eventBus, logger, auditLogger);

// Setup review creation consumer (auto-create reviews)
setupReviewCreationConsumer(eventBus, logger);

// Setup learning enforcement hooks (evidence checks)
setupLearningEnforcementHooks(eventBus, logger, auditLogger);

// Setup SLA expiration job (check for expired reviews)
setupSlaExpirationJob(eventBus, logger, auditLogger, 60 * 60 * 1000); // Run every hour

// Health check endpoint
registerHealthRoute(app);

// Metrics endpoint
registerMetricsRoute(app);

// Evidence routes
registerEvidenceSummaryRoute(app, { logger });
registerValidationRoutes(app, { logger, eventBus, auditLogger });
registerEnforcementRoutes(app, { logger, eventBus, auditLogger });
registerReviewCommandsRoutes(app, { logger, eventBus, auditLogger });
registerReviewQueueRoute(app, { logger });

const start = async () => {
  try {
    const port = Number(process.env.DMF_PORT_EVIDENCE || process.env.PORT || 3011);
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    await app.listen({ port, host: '0.0.0.0' });
    logger.info('Evidence service started', { port, mode: isE2EMode ? 'e2e' : 'dev' });
    
    if (isE2EMode) {
      console.log(`[Evidence Service] Listening on http://0.0.0.0:${port} (E2E mode)`);
    }
  } catch (err) {
    logger.error('Evidence service failed to start', err as Error);
    process.exit(1);
  }
};

start();
