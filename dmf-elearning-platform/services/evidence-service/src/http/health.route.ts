/**
 * Health check endpoints
 * - GET /health - Liveness probe
 * - GET /health/ready - Readiness probe
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export function registerHealthRoute(app: FastifyInstance) {
  app.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    return reply.code(200).send({
      status: 'ok',
      ok: true,
      service: 'evidence-service',
      version: '0.1.0',
      mode: isE2EMode ? 'e2e' : 'dev',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/ready', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(200).send({
      status: 'ready',
      service: 'evidence-service',
      checks: {},
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });
}
