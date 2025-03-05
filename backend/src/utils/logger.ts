/**
 * A simple logger utility for standardized logging
 */

const logLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

// Determine if we're in production
const isProd = process.env.NODE_ENV === 'production';

// Helper to format date consistently
const formatDate = () => {
  return new Date().toISOString();
};

// Log with timestamp and level
const log = (level: string, message: string, ...args: any[]) => {
  const timestamp = formatDate();
  console.log(`${timestamp} [${level}] ${message}`, ...args);
};

export const logger = {
  error: (message: string, ...args: any[]) => {
    log(logLevels.ERROR, message, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    log(logLevels.WARN, message, ...args);
  },
  
  info: (message: string, ...args: any[]) => {
    log(logLevels.INFO, message, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    // Only log debug messages in non-production environments
    if (!isProd) {
      log(logLevels.DEBUG, message, ...args);
    }
  },
}; 