/**
 * Health check endpoints
 * - GET /health - Liveness probe
 * - GET /health/ready - Readiness probe (checks database connectivity)
 */

import type { FastifyInstance } from 'fastify';
import type { Database } from '@dmf/infra';

export function registerHealthRoute(app: FastifyInstance, db?: Database) {
  app.get('/health', async (_request, reply) => {
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    return reply.code(200).send({
      status: 'ok',
      ok: true,
      service: 'assessment-service',
      version: '0.1.0',
      mode: isE2EMode ? 'e2e' : 'dev',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/ready', async (_request, reply) => {
    const checks: Record<string, string> = {};
    let healthy = true;

    // Database check
    if (db) {
      try {
        await db.query('SELECT 1');
        checks.database = 'ok';
      } catch (e) {
        checks.database = 'failed';
        healthy = false;
      }
    }

    const status = healthy ? 200 : 503;
    return reply.code(status).send({
      status: healthy ? 'ready' : 'not_ready',
      service: 'assessment-service',
      checks,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });
}
