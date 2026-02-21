/**
 * Prometheus Metrics Middleware — M8 S24-01
 * Exposes /metrics for Prometheus scraping
 */
import { Request, Response, NextFunction } from 'express';

// Metrics storage (in production, use prom-client)
const metrics = {
    httpRequestsTotal: new Map<string, number>(),
    httpRequestDuration: new Map<string, number[]>(),
    activeConnections: 0,
    startTime: Date.now(),
};

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    metrics.activeConnections++;

    res.on('finish', () => {
        const duration = Date.now() - start;
        const key = `${req.method}:${req.route?.path || req.path}:${res.statusCode}`;

        // Count requests
        metrics.httpRequestsTotal.set(key, (metrics.httpRequestsTotal.get(key) || 0) + 1);

        // Track durations
        const durations = metrics.httpRequestDuration.get(key) || [];
        durations.push(duration);
        if (durations.length > 1000) durations.shift(); // Keep last 1000
        metrics.httpRequestDuration.set(key, durations);

        metrics.activeConnections--;
    });

    next();
}

export function metricsEndpoint(_req: Request, res: Response) {
    const lines: string[] = [];

    // Uptime
    const uptimeSeconds = Math.floor((Date.now() - metrics.startTime) / 1000);
    lines.push(`# HELP dmf_uptime_seconds Uptime in seconds`);
    lines.push(`# TYPE dmf_uptime_seconds gauge`);
    lines.push(`dmf_uptime_seconds ${uptimeSeconds}`);

    // Active connections
    lines.push(`# HELP dmf_active_connections Current active connections`);
    lines.push(`# TYPE dmf_active_connections gauge`);
    lines.push(`dmf_active_connections ${metrics.activeConnections}`);

    // Request totals
    lines.push(`# HELP dmf_http_requests_total Total HTTP requests`);
    lines.push(`# TYPE dmf_http_requests_total counter`);
    for (const [key, count] of metrics.httpRequestsTotal) {
        const [method, path, status] = key.split(':');
        lines.push(`dmf_http_requests_total{method="${method}",path="${path}",status="${status}"} ${count}`);
    }

    // Request durations (p50, p95, p99)
    lines.push(`# HELP dmf_http_request_duration_ms Request duration in ms`);
    lines.push(`# TYPE dmf_http_request_duration_ms summary`);
    for (const [key, durations] of metrics.httpRequestDuration) {
        const [method, path] = key.split(':');
        const sorted = [...durations].sort((a, b) => a - b);
        const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
        const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
        const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
        lines.push(`dmf_http_request_duration_ms{method="${method}",path="${path}",quantile="0.5"} ${p50}`);
        lines.push(`dmf_http_request_duration_ms{method="${method}",path="${path}",quantile="0.95"} ${p95}`);
        lines.push(`dmf_http_request_duration_ms{method="${method}",path="${path}",quantile="0.99"} ${p99}`);
    }

    // Memory
    const mem = process.memoryUsage();
    lines.push(`# HELP dmf_memory_bytes Memory usage`);
    lines.push(`# TYPE dmf_memory_bytes gauge`);
    lines.push(`dmf_memory_bytes{type="rss"} ${mem.rss}`);
    lines.push(`dmf_memory_bytes{type="heapUsed"} ${mem.heapUsed}`);
    lines.push(`dmf_memory_bytes{type="heapTotal"} ${mem.heapTotal}`);

    res.set('Content-Type', 'text/plain');
    res.send(lines.join('\n'));
}
