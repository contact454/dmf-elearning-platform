/**
 * Onboarding Service Bootstrap (Khởi động Dịch vụ Đăng ký)
 * 
 * This service handles user registration, login, and profile management.
 * Owns User, LearnerProfile, Session state.
 */

import Fastify from 'fastify';
import { sharedEventBus } from '@dmf/infra/adapters';
import { InMemoryLogger, InMemoryAuditLogger } from '@dmf/infra/adapters';
import { InMemoryDatabase } from '@dmf/infra/adapters';
import { InMemoryIdempotencyStore } from '@dmf/infra/adapters';
import { InMemoryOutbox } from '@dmf/infra/adapters';
import { registerSystemUserRegisterRoute } from './http/commands/system.user.register.route';
import { registerSystemUserLoginRoute } from './http/commands/system.user.login.route';
import { registerSystemProfileModifyRoute } from './http/commands/system.profile.modify.route';
import { registerOnboardingPlacementRoute } from './http/commands/onboarding.placement.route';
import { registerHealthRoute } from './http/health.route';
import { registerMetricsRoute, httpMetricsMiddleware, registerHttpMetricsResponseHook, setupEventMetricsConsumers } from '@dmf/ops-metrics';
import { requestContextMiddleware } from '@dmf/shared';
import { createInMemoryFriendshipRepository } from './state/friendship.repository';
import { registerSocialRoutes } from './http/social.routes';

const logger = new InMemoryLogger();
const auditLogger = new InMemoryAuditLogger();
const eventBus = sharedEventBus; // Use shared event bus for dev mode
const database = new InMemoryDatabase();
const idempotencyStore = new InMemoryIdempotencyStore();
const outbox = new InMemoryOutbox();
const friendshipRepo = createInMemoryFriendshipRepository();

// Connect database (Kết nối cơ sở dữ liệu)
await database.connect({ host: 'localhost', port: 5432, database: 'onboarding' });

const app = Fastify({
  logger: false,
});

// CORS Configuration - Allow Frontend (Port 3000)
app.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  reply.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  reply.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    reply.code(200).send();
  }
});

// Register middleware (must be before routes)
app.addHook('onRequest', requestContextMiddleware('onboarding-service'));
app.addHook('onRequest', httpMetricsMiddleware('onboarding-service'));
registerHttpMetricsResponseHook(app, 'onboarding-service');

// Setup event metrics consumers
setupEventMetricsConsumers(eventBus, 'onboarding-service', logger);

// Health check endpoint
registerHealthRoute(app);

// Metrics endpoint
registerMetricsRoute(app);

// Register routes (Đăng ký tuyến)
registerSystemUserRegisterRoute(app, { eventBus, database, logger, auditLogger, idempotencyStore, outbox });
registerSystemUserLoginRoute(app, { eventBus, database, logger, auditLogger, outbox });
registerSystemProfileModifyRoute(app, { eventBus, database, logger, auditLogger, idempotencyStore, outbox });
registerOnboardingPlacementRoute(app, { eventBus, database, logger, auditLogger, idempotencyStore, outbox });
registerSocialRoutes(app, { friendshipRepo });

const start = async () => {
  try {
    const port = Number(process.env.DMF_PORT_ONBOARDING || process.env.PORT || 3002);
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    await app.listen({ port, host: '0.0.0.0' });
    logger.info('Onboarding service started', { port, mode: isE2EMode ? 'e2e' : 'dev' });
    
    if (isE2EMode) {
      console.log(`[Onboarding Service] Listening on http://0.0.0.0:${port} (E2E mode)`);
    }
  } catch (err) {
    logger.error('Onboarding service failed to start', err as Error);
    process.exit(1);
  }
};

start();
