import type { NextFunction, Request, Response } from 'express';

type MonitoringConfig = {
  enabled: boolean;
  windowMs: number;
  alert5xxThreshold: number;
  alert429Threshold: number;
  alertAuthThreshold: number;
  slowRequestMs: number;
  logAllRequests: boolean;
};

type MonitoringCounters = {
  requests: number;
  status5xx: number;
  status429: number;
  status401: number;
  status403: number;
  authFailures: number;
};

function toPositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getMonitoringConfigFromEnv(): MonitoringConfig {
  return {
    enabled: process.env.MONITORING_ALERTS_ENABLED !== 'false',
    windowMs: toPositiveInteger(process.env.MONITORING_WINDOW_MS, 60_000),
    alert5xxThreshold: toPositiveInteger(process.env.MONITORING_5XX_ALERT_THRESHOLD, 5),
    alert429Threshold: toPositiveInteger(process.env.MONITORING_429_ALERT_THRESHOLD, 10),
    alertAuthThreshold: toPositiveInteger(process.env.MONITORING_AUTH_ALERT_THRESHOLD, 25),
    slowRequestMs: toPositiveInteger(process.env.MONITORING_SLOW_REQUEST_MS, 1_500),
    logAllRequests: process.env.MONITORING_LOG_ALL_REQUESTS === 'true',
  };
}

export function createRequestMonitoring(config: MonitoringConfig) {
  let windowStartedAt = Date.now();
  let counters: MonitoringCounters = {
    requests: 0,
    status5xx: 0,
    status429: 0,
    status401: 0,
    status403: 0,
    authFailures: 0,
  };
  let alerted5xx = false;
  let alerted429 = false;
  let alertedAuth = false;

  function rotateWindowIfNeeded(now: number) {
    if (now - windowStartedAt < config.windowMs) {
      return;
    }

    windowStartedAt = now;
    counters = {
      requests: 0,
      status5xx: 0,
      status429: 0,
      status401: 0,
      status403: 0,
      authFailures: 0,
    };
    alerted5xx = false;
    alerted429 = false;
    alertedAuth = false;
  }

  return (req: Request, res: Response, next: NextFunction) => {
    if (!config.enabled) {
      next();
      return;
    }

    const startedAt = Date.now();

    res.on('finish', () => {
      const now = Date.now();
      const durationMs = now - startedAt;
      rotateWindowIfNeeded(now);

      counters.requests += 1;
      if (res.statusCode >= 500) {
        counters.status5xx += 1;
      }
      if (res.statusCode === 429) {
        counters.status429 += 1;
      }
      if (res.statusCode === 401) {
        counters.status401 += 1;
        counters.authFailures += 1;
      }
      if (res.statusCode === 403) {
        counters.status403 += 1;
        counters.authFailures += 1;
      }

      const requestPath = req.originalUrl || req.path;

      if (config.logAllRequests) {
        console.log(
          `[request] method=${req.method} path=${requestPath} status=${res.statusCode} durationMs=${durationMs}`
        );
      }

      if (durationMs >= config.slowRequestMs) {
        console.warn(
          `[monitoring] slow request method=${req.method} path=${requestPath} status=${res.statusCode} durationMs=${durationMs}`
        );
      }

      if (res.statusCode === 429) {
        console.warn(
          `[monitoring] rate-limited request method=${req.method} path=${requestPath} durationMs=${durationMs}`
        );
      }

      if (res.statusCode >= 500) {
        console.error(
          `[monitoring] server error response method=${req.method} path=${requestPath} status=${res.statusCode} durationMs=${durationMs}`
        );
      }

      if (res.statusCode === 401 || res.statusCode === 403) {
        console.warn(
          `[monitoring] auth failure response method=${req.method} path=${requestPath} status=${res.statusCode} durationMs=${durationMs}`
        );
      }

      if (!alerted429 && counters.status429 >= config.alert429Threshold) {
        alerted429 = true;
        console.warn(
          `[monitoring] 429 spike detected windowMs=${config.windowMs} threshold=${config.alert429Threshold} current=${counters.status429}`
        );
      }

      if (!alerted5xx && counters.status5xx >= config.alert5xxThreshold) {
        alerted5xx = true;
        console.error(
          `[monitoring] 5xx spike detected windowMs=${config.windowMs} threshold=${config.alert5xxThreshold} current=${counters.status5xx}`
        );
      }

      if (!alertedAuth && counters.authFailures >= config.alertAuthThreshold) {
        alertedAuth = true;
        console.warn(
          `[monitoring] auth anomaly detected windowMs=${config.windowMs} threshold=${config.alertAuthThreshold} current=${counters.authFailures} status401=${counters.status401} status403=${counters.status403}`
        );
      }
    });

    next();
  };
}
