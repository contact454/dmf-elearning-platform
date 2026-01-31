/**
 * HTTP Metrics Middleware
 * 
 * Records HTTP request metrics (counters and histograms).
 * 
 * Usage: Register as onRequest hook, then register onResponse hook separately on app.
 */

import type { FastifyRequest } from 'fastify';
import { getMetricsRegistry } from './metrics-registry.js';

export function httpMetricsMiddleware(_serviceName: string) {
  return async (request: FastifyRequest) => {
    // Store start time in request for onResponse hook
    (request as any).__metricsStartTime = Date.now();
  };
}

/**
 * Register onResponse hook for metrics (call this on app instance)
 */
export function registerHttpMetricsResponseHook(app: any, serviceName: string) {
  const registry = getMetricsRegistry();

  app.addHook('onResponse', async (request: FastifyRequest, reply: any) => {
    const startTime = (request as any).__metricsStartTime;
    if (!startTime) {
      return; // No start time recorded
    }

    const duration = Date.now() - startTime;
    const route = request.routerPath || request.url.split('?')[0];
    const method = request.method;
    const status = reply.statusCode.toString();
    
    // Increment request counter
    registry.incrementCounter('http_requests_total', {
      service: serviceName,
      route,
      method,
      status,
    });

    // Record duration histogram
    registry.observeHistogram('http_request_duration_ms', {
      service: serviceName,
      route,
      method,
    }, duration);
  });
}
