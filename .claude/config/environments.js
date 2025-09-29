/**
 * Environment Configuration for Claude Agentic Workflow System
 *
 * Supports development, staging, and production environments
 * with appropriate settings for each stage.
 *
 * NO HARDCODED LINEAR PARAMETERS - All configuration comes from
 * environment variables and the central config system.
 */

const path = require('path');

/**
 * Get Linear configuration using the central config system
 * This ensures no hardcoded values and proper validation
 */
function getLinearConfig(envSuffix = '') {
    // Use environment-specific variables if available
    const apiKeyVar = `LINEAR_API_KEY${envSuffix}`;
    const teamIdVar = `LINEAR_TEAM_ID${envSuffix}`;
    const projectIdVar = `LINEAR_PROJECT_ID${envSuffix}`;
    const webhookSecretVar = `LINEAR_WEBHOOK_SECRET${envSuffix}`;

    const config = {
        apiUrl: 'https://api.linear.app/graphql',
        apiKey: process.env[apiKeyVar] || process.env.LINEAR_API_KEY,
        teamId: process.env[teamIdVar] || process.env.LINEAR_TEAM_ID,
        projectId: process.env[projectIdVar] || process.env.LINEAR_PROJECT_ID,
        webhookSecret: process.env[webhookSecretVar] || process.env.LINEAR_WEBHOOK_SECRET,
        taskPrefix: process.env.LINEAR_TASK_PREFIX,
        defaultState: process.env.LINEAR_DEFAULT_STATE || 'Todo',
        defaultPriority: parseInt(process.env.LINEAR_DEFAULT_PRIORITY) || 3,
        defaultLabels: process.env.LINEAR_DEFAULT_LABELS ?
            process.env.LINEAR_DEFAULT_LABELS.split(',').map(l => l.trim()) : []
    };

    // Determine mock mode - only if no API key is provided
    config.mockMode = !config.apiKey;

    return config;
}

/**
 * Get environment-specific webhook URL
 */
function getWebhookUrl(environment) {
    // Use environment-specific webhook URL or construct from base URL
    const baseUrl = process.env.WEBHOOK_BASE_URL ||
                   process.env[`WEBHOOK_BASE_URL_${environment.toUpperCase()}`];

    if (baseUrl) {
        return `${baseUrl}/webhooks/linear`;
    }

    // Default patterns for different environments
    switch (environment) {
        case 'development':
            return 'http://localhost:3000/webhooks/linear';
        case 'staging':
            return process.env.STAGING_WEBHOOK_URL || 'https://staging.example.com/webhooks/linear';
        case 'production':
            return process.env.PRODUCTION_WEBHOOK_URL || 'https://example.com/webhooks/linear';
        default:
            return 'http://localhost:3000/webhooks/linear';
    }
}

const environments = {
    development: {
        name: 'development',

        // Agent Settings
        agents: {
            maxConcurrentAgents: parseInt(process.env.DEV_MAX_CONCURRENT_AGENTS) || 3,
            memoryLimitMB: parseInt(process.env.DEV_MEMORY_LIMIT_MB) || 150,
            timeoutMs: parseInt(process.env.DEV_TIMEOUT_MS) || 60000,
            debugMode: process.env.DEV_DEBUG_MODE === 'true' || true,
            verbose: process.env.DEV_VERBOSE === 'true' || true
        },

        // Memory Management
        memory: {
            maxMemoryMB: parseInt(process.env.DEV_MAX_MEMORY_MB) || 150,
            warningThresholdMB: parseInt(process.env.DEV_WARNING_THRESHOLD_MB) || 120,
            circuitBreakerEnabled: process.env.DEV_CIRCUIT_BREAKER !== 'false',
            garbageCollectionFrequency: parseInt(process.env.DEV_GC_FREQUENCY) || 1000,
            memoryCheckInterval: parseInt(process.env.DEV_MEMORY_CHECK_INTERVAL) || 500
        },

        // Linear Integration (Development)
        linear: {
            ...getLinearConfig('_DEV'),
            webhookUrl: getWebhookUrl('development'),
            rateLimiting: {
                enabled: process.env.DEV_LINEAR_RATE_LIMITING === 'true' || false,
                requestsPerMinute: parseInt(process.env.DEV_LINEAR_RPM) || 200
            }
        },

        // File Processing
        fileProcessing: {
            maxFileSize: parseInt(process.env.DEV_MAX_FILE_SIZE) || (1024 * 1024), // 1MB
            maxTotalFiles: parseInt(process.env.DEV_MAX_TOTAL_FILES) || 20,
            maxFilesPerBatch: parseInt(process.env.DEV_MAX_FILES_PER_BATCH) || 5,
            ignoredPatterns: (process.env.DEV_IGNORED_PATTERNS ||
                'node_modules/**,.git/**,**/*.min.js,coverage/**,build/**')
                .split(',').map(p => p.trim())
        },

        // Testing
        testing: {
            enableE2E: process.env.DEV_ENABLE_E2E !== 'false',
            enableMemoryTests: process.env.DEV_ENABLE_MEMORY_TESTS !== 'false',
            testTimeout: parseInt(process.env.DEV_TEST_TIMEOUT) || 30000,
            coverageThreshold: parseInt(process.env.DEV_COVERAGE_THRESHOLD) || 70
        },

        // Logging
        logging: {
            level: process.env.DEV_LOG_LEVEL || 'debug',
            enableConsole: process.env.DEV_ENABLE_CONSOLE !== 'false',
            enableFile: process.env.DEV_ENABLE_FILE_LOG === 'true'
        }
    },

    staging: {
        name: 'staging',

        // Agent Settings
        agents: {
            maxConcurrentAgents: parseInt(process.env.STAGING_MAX_CONCURRENT_AGENTS) || 5,
            memoryLimitMB: parseInt(process.env.STAGING_MEMORY_LIMIT_MB) || 200,
            timeoutMs: parseInt(process.env.STAGING_TIMEOUT_MS) || 120000,
            debugMode: process.env.STAGING_DEBUG_MODE === 'true',
            verbose: process.env.STAGING_VERBOSE !== 'false'
        },

        // Memory Management
        memory: {
            maxMemoryMB: parseInt(process.env.STAGING_MAX_MEMORY_MB) || 200,
            warningThresholdMB: parseInt(process.env.STAGING_WARNING_THRESHOLD_MB) || 160,
            circuitBreakerEnabled: process.env.STAGING_CIRCUIT_BREAKER !== 'false',
            garbageCollectionFrequency: parseInt(process.env.STAGING_GC_FREQUENCY) || 2000,
            memoryCheckInterval: parseInt(process.env.STAGING_MEMORY_CHECK_INTERVAL) || 1000
        },

        // Linear Integration (Staging)
        linear: {
            ...getLinearConfig('_STAGING'),
            webhookUrl: getWebhookUrl('staging'),
            rateLimiting: {
                enabled: process.env.STAGING_LINEAR_RATE_LIMITING !== 'false',
                requestsPerMinute: parseInt(process.env.STAGING_LINEAR_RPM) || 150
            }
        },

        // File Processing
        fileProcessing: {
            maxFileSize: parseInt(process.env.STAGING_MAX_FILE_SIZE) || (2 * 1024 * 1024), // 2MB
            maxTotalFiles: parseInt(process.env.STAGING_MAX_TOTAL_FILES) || 50,
            maxFilesPerBatch: parseInt(process.env.STAGING_MAX_FILES_PER_BATCH) || 10,
            ignoredPatterns: (process.env.STAGING_IGNORED_PATTERNS ||
                'node_modules/**,.git/**,**/*.min.js,coverage/**,build/**,dist/**')
                .split(',').map(p => p.trim())
        },

        // Testing
        testing: {
            enableE2E: process.env.STAGING_ENABLE_E2E !== 'false',
            enableMemoryTests: process.env.STAGING_ENABLE_MEMORY_TESTS !== 'false',
            testTimeout: parseInt(process.env.STAGING_TEST_TIMEOUT) || 60000,
            coverageThreshold: parseInt(process.env.STAGING_COVERAGE_THRESHOLD) || 80
        },

        // Monitoring
        monitoring: {
            enabled: process.env.STAGING_MONITORING !== 'false',
            healthCheckInterval: parseInt(process.env.STAGING_HEALTH_CHECK_INTERVAL) || 30000,
            metricsCollection: process.env.STAGING_METRICS_COLLECTION !== 'false',
            alerting: {
                enabled: process.env.STAGING_ALERTING === 'true',
                webhookUrl: process.env.ALERT_WEBHOOK_URL_STAGING
            }
        },

        // Logging
        logging: {
            level: process.env.STAGING_LOG_LEVEL || 'info',
            enableConsole: process.env.STAGING_ENABLE_CONSOLE !== 'false',
            enableFile: process.env.STAGING_ENABLE_FILE_LOG !== 'false',
            logFile: process.env.STAGING_LOG_FILE || '/var/log/linear-tdd-workflow/staging.log'
        }
    },

    production: {
        name: 'production',

        // Agent Settings
        agents: {
            maxConcurrentAgents: parseInt(process.env.PROD_MAX_CONCURRENT_AGENTS) || 10,
            memoryLimitMB: parseInt(process.env.PROD_MEMORY_LIMIT_MB) || 500,
            timeoutMs: parseInt(process.env.PROD_TIMEOUT_MS) || 300000,
            debugMode: process.env.PROD_DEBUG_MODE === 'true',
            verbose: process.env.PROD_VERBOSE === 'true'
        },

        // Memory Management
        memory: {
            maxMemoryMB: parseInt(process.env.PROD_MAX_MEMORY_MB) || 500,
            warningThresholdMB: parseInt(process.env.PROD_WARNING_THRESHOLD_MB) || 400,
            circuitBreakerEnabled: process.env.PROD_CIRCUIT_BREAKER !== 'false',
            garbageCollectionFrequency: parseInt(process.env.PROD_GC_FREQUENCY) || 5000,
            memoryCheckInterval: parseInt(process.env.PROD_MEMORY_CHECK_INTERVAL) || 2000
        },

        // Linear Integration (Production)
        linear: {
            ...getLinearConfig(),
            webhookUrl: getWebhookUrl('production'),
            rateLimiting: {
                enabled: process.env.PROD_LINEAR_RATE_LIMITING !== 'false',
                requestsPerMinute: parseInt(process.env.PROD_LINEAR_RPM) || 100
            }
        },

        // File Processing
        fileProcessing: {
            maxFileSize: parseInt(process.env.PROD_MAX_FILE_SIZE) || (5 * 1024 * 1024), // 5MB
            maxTotalFiles: parseInt(process.env.PROD_MAX_TOTAL_FILES) || 100,
            maxFilesPerBatch: parseInt(process.env.PROD_MAX_FILES_PER_BATCH) || 20,
            ignoredPatterns: (process.env.PROD_IGNORED_PATTERNS ||
                'node_modules/**,.git/**,**/*.min.js,coverage/**,build/**,dist/**,**/*.log')
                .split(',').map(p => p.trim())
        },

        // Testing
        testing: {
            enableE2E: process.env.PROD_ENABLE_E2E === 'true', // Disabled by default in production
            enableMemoryTests: process.env.PROD_ENABLE_MEMORY_TESTS === 'true',
            testTimeout: parseInt(process.env.PROD_TEST_TIMEOUT) || 120000,
            coverageThreshold: parseInt(process.env.PROD_COVERAGE_THRESHOLD) || 90
        },

        // Security
        security: {
            enableAuditLogging: process.env.PROD_AUDIT_LOGGING !== 'false',
            requireAuthentication: process.env.PROD_REQUIRE_AUTH !== 'false',
            allowedOrigins: (process.env.PROD_ALLOWED_ORIGINS ||
                'https://app.linear.app')
                .split(',').map(o => o.trim())
        },

        // Monitoring
        monitoring: {
            enabled: process.env.PROD_MONITORING !== 'false',
            healthCheckInterval: parseInt(process.env.PROD_HEALTH_CHECK_INTERVAL) || 10000,
            metricsCollection: process.env.PROD_METRICS_COLLECTION !== 'false',
            performanceMonitoring: process.env.PROD_PERFORMANCE_MONITORING !== 'false',
            alerting: {
                enabled: process.env.PROD_ALERTING !== 'false',
                webhookUrl: process.env.ALERT_WEBHOOK_URL,
                escalationLevels: (process.env.PROD_ESCALATION_LEVELS ||
                    'warning,critical,emergency')
                    .split(',').map(l => l.trim())
            }
        },

        // Backup
        backup: {
            enabled: process.env.PROD_BACKUP !== 'false',
            schedule: process.env.PROD_BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
            retentionDays: parseInt(process.env.PROD_BACKUP_RETENTION) || 30
        },

        // Logging
        logging: {
            level: process.env.PROD_LOG_LEVEL || 'warn',
            enableConsole: process.env.PROD_ENABLE_CONSOLE === 'true',
            enableFile: process.env.PROD_ENABLE_FILE_LOG !== 'false',
            logFile: process.env.PROD_LOG_FILE || '/var/log/linear-tdd-workflow/production.log',
            enableStructuredLogging: process.env.PROD_STRUCTURED_LOGGING !== 'false',
            enableLogRotation: process.env.PROD_LOG_ROTATION !== 'false'
        }
    }
};

/**
 * Get current environment configuration
 */
function getCurrentEnvironment() {
    const env = process.env.NODE_ENV || 'development';

    if (!environments[env]) {
        throw new Error(`Unknown environment: ${env}. Valid environments: ${Object.keys(environments).join(', ')}`);
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
    const warnings = [];

    // Linear API key is required unless in mock mode
    if (!config.linear.mockMode && !config.linear.apiKey) {
        required.push('LINEAR_API_KEY is required for non-mock mode');
    }

    // Team ID is required for Linear integration
    if (!config.linear.teamId && !config.linear.mockMode) {
        required.push('LINEAR_TEAM_ID is required for Linear integration');
    }

    // Webhook secret recommended for production
    if (config.name === 'production' && !config.linear.webhookSecret) {
        warnings.push('LINEAR_WEBHOOK_SECRET recommended for production webhook security');
    }

    // Alerting webhook URL required if alerting is enabled
    if (config.monitoring?.alerting?.enabled && !config.monitoring.alerting.webhookUrl) {
        required.push('ALERT_WEBHOOK_URL required when alerting is enabled');
    }

    if (required.length > 0) {
        throw new Error(`Environment validation failed:\n${required.map(r => `  - ${r}`).join('\n')}`);
    }

    if (warnings.length > 0 && process.env.SUPPRESS_WARNINGS !== 'true') {
        console.warn(`Environment warnings:\n${warnings.map(w => `  - ${w}`).join('\n')}`);
    }
}

/**
 * Get environment-specific database configuration
 */
function getDatabaseConfig() {
    const env = getCurrentEnvironment();

    const dbConfigs = {
        development: {
            type: 'sqlite',
            database: ':memory:'
        },
        staging: {
            type: 'postgresql',
            host: process.env.DB_HOST_STAGING || process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT_STAGING || process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME_STAGING || process.env.DB_NAME,
            username: process.env.DB_USER_STAGING || process.env.DB_USER,
            password: process.env.DB_PASSWORD_STAGING || process.env.DB_PASSWORD
        },
        production: {
            type: 'postgresql',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: process.env.DB_SSL !== 'false',
            connectionPooling: {
                min: parseInt(process.env.DB_POOL_MIN) || 2,
                max: parseInt(process.env.DB_POOL_MAX) || 10,
                acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 30000,
                idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000
            }
        }
    };

    return dbConfigs[env.name];
}

/**
 * Get configuration status for debugging
 */
function getConfigurationStatus() {
    const env = getCurrentEnvironment();

    return {
        environment: env.name,
        linearConfigured: !env.linear.mockMode && !!env.linear.apiKey && !!env.linear.teamId,
        linearMockMode: env.linear.mockMode,
        monitoringEnabled: env.monitoring?.enabled || false,
        backupEnabled: env.backup?.enabled || false,
        securityEnabled: env.security?.requireAuthentication || false,
        configurationValues: {
            hasLinearApiKey: !!env.linear.apiKey,
            hasLinearTeamId: !!env.linear.teamId,
            hasLinearProjectId: !!env.linear.projectId,
            hasTaskPrefix: !!env.linear.taskPrefix,
            hasWebhookSecret: !!env.linear.webhookSecret,
            maxConcurrentAgents: env.agents.maxConcurrentAgents,
            memoryLimit: env.memory.maxMemoryMB,
            coverageThreshold: env.testing.coverageThreshold
        }
    };
}

module.exports = {
    environments,
    getCurrentEnvironment,
    getDatabaseConfig,
    validateEnvironmentVariables,
    getConfigurationStatus,
    getLinearConfig,
    getWebhookUrl
};