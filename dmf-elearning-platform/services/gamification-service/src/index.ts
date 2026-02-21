/**
 * Gamification Service Bootstrap
 * Port: 3006
 */

import Fastify from 'fastify';
import { createInMemoryUserStatsRepository } from './state/in-memory-stats.repository.js';
import { registerGamificationRoutes } from './http/gamification.routes.js';

// 1. Setup Dependencies
const statsRepo = createInMemoryUserStatsRepository();

// 2. Initialize Fastify
const app = Fastify({ logger: false });

// CORS — read allowed origins from environment variable
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

app.addHook('onRequest', async (request, reply) => {
  const requestOrigin = request.headers.origin;
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    reply.header('Access-Control-Allow-Origin', requestOrigin);
  }
  reply.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  reply.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    reply.code(200).send();
  }
});

// 3. Register Routes
app.get('/health', async () => ({
  status: 'OK',
  service: 'gamification-service',
}));

app.get('/health/ready', async () => ({
  status: 'ready',
  service: 'gamification-service',
  checks: {},
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
}));

registerGamificationRoutes(app, { statsRepo });

// 4. Start Server
const start = async () => {
  try {
    const port = Number(process.env.DMF_PORT_GAMIFICATION || process.env.PORT || 3006);
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';

    await app.listen({ port, host: '0.0.0.0' });

    console.log(`✅ Gamification Service is running on port ${port}`);
    if (isE2EMode) console.log('🧪 Running in E2E Mode');
  } catch (err) {
    console.error('❌ Service failed to start:', err);
    process.exit(1);
  }
};

start();
