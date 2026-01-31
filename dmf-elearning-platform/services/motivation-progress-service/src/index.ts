/**
 * Motivation Progress Service Bootstrap (M3 Progress & Mastery)
 * Minimal Version - No Ops Metrics Dependency
 */

import Fastify from 'fastify';
import { sharedEventBus } from '@dmf/infra/adapters';
import { InMemoryLogger } from '@dmf/infra/adapters';
import { createInMemoryMasteryRepository } from './state/in-memory-mastery.repository.js';
import { createInMemorySkillScoreRepository } from './state/in-memory-skillscore.repository.js';
import { createInMemoryQuizRepository } from './state/in-memory-quiz.repository.js';
import { setupEventConsumers } from './events/consumers/index.js';
import { registerMasteryReadRoute } from './http/queries/mastery.read.route.js';
import { registerDebugSeedRoute } from './http/debug.route.js';
import { registerQuizRoutes } from './http/quiz.routes.js';
import { registerAITutorRoutes } from './http/ai-tutor.routes.js';
import { requestContextMiddleware } from '@dmf/shared';

// 1. Setup Core Logic Dependencies
const logger = new InMemoryLogger();
const eventBus = sharedEventBus;
const masteryRepo = createInMemoryMasteryRepository();
const skillScoreRepo = createInMemorySkillScoreRepository();
const quizRepo = createInMemoryQuizRepository();

// 2. Wire Consumers
setupEventConsumers(eventBus, { masteryRepo, skillScoreRepo, logger });

// 3. Initialize Fastify
const app = Fastify({ logger: false });

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

// Re-enable middleware
app.addHook('onRequest', requestContextMiddleware('motivation-progress-service'));

// 4. Register Routes
// Manual Health Check (No external dependency)
app.get('/health', async () => ({ status: 'OK', service: 'motivation-progress-service' }));

// Business Routes
registerMasteryReadRoute(app, { masteryRepo, skillScoreRepo, logger });
registerDebugSeedRoute(app, { masteryRepo, skillScoreRepo });
registerQuizRoutes(app, { quizRepo });
registerAITutorRoutes(app);

// 5. Start Server
const start = async () => {
  try {
    const port = Number(process.env.DMF_PORT_MOTIVATION_PROGRESS || process.env.PORT || 3005);
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';

    await app.listen({ port, host: '0.0.0.0' });

    console.log(`✅ Motivation Progress Service is running on port ${port}`);
    if (isE2EMode) console.log('🧪 Running in E2E Mode');
  } catch (err) {
    console.error('❌ Service failed to start:', err);
    process.exit(1);
  }
};

start();
