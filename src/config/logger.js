/**
 * Simple logger module using native console methods
 * Will be replaced with proper Winston logger implementation in the future
 */

// Define log levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

// Determine current log level based on environment
const getCurrentLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  const configuredLevel = process.env.LOG_LEVEL || (env === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG);
  return configuredLevel;
};

// Get log level priority
const getLogLevelPriority = (level) => {
  switch (level) {
    case LOG_LEVELS.ERROR: return 0;
    case LOG_LEVELS.WARN: return 1;
    case LOG_LEVELS.INFO: return 2;
    case LOG_LEVELS.DEBUG: return 3;
    default: return 2; // Default to INFO
  }
};

// Current log level
const currentLogLevel = getCurrentLogLevel();
const currentLogLevelPriority = getLogLevelPriority(currentLogLevel);

// Format message with timestamp
const formatMessage = (message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${message}${metaString}`;
};

// Logger implementation
const logger = {
  error: (message, meta = {}) => {
    if (currentLogLevelPriority >= getLogLevelPriority(LOG_LEVELS.ERROR)) {
      console.error(formatMessage(message, meta));
    }
  },
  
  warn: (message, meta = {}) => {
    if (currentLogLevelPriority >= getLogLevelPriority(LOG_LEVELS.WARN)) {
      console.warn(formatMessage(message, meta));
    }
  },
  
  info: (message, meta = {}) => {
    if (currentLogLevelPriority >= getLogLevelPriority(LOG_LEVELS.INFO)) {
      console.log(formatMessage(message, meta));
    }
  },
  
  debug: (message, meta = {}) => {
    if (currentLogLevelPriority >= getLogLevelPriority(LOG_LEVELS.DEBUG)) {
      console.log(`[DEBUG] ${formatMessage(message, meta)}`);
    }
  },
  
  // Log API request information
  logApiRequest: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };
    
    const message = `API Request: ${logData.method} ${logData.url} ${logData.status}`;
    
    if (res.statusCode >= 400) {
      logger.warn(message, logData);
    } else {
      logger.info(message, logData);
    }
  }
};

module.exports = logger;

