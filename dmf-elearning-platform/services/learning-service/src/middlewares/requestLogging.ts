import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

type RequestLoggingConfig = {
  enabled: boolean;
  includeQueryString: boolean;
  serviceName: string;
};

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return fallback;
}

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') {
    return value.trim() || undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const trimmed = item.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return undefined;
}

function buildRequestId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return `req-${crypto.randomUUID()}`;
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getRequestLoggingConfigFromEnv(): RequestLoggingConfig {
  return {
    enabled: toBoolean(process.env.REQUEST_LOGGING_ENABLED, true),
    includeQueryString: toBoolean(process.env.REQUEST_LOG_INCLUDE_QUERY, false),
    serviceName: process.env.REQUEST_LOG_SERVICE_NAME || 'learning-service',
  };
}

export function createRequestLogging(config: RequestLoggingConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!config.enabled) {
      next();
      return;
    }

    const startedAt = Date.now();
    const requestId = getHeaderValue(req.headers['x-request-id']) || buildRequestId();
    const correlationId = getHeaderValue(req.headers['x-correlation-id']);
    const userId = req.user?.id;

    res.setHeader('x-request-id', requestId);
    if (correlationId) {
      res.setHeader('x-correlation-id', correlationId);
    }

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      const path = config.includeQueryString
        ? req.originalUrl || req.url || req.path
        : req.path || req.url || req.originalUrl || '/';

      const suffixParts = [
        `service=${config.serviceName}`,
        `requestId=${requestId}`,
        correlationId ? `correlationId=${correlationId}` : '',
        userId ? `userId=${userId}` : '',
        `method=${req.method}`,
        `path=${path}`,
        `status=${res.statusCode}`,
        `durationMs=${durationMs}`,
      ].filter(Boolean);

      const message = `[request-log] ${suffixParts.join(' ')}`;
      if (res.statusCode >= 500) {
        console.error(message);
      } else if (res.statusCode >= 400) {
        console.warn(message);
      } else {
        console.log(message);
      }
    });

    next();
  };
}
