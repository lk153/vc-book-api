import winston from 'winston';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Custom format for development (readable)
const devFormat = printf(({ level, message, timestamp, requestId, ...metadata }) => {
  let msg = `${timestamp} [${level}]`;
  if (requestId) {
    msg += ` [${requestId}]`;
  }
  msg += `: ${message}`;

  if (Object.keys(metadata).length > 0 && metadata.stack === undefined) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  if (metadata.stack) {
    msg += `\n${metadata.stack}`;
  }
  return msg;
});

// Determine log level based on environment
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Create Winston logger
const logger = winston.createLogger({
  level,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  defaultMeta: { service: 'book-api' },
  transports: [
    // Console transport with environment-specific formatting
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? combine(json())
        : combine(colorize(), devFormat)
    })
  ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: combine(json())
  }));
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    format: combine(json())
  }));
}

// Helper to create child logger with request context
logger.child = (meta) => {
  return {
    info: (message, additionalMeta = {}) => logger.info(message, { ...meta, ...additionalMeta }),
    error: (message, additionalMeta = {}) => logger.error(message, { ...meta, ...additionalMeta }),
    warn: (message, additionalMeta = {}) => logger.warn(message, { ...meta, ...additionalMeta }),
    debug: (message, additionalMeta = {}) => logger.debug(message, { ...meta, ...additionalMeta })
  };
};

export default logger;
