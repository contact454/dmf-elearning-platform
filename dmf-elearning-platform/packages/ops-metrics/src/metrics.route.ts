/**
 * Metrics Endpoint
 * 
 * Exposes Prometheus-compatible metrics endpoint.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getMetricsRegistry } from './metrics-registry.js';

export function registerMetricsRoute(app: FastifyInstance) {
  app.get('/metrics', async (_request: FastifyRequest, reply: FastifyReply) => {
    const registry = getMetricsRegistry();
    const metricsText = registry.exportTextFormat();
    
    return reply
      .code(200)
      .header('Content-Type', 'text/plain; version=0.0.4')
      .send(metricsText);
  });
}
