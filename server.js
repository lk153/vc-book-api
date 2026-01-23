import express from 'express';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import mongoose from 'mongoose';
import config from './src/config/config.js';
import connectDB from './src/config/database.js';
import swaggerSpec from './src/config/swagger.js';
import routes from './src/routes/index.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import requestLogger from './src/middleware/requestLogger.js';
import logger from './src/utils/logger.js';

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware - Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: config.env === 'production' ? undefined : false
}));

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Request ID middleware for correlation
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS configuration - explicit origins
const allowedOrigins = [
  config.web_path,
  'http://localhost:3000',
  'http://localhost:8000'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || config.env === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.header('Access-Control-Expose-Headers', 'X-Request-ID');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging with correlation ID and response timing
app.use(requestLogger);

// Swagger Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Book Order API Documentation',
  customfavIcon: '/favicon.ico'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Book Order API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      books: '/api/v1/books',
      cart: '/api/v1/cart',
      orders: '/api/v1/orders'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  const dbStates = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const dbState = mongoose.connection.readyState;

  res.json({
    status: dbState === 1 ? 'OK' : 'Degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStates[dbState] || 'Unknown'
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;