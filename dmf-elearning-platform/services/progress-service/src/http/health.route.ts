/**
 * Health check endpoints
 * - GET /health - Liveness probe
 * - GET /health/ready - Readiness probe
 */

import type { FastifyInstance } from 'fastify';

export function registerHealthRoute(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    return reply.code(200).send({
      status: 'ok',
      ok: true,
      service: 'progress-service',
      version: '0.1.0',
      mode: isE2EMode ? 'e2e' : 'dev',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/ready', async (_request, reply) => {
    return reply.code(200).send({
      status: 'ready',
      service: 'progress-service',
      checks: {},
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });
}
