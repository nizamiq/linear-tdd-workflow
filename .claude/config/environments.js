/**
 * Environment Configuration for Claude Agentic Workflow System
 *
 * Supports development, staging, and production environments
 * with appropriate settings for each stage.
 */

const path = require('path');

const environments = {
  development: {
    name: 'development',

    // Agent Settings
    agents: {
      maxConcurrentAgents: 3,
      memoryLimitMB: 150,
      timeoutMs: 60000,
      debugMode: true,
      verbose: true
    },

    // Memory Management
    memory: {
      maxMemoryMB: 150,
      warningThresholdMB: 120,
      circuitBreakerEnabled: true,
      garbageCollectionFrequency: 1000,
      memoryCheckInterval: 500
    },

    // Linear Integration (Development)
    linear: {
      apiUrl: 'https://api.linear.app/graphql',
      apiKey: process.env.LINEAR_API_KEY_DEV || 'dev-mock-key',
      teamId: process.env.LINEAR_TEAM_ID_DEV || 'a-coders-dev',
      projectId: process.env.LINEAR_PROJECT_ID_DEV || 'ai-coding-dev',
      webhookUrl: 'http://localhost:3000/webhooks/linear',
      webhookSecret: process.env.LINEAR_WEBHOOK_SECRET_DEV || 'dev-secret',
      mockMode: !process.env.LINEAR_API_KEY_DEV // Use mock if no real key
    },

    // File Processing
    fileProcessing: {
      maxFileSize: 1024 * 1024, // 1MB
      maxTotalFiles: 20,
      maxFilesPerBatch: 5,
      ignoredPatterns: [
        'node_modules/**',
        '.git/**',
        '**/*.min.js',
        'coverage/**',
        'build/**'
      ]
    },

    // Testing
    testing: {
      enableE2E: true,
      enableMemoryTests: true,
      testTimeout: 30000,
      coverageThreshold: 70
    },

    // Logging
    logging: {
      level: 'debug',
      enableConsole: true,
      enableFile: false
    }
  },

  staging: {
    name: 'staging',

    // Agent Settings
    agents: {
      maxConcurrentAgents: 5,
      memoryLimitMB: 200,
      timeoutMs: 120000,
      debugMode: false,
      verbose: true
    },

    // Memory Management
    memory: {
      maxMemoryMB: 200,
      warningThresholdMB: 160,
      circuitBreakerEnabled: true,
      garbageCollectionFrequency: 2000,
      memoryCheckInterval: 1000
    },

    // Linear Integration (Staging)
    linear: {
      apiUrl: 'https://api.linear.app/graphql',
      apiKey: process.env.LINEAR_API_KEY_STAGING,
      teamId: process.env.LINEAR_TEAM_ID_STAGING || 'a-coders-staging',
      projectId: process.env.LINEAR_PROJECT_ID_STAGING || 'ai-coding-staging',
      webhookUrl: 'https://staging.linear-tdd-workflow.com/webhooks/linear',
      webhookSecret: process.env.LINEAR_WEBHOOK_SECRET_STAGING,
      mockMode: false
    },

    // File Processing
    fileProcessing: {
      maxFileSize: 2 * 1024 * 1024, // 2MB
      maxTotalFiles: 50,
      maxFilesPerBatch: 10,
      ignoredPatterns: [
        'node_modules/**',
        '.git/**',
        '**/*.min.js',
        'coverage/**',
        'build/**',
        'dist/**'
      ]
    },

    // Testing
    testing: {
      enableE2E: true,
      enableMemoryTests: true,
      testTimeout: 60000,
      coverageThreshold: 80
    },

    // Monitoring
    monitoring: {
      enabled: true,
      healthCheckInterval: 30000,
      metricsCollection: true,
      alerting: {
        enabled: true,
        webhookUrl: process.env.ALERT_WEBHOOK_URL_STAGING
      }
    },

    // Logging
    logging: {
      level: 'info',
      enableConsole: true,
      enableFile: true,
      logFile: '/var/log/linear-tdd-workflow/staging.log'
    }
  },

  production: {
    name: 'production',

    // Agent Settings
    agents: {
      maxConcurrentAgents: 10,
      memoryLimitMB: 500,
      timeoutMs: 300000,
      debugMode: false,
      verbose: false
    },

    // Memory Management
    memory: {
      maxMemoryMB: 500,
      warningThresholdMB: 400,
      circuitBreakerEnabled: true,
      garbageCollectionFrequency: 5000,
      memoryCheckInterval: 2000
    },

    // Linear Integration (Production)
    linear: {
      apiUrl: 'https://api.linear.app/graphql',
      apiKey: process.env.LINEAR_API_KEY,
      teamId: process.env.LINEAR_TEAM_ID || 'a-coders',
      projectId: process.env.LINEAR_PROJECT_ID || 'ai-coding',
      webhookUrl: 'https://linear-tdd-workflow.com/webhooks/linear',
      webhookSecret: process.env.LINEAR_WEBHOOK_SECRET,
      mockMode: false,
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 100
      }
    },

    // File Processing
    fileProcessing: {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxTotalFiles: 100,
      maxFilesPerBatch: 20,
      ignoredPatterns: [
        'node_modules/**',
        '.git/**',
        '**/*.min.js',
        'coverage/**',
        'build/**',
        'dist/**',
        '**/*.log'
      ]
    },

    // Testing
    testing: {
      enableE2E: false, // Disable in production
      enableMemoryTests: false,
      testTimeout: 120000,
      coverageThreshold: 90
    },

    // Security
    security: {
      enableAuditLogging: true,
      requireAuthentication: true,
      allowedOrigins: [
        'https://linear-tdd-workflow.com',
        'https://app.linear.app'
      ]
    },

    // Monitoring
    monitoring: {
      enabled: true,
      healthCheckInterval: 10000,
      metricsCollection: true,
      performanceMonitoring: true,
      alerting: {
        enabled: true,
        webhookUrl: process.env.ALERT_WEBHOOK_URL,
        escalationLevels: ['warning', 'critical', 'emergency']
      }
    },

    // Backup
    backup: {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      retentionDays: 30
    },

    // Logging
    logging: {
      level: 'warn',
      enableConsole: false,
      enableFile: true,
      logFile: '/var/log/linear-tdd-workflow/production.log',
      enableStructuredLogging: true,
      enableLogRotation: true
    }
  }
};

/**
 * Get current environment configuration
 */
function getCurrentEnvironment() {
  const env = process.env.NODE_ENV || 'development';

  if (!environments[env]) {
    throw new Error(`Unknown environment: ${env}`);
  }

  const config = environments[env];

  // Validate required environment variables for staging/production
  if (env !== 'development') {
    validateEnvironmentVariables(config);
  }

  return config;
}

/**
 * Validate required environment variables
 */
function validateEnvironmentVariables(config) {
  const required = [];

  if (!config.linear.mockMode && !config.linear.apiKey) {
    required.push('LINEAR_API_KEY');
  }

  if (config.monitoring.alerting.enabled && !config.monitoring.alerting.webhookUrl) {
    required.push('ALERT_WEBHOOK_URL');
  }

  if (required.length > 0) {
    throw new Error(`Missing required environment variables: ${required.join(', ')}`);
  }
}

/**
 * Get environment-specific database configuration
 */
function getDatabaseConfig() {
  const env = getCurrentEnvironment();

  return {
    development: {
      type: 'sqlite',
      database: ':memory:'
    },
    staging: {
      type: 'postgresql',
      host: process.env.DB_HOST_STAGING,
      port: process.env.DB_PORT_STAGING || 5432,
      database: process.env.DB_NAME_STAGING,
      username: process.env.DB_USER_STAGING,
      password: process.env.DB_PASSWORD_STAGING
    },
    production: {
      type: 'postgresql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: true,
      connectionPooling: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000
      }
    }
  }[env.name];
}

module.exports = {
  environments,
  getCurrentEnvironment,
  getDatabaseConfig,
  validateEnvironmentVariables
};