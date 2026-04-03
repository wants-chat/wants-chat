/**
 * Application logger utility.
 *
 * In development: logs to console normally.
 * In production: suppresses debug/log output, only shows warnings and errors.
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.info('Something happened', data);
 *   logger.warn('Warning message');
 *   logger.error('Error occurred', error);
 */

const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.debug('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.log('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};

export default logger;
