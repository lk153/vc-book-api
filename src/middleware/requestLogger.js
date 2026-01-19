import logger from '../utils/logger.js';

/**
 * Request logging middleware with correlation ID support
 * Logs incoming requests and response times
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Create child logger with request context
  req.logger = logger.child({ requestId: req.id });

  // Log incoming request
  req.logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    req.logger[logLevel](`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length')
    });
  });

  next();
};

export default requestLogger;
