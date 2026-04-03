/**
 * Configuration for Todo1 feature
 */

export const TODO1_CONFIG = {
  // Enable/disable features
  features: {
    dragAndDrop: false, // Coming soon
    search: true,
    filters: true,
    bulkOperations: false, // Coming soon
  },
  
  // API configuration
  api: {
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  // UI configuration
  ui: {
    showEmptyState: true,
    animateTransitions: true,
    confirmDeletes: true,
  },
};

// Development mode detection
export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production';