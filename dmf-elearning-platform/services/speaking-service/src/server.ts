import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import promptRoutes from './routes/prompts';
import submissionRoutes from './routes/submissions';
import analyzeRoutes from './routes/analyze';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app: Express = express();

// Security middleware
app.use(helmet());
// CORS — read allowed origins from environment variable
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes (disabled in development for performance testing)
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', apiLimiter);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'speaking-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Readiness probe
app.get('/health/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    service: 'speaking-service',
    checks: {},
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`✅ Speaking Service running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎤 Ready to analyze speech!`);
});

export default app;
