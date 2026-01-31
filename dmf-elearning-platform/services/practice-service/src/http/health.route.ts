/**
 * Health check endpoints
 * 
 * - GET /healthz - Liveness probe (always returns 200 if service is running)
 * - GET /readyz - Readiness probe (checks database connectivity)
 * - GET /health - Legacy endpoint (same as /readyz)
 */

import type { FastifyInstance } from 'fastify';
import type { Database } from '@dmf/infra';

export function registerHealthRoute(app: FastifyInstance, db?: Database) {
  // Liveness probe - always returns 200 if service is running
  app.get('/healthz', async (_request, reply) => {
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    return reply.code(200).send({
      status: 'ok',
      ok: true,
      service: 'practice-service',
      version: '0.1.0',
      mode: isE2EMode ? 'e2e' : 'dev',
      timestamp: new Date().toISOString(),
    });
  });

  // Readiness probe - checks database connectivity
  app.get('/readyz', async (_request, reply) => {
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    // Check database connectivity if provided
    if (db) {
      try {
        await db.query('SELECT 1');
        return reply.code(200).send({
          status: 'ready',
          ok: true,
          service: 'practice-service',
          version: '0.1.0',
          mode: isE2EMode ? 'e2e' : 'dev',
          database: 'connected',
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        return reply.code(503).send({
          status: 'not_ready',
          ok: false,
          service: 'practice-service',
          version: '0.1.0',
          mode: isE2EMode ? 'e2e' : 'dev',
          database: 'disconnected',
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // No database - just return ready
    return reply.code(200).send({
      status: 'ready',
      ok: true,
      service: 'practice-service',
      version: '0.1.0',
      mode: isE2EMode ? 'e2e' : 'dev',
      timestamp: new Date().toISOString(),
    });
  });

  // Legacy health endpoint (same as /readyz)
  app.get('/health', async (_request, reply) => {
    const isE2EMode = process.env.DMF_MODE === 'e2e' || process.env.NODE_ENV === 'e2e';
    
    if (db) {
      try {
        await db.query('SELECT 1');
        return reply.code(200).send({
          status: 'ok',
          ok: true,
          service: 'practice-service',
          version: '0.1.0',
          mode: isE2EMode ? 'e2e' : 'dev',
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        return reply.code(503).send({
          status: 'error',
          ok: false,
          service: 'practice-service',
          version: '0.1.0',
          mode: isE2EMode ? 'e2e' : 'dev',
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return reply.code(200).send({
      status: 'ok',
      ok: true,
      service: 'practice-service',
      version: '0.1.0',
      mode: isE2EMode ? 'e2e' : 'dev',
      timestamp: new Date().toISOString(),
    });
  });
}
