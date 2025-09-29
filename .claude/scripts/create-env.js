#!/usr/bin/env node

/**
 * Environment Setup Script
 *
 * Creates necessary environment configuration for the
 * Claude Agentic Workflow System
 */

const fs = require('fs');
const path = require('path');

class EnvironmentSetup {
  constructor() {
    this.projectRoot = process.cwd();
  }

  log(message, type = 'info') {
    const emoji = {
      info: '📝',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type] || '📝';

    console.log(`${emoji} ${message}`);
  }

  /**
   * Create .env file if it doesn't exist
   */
  createDotEnv() {
    const envPath = path.join(this.projectRoot, '.env');
    const examplePath = path.join(this.projectRoot, '.env.example');

    if (fs.existsSync(envPath)) {
      this.log('.env file already exists', 'info');
      return;
    }

    // Create .env from example if it exists
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      this.log('Created .env from .env.example', 'success');
    } else {
      // Create basic .env file
      const envContent = `# Claude Agentic Workflow System Configuration
# Copy this file to .env and fill in your actual values

# Linear Integration
# Get your API key from: https://linear.app/settings/api
LINEAR_API_KEY=your_linear_api_key_here
LINEAR_TEAM_ID=your_team_id_here
LINEAR_PROJECT_ID=your_project_id_here
LINEAR_TASK_PREFIX=TASK-
LINEAR_WEBHOOK_SECRET=your_webhook_secret_here

# Environment Settings
NODE_ENV=development
CLAUDE_ENVIRONMENT=development

# TDD Gate Enforcer Settings
TDD_MINIMUM_COVERAGE=80
TDD_MINIMUM_DIFF_COVERAGE=80
TDD_REQUIRE_FAILING_TEST_FIRST=true

# Webhook Server Settings
WEBHOOK_PORT=3000

# Agent Configuration
AGENT_MAX_CONCURRENT=5
AGENT_TIMEOUT=300000
AGENT_MEMORY_LIMIT=512

# CI/CD Settings
CI_PROVIDER=github
CI_WEBHOOK_SECRET=your_ci_webhook_secret_here

# Monitoring
MONITORING_ENABLED=true
PERFORMANCE_TRACKING=true
ERROR_REPORTING=true
`;

      fs.writeFileSync(envPath, envContent);
      this.log('Created .env file with default configuration', 'success');
    }
  }

  /**
   * Create necessary directories
   */
  createDirectories() {
    const directories = [
      '.claude/config',
      '.claude/logs',
      '.claude/temp',
      'reports/workflows',
      'reports/architecture',
      'reports/refactoring',
      'coverage',
      'docs/api'
    ];

    directories.forEach(dir => {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.log(`Created directory: ${dir}`, 'success');
      }
    });
  }

  /**
   * Create TDD configuration
   */
  createTDDConfig() {
    const configPath = path.join(this.projectRoot, '.claude', 'config', 'tdd-config.json');

    if (fs.existsSync(configPath)) {
      this.log('TDD config already exists', 'info');
      return;
    }

    const config = {
      minimumCoverage: 80,
      minimumDiffCoverage: 80,
      requireFailingTestFirst: true,
      allowSkippedTests: false,
      testTimeout: 30000,
      excludePatterns: [
        "node_modules/**",
        "coverage/**",
        "*.min.js",
        "dist/**",
        "build/**",
        "__pycache__/**",
        "*.pyc"
      ],
      testPatterns: [
        "**/*.test.js",
        "**/*.spec.js",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/test_*.py",
        "tests/**/*.py"
      ],
      hooks: {
        preCommit: {
          enabled: true,
          runTests: true,
          checkCoverage: true,
          enforcePhases: true
        },
        prePush: {
          enabled: true,
          runFullTestSuite: true,
          checkOverallCoverage: true
        },
        commitMsg: {
          enabled: true,
          enforceConventionalCommits: false,
          blockTodoFixme: true
        }
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    this.log('Created TDD configuration', 'success');
  }

  /**
   * Install git hooks
   */
  async installGitHooks() {
    try {
      const GitHooksInstaller = require('../git-hooks/install-hooks.js');
      const installer = new GitHooksInstaller();

      this.log('Installing TDD git hooks...', 'info');
      const result = await installer.installHooks();

      if (result) {
        this.log('Git hooks installed successfully', 'success');
      } else {
        this.log('Git hooks installation failed', 'warning');
      }
    } catch (error) {
      this.log(`Git hooks installation error: ${error.message}`, 'warning');
    }
  }

  /**
   * Validate environment setup
   */
  validateSetup() {
    const checks = [
      { name: '.env file', path: '.env' },
      { name: 'TDD config', path: '.claude/config/tdd-config.json' },
      { name: 'Config directory', path: '.claude/config' },
      { name: 'Git hooks', path: '.git/hooks/pre-commit' }
    ];

    let allValid = true;

    checks.forEach(check => {
      const fullPath = path.join(this.projectRoot, check.path);
      if (fs.existsSync(fullPath)) {
        this.log(`✓ ${check.name}`, 'success');
      } else {
        this.log(`✗ ${check.name}`, 'error');
        allValid = false;
      }
    });

    return allValid;
  }

  /**
   * Run complete environment setup
   */
  async setup() {
    this.log('🚀 Setting up Claude Agentic Workflow System environment...', 'info');

    try {
      // Create directories
      this.createDirectories();

      // Create .env file
      this.createDotEnv();

      // Create TDD configuration
      this.createTDDConfig();

      // Install git hooks
      await this.installGitHooks();

      // Validate setup
      const isValid = this.validateSetup();

      if (isValid) {
        this.log('🎉 Environment setup completed successfully!', 'success');
        this.log('', 'info');
        this.log('Next steps:', 'info');
        this.log('1. Edit .env file with your Linear API key', 'info');
        this.log('2. Run: npm run assess', 'info');
        this.log('3. Check Linear for automatically created tasks', 'info');
      } else {
        this.log('⚠️ Setup completed with some issues', 'warning');
      }

      return isValid;

    } catch (error) {
      this.log(`Setup failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const setup = new EnvironmentSetup();
  setup.setup()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Environment setup crashed:', error.message);
      process.exit(1);
    });
}

module.exports = EnvironmentSetup;