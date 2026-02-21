import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { createRateLimit, getRateLimitConfigFromEnv } from './middlewares/rateLimit';
import { createRequestLogging, getRequestLoggingConfigFromEnv } from './middlewares/requestLogging';
import { createRequestMonitoring, getMonitoringConfigFromEnv } from './middlewares/requestMonitoring';
import { createSecurityHeaders, getSecurityHeadersConfigFromEnv } from './middlewares/securityHeaders';
import { metricsMiddleware, metricsEndpoint } from './middlewares/metrics';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3003;
const rateLimitConfig = getRateLimitConfigFromEnv();
const requestLoggingConfig = getRequestLoggingConfigFromEnv();
const monitoringConfig = getMonitoringConfigFromEnv();
const securityHeadersConfig = getSecurityHeadersConfigFromEnv();

// Middleware — security headers first
app.use(createSecurityHeaders(securityHeadersConfig));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(createRequestLogging(requestLoggingConfig));
app.use(createRequestMonitoring(monitoringConfig));
app.use(metricsMiddleware);

// Prometheus metrics endpoint
app.get('/metrics', metricsEndpoint);

// API Routes
app.use(
  '/api',
  createRateLimit('api-global', {
    windowMs: rateLimitConfig.globalWindowMs,
    max: rateLimitConfig.globalMax,
  })
);
app.use(
  '/api/review',
  createRateLimit('api-review', {
    windowMs: rateLimitConfig.reviewWindowMs,
    max: rateLimitConfig.reviewMax,
  })
);
app.use(
  '/api/audio',
  createRateLimit('api-audio', {
    windowMs: rateLimitConfig.audioWindowMs,
    max: rateLimitConfig.audioMax,
  })
);

app.use('/api', routes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    service: 'DMF Learning Service',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      vocabulary: {
        list: '/api/vocabulary?level=A1&topic=food&pos=noun&search=&limit=50&offset=0',
        random: '/api/vocabulary/random?count=10&level=A1',
        stats: '/api/vocabulary/stats',
        levels: '/api/vocabulary/levels',
        topics: '/api/vocabulary/topics?level=A1',
        byId: '/api/vocabulary/:id',
        byWord: '/api/vocabulary/word/:word',
      },
      resources: {
        levels: '/api/resources/levels',
        topics: '/api/resources/:level/topics',
        data: '/api/resources/:level/:topic',
        summary: '/api/resources/:level/summary',
      }
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      details: {
        path: req.path,
      },
    },
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? { message: err.message } : undefined,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🚀 DMF Learning Service`);
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 Resource Hub: storage/resource-hub`);
  console.log('═══════════════════════════════════════════════════════════');
});

export default app;
