#!/usr/bin/env node

/**
 * Linear Configuration System
 *
 * Central configuration management for Linear integration.
 * NO HARDCODED VALUES - All parameters must be configurable.
 */

const fs = require('fs');
const path = require('path');

class LinearConfig {
    constructor() {
        this.projectRoot = process.cwd();
        this.configCache = null;
        this.required = [
            'LINEAR_API_KEY',
            'LINEAR_TEAM_ID'
        ];
        this.optional = [
            'LINEAR_PROJECT_ID',
            'LINEAR_TASK_PREFIX',
            'LINEAR_WEBHOOK_SECRET'
        ];
    }

    /**
     * Get complete Linear configuration
     */
    getConfig() {
        if (this.configCache) {
            return this.configCache;
        }

        const config = {
            // Core Linear API settings
            api: {
                url: 'https://api.linear.app/graphql',
                key: this.getRequired('LINEAR_API_KEY'),
                timeout: parseInt(process.env.LINEAR_API_TIMEOUT) || 30000
            },

            // Team and project configuration
            workspace: {
                teamId: this.getRequired('LINEAR_TEAM_ID'),
                teamName: process.env.LINEAR_TEAM_NAME || null,
                projectId: process.env.LINEAR_PROJECT_ID || null,
                projectName: process.env.LINEAR_PROJECT_NAME || null
            },

            // Task configuration
            tasks: {
                prefix: process.env.LINEAR_TASK_PREFIX || this.detectTaskPrefix(),
                defaultState: process.env.LINEAR_DEFAULT_STATE || 'Todo',
                defaultPriority: parseInt(process.env.LINEAR_DEFAULT_PRIORITY) || 3,
                defaultLabels: this.parseArray(process.env.LINEAR_DEFAULT_LABELS),
                estimateUnit: process.env.LINEAR_ESTIMATE_UNIT || 'points'
            },

            // Template configuration
            templates: {
                coverageTask: process.env.LINEAR_COVERAGE_TEMPLATE || 'coverage-gap',
                tddTask: process.env.LINEAR_TDD_TEMPLATE || 'tdd-violation',
                bugTask: process.env.LINEAR_BUG_TEMPLATE || 'bug-fix',
                defaultTemplate: process.env.LINEAR_DEFAULT_TEMPLATE || 'generic'
            },

            // Quality gates
            quality: {
                duplicateThreshold: parseFloat(process.env.LINEAR_DUPLICATE_THRESHOLD) || 0.7,
                titleSimilarityThreshold: parseFloat(process.env.LINEAR_TITLE_SIMILARITY) || 0.8,
                autoMergeDuplicates: process.env.LINEAR_AUTO_MERGE === 'true',
                requireDescription: process.env.LINEAR_REQUIRE_DESCRIPTION !== 'false',
                minDescriptionLength: parseInt(process.env.LINEAR_MIN_DESC_LENGTH) || 50
            },

            // Webhook configuration (optional)
            webhooks: {
                secret: process.env.LINEAR_WEBHOOK_SECRET || null,
                enabled: process.env.LINEAR_WEBHOOKS_ENABLED === 'true',
                port: parseInt(process.env.LINEAR_WEBHOOK_PORT) || 3002
            },

            // Development and testing
            development: {
                mockMode: process.env.LINEAR_MOCK_MODE === 'true',
                dryRun: process.env.LINEAR_DRY_RUN === 'true',
                verbose: process.env.LINEAR_VERBOSE === 'true',
                debugMode: process.env.DEBUG === 'true'
            }
        };

        // Validate configuration
        this.validateConfig(config);

        this.configCache = config;
        return config;
    }

    /**
     * Get required environment variable or throw error
     */
    getRequired(key) {
        const value = process.env[key];
        if (!value) {
            throw new Error(`Required environment variable ${key} is not set. Please configure your Linear integration.`);
        }
        return value;
    }

    /**
     * Parse comma-separated array from environment variable
     */
    parseArray(value) {
        if (!value) return [];
        return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }

    /**
     * Detect task prefix from existing Linear tasks or use intelligent default
     */
    detectTaskPrefix() {
        // Try to detect from existing tasks via API call
        // This would be implemented as an async operation in practice
        // For now, return null to force explicit configuration
        return null;
    }

    /**
     * Validate configuration completeness and correctness
     */
    validateConfig(config) {
        const errors = [];

        // Validate required fields
        if (!config.api.key) {
            errors.push('LINEAR_API_KEY is required');
        }

        if (!config.workspace.teamId) {
            errors.push('LINEAR_TEAM_ID is required');
        }

        // Validate task prefix if provided
        if (config.tasks.prefix && !/^[A-Z]+-?$/.test(config.tasks.prefix)) {
            errors.push('LINEAR_TASK_PREFIX must be uppercase letters followed by optional dash (e.g., TASK-, BUG-, DEV-)');
        }

        // Validate thresholds
        if (config.quality.duplicateThreshold < 0 || config.quality.duplicateThreshold > 1) {
            errors.push('LINEAR_DUPLICATE_THRESHOLD must be between 0 and 1');
        }

        if (config.quality.titleSimilarityThreshold < 0 || config.quality.titleSimilarityThreshold > 1) {
            errors.push('LINEAR_TITLE_SIMILARITY must be between 0 and 1');
        }

        if (errors.length > 0) {
            throw new Error(`Linear configuration errors:\n${errors.map(e => `  - ${e}`).join('\n')}`);
        }
    }

    /**
     * Get configuration for a specific component
     */
    getApiConfig() {
        return this.getConfig().api;
    }

    getWorkspaceConfig() {
        return this.getConfig().workspace;
    }

    getTaskConfig() {
        return this.getConfig().tasks;
    }

    getQualityConfig() {
        return this.getConfig().quality;
    }

    getTemplateConfig() {
        return this.getConfig().templates;
    }

    getWebhookConfig() {
        return this.getConfig().webhooks;
    }

    getDevelopmentConfig() {
        return this.getConfig().development;
    }

    /**
     * Check if Linear is properly configured
     */
    isConfigured() {
        try {
            this.getConfig();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get configuration status and missing requirements
     */
    getConfigurationStatus() {
        const missing = [];
        const present = [];

        // Check required variables
        for (const key of this.required) {
            if (process.env[key]) {
                present.push(key);
            } else {
                missing.push(key);
            }
        }

        // Check optional variables
        const optional = {};
        for (const key of this.optional) {
            optional[key] = !!process.env[key];
        }

        return {
            configured: missing.length === 0,
            required: {
                present,
                missing
            },
            optional,
            recommendations: this.getConfigurationRecommendations(missing, optional)
        };
    }

    /**
     * Get recommendations for improving configuration
     */
    getConfigurationRecommendations(missing, optional) {
        const recommendations = [];

        if (missing.includes('LINEAR_API_KEY')) {
            recommendations.push('Get your Linear API key from https://linear.app/settings/api');
        }

        if (missing.includes('LINEAR_TEAM_ID')) {
            recommendations.push('Find your team ID in Linear settings or use the setup wizard');
        }

        if (!optional.LINEAR_TASK_PREFIX) {
            recommendations.push('Set LINEAR_TASK_PREFIX to customize task naming (e.g., DEV-, BUG-, TASK-)');
        }

        if (!optional.LINEAR_PROJECT_ID) {
            recommendations.push('Set LINEAR_PROJECT_ID to scope tasks to a specific project');
        }

        return recommendations;
    }

    /**
     * Generate environment template
     */
    generateEnvTemplate() {
        return `# Linear Integration Configuration
# Get your API key from: https://linear.app/settings/api

# Required Configuration
LINEAR_API_KEY=your_api_key_here
LINEAR_TEAM_ID=your_team_id_here

# Optional Configuration
LINEAR_PROJECT_ID=your_project_id_here
LINEAR_TASK_PREFIX=TASK-
LINEAR_DEFAULT_STATE=Todo
LINEAR_DEFAULT_PRIORITY=3
LINEAR_DEFAULT_LABELS=tdd,automated
LINEAR_ESTIMATE_UNIT=points

# Quality Settings
LINEAR_DUPLICATE_THRESHOLD=0.7
LINEAR_TITLE_SIMILARITY=0.8
LINEAR_AUTO_MERGE=false
LINEAR_REQUIRE_DESCRIPTION=true
LINEAR_MIN_DESC_LENGTH=50

# Template Configuration
LINEAR_COVERAGE_TEMPLATE=coverage-gap
LINEAR_TDD_TEMPLATE=tdd-violation
LINEAR_BUG_TEMPLATE=bug-fix
LINEAR_DEFAULT_TEMPLATE=generic

# Webhook Configuration (Optional)
LINEAR_WEBHOOK_SECRET=your_webhook_secret_here
LINEAR_WEBHOOKS_ENABLED=false
LINEAR_WEBHOOK_PORT=3002

# Development Settings
LINEAR_MOCK_MODE=false
LINEAR_DRY_RUN=false
LINEAR_VERBOSE=false
DEBUG=false
`;
    }

    /**
     * Save configuration template to file
     */
    saveEnvTemplate(filePath = '.env.linear.template') {
        const template = this.generateEnvTemplate();
        fs.writeFileSync(path.join(this.projectRoot, filePath), template);
        return filePath;
    }

    /**
     * Clear configuration cache (useful for testing)
     */
    clearCache() {
        this.configCache = null;
    }
}

// Export singleton instance
const linearConfig = new LinearConfig();

module.exports = {
    LinearConfig,
    linearConfig,
    getConfig: () => linearConfig.getConfig(),
    getApiConfig: () => linearConfig.getApiConfig(),
    getWorkspaceConfig: () => linearConfig.getWorkspaceConfig(),
    getTaskConfig: () => linearConfig.getTaskConfig(),
    getQualityConfig: () => linearConfig.getQualityConfig(),
    getTemplateConfig: () => linearConfig.getTemplateConfig(),
    getWebhookConfig: () => linearConfig.getWebhookConfig(),
    getDevelopmentConfig: () => linearConfig.getDevelopmentConfig(),
    isConfigured: () => linearConfig.isConfigured(),
    getConfigurationStatus: () => linearConfig.getConfigurationStatus()
};

// CLI interface for configuration management
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
        switch (command) {
            case 'status':
                const status = linearConfig.getConfigurationStatus();
                console.log('Linear Configuration Status:');
                console.log(`Configured: ${status.configured ? '✅' : '❌'}`);

                if (status.required.present.length > 0) {
                    console.log(`\n✅ Required variables set: ${status.required.present.join(', ')}`);
                }

                if (status.required.missing.length > 0) {
                    console.log(`\n❌ Missing required variables: ${status.required.missing.join(', ')}`);
                }

                if (status.recommendations.length > 0) {
                    console.log('\n💡 Recommendations:');
                    status.recommendations.forEach(rec => console.log(`  - ${rec}`));
                }
                break;

            case 'template':
                const filePath = linearConfig.saveEnvTemplate(args[1]);
                console.log(`✅ Environment template saved to: ${filePath}`);
                break;

            case 'validate':
                const config = linearConfig.getConfig();
                console.log('✅ Linear configuration is valid');
                break;

            case 'show':
                const fullConfig = linearConfig.getConfig();
                // Mask sensitive data
                const maskedConfig = JSON.parse(JSON.stringify(fullConfig));
                if (maskedConfig.api.key) {
                    maskedConfig.api.key = maskedConfig.api.key.substring(0, 8) + '...';
                }
                console.log(JSON.stringify(maskedConfig, null, 2));
                break;

            default:
                console.log(`
Linear Configuration Manager

Usage:
  node linear.config.js status      - Show configuration status
  node linear.config.js template    - Generate .env template
  node linear.config.js validate    - Validate current configuration
  node linear.config.js show        - Show current configuration (masked)

Examples:
  node linear.config.js template .env.example
                `);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}
module.exports = LinearConfig;
