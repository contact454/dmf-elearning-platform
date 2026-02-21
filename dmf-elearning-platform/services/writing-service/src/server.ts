import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import grammarRoutes from './routes/grammar';
import essayRoutes from './routes/essays';
import promptRoutes from './routes/prompts';
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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'writing-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Readiness probe
app.get('/health/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    service: 'writing-service',
    checks: {},
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/essays', essayRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
  console.log(`✅ Writing Service running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
