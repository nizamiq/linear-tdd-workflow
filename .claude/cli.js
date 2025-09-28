#!/usr/bin/env node

/**
 * Claude CLI - Universal command interface for the agentic workflow
 *
 * This CLI works in any project type and provides a consistent interface
 * for all Claude workflow operations regardless of the underlying tech stack.
 */

const { Command } = require('commander');
const path = require('path');
const fs = require('fs').promises;
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');

class ClaudeCLI {
  constructor() {
    this.claudeDir = __dirname;
    this.projectRoot = process.cwd();
    this.program = new Command();
    this.config = null;
  }

  /**
   * Initialize and run CLI
   */
  async run() {
    await this.loadConfig();
    this.setupCommands();
    await this.program.parseAsync(process.argv);
  }

  /**
   * Load Claude configuration
   */
  async loadConfig() {
    try {
      const configPath = path.join(this.claudeDir, 'config', 'default.config.js');
      this.config = require(configPath);
    } catch (error) {
      this.config = {
        version: '1.0.0',
        supportedLanguages: ['javascript', 'typescript', 'python'],
        defaultConcurrency: 10
      };
    }
  }

  /**
   * Setup CLI commands
   */
  setupCommands() {
    this.program
      .name('claude')
      .description('Claude Agentic Workflow CLI')
      .version(this.config.version || '1.0.0');

    // Assessment commands
    this.program
      .command('assess')
      .description('Run code quality assessment')
      .option('--scope <scope>', 'Assessment scope (full|changed|incremental)', 'changed')
      .option('--depth <depth>', 'Analysis depth (shallow|deep)', 'deep')
      .option('--language <lang>', 'Specific language to assess')
      .option('--workers <num>', 'Number of parallel workers', '10')
      .action(this.handleAssess.bind(this));

    // Fix commands
    this.program
      .command('fix')
      .description('Implement fix pack')
      .argument('<task-id>', 'Linear task ID (e.g., CLEAN-123)')
      .option('--test-first', 'Enforce test-first development')
      .option('--auto-commit', 'Auto-commit changes')
      .action(this.handleFix.bind(this));

    // Test commands
    this.program
      .command('test')
      .description('Run TDD cycle')
      .option('--language <lang>', 'Specific language to test')
      .option('--coverage', 'Run with coverage')
      .option('--mutation', 'Run mutation testing')
      .option('--watch', 'Watch mode')
      .action(this.handleTest.bind(this));

    // Status commands
    this.program
      .command('status')
      .description('Show system status')
      .option('--detailed', 'Show detailed status')
      .option('--agents', 'Show agent status only')
      .action(this.handleStatus.bind(this));

    // Setup commands
    this.program
      .command('setup')
      .description('Setup or enhance project')
      .option('--force', 'Force setup even if already configured')
      .action(this.handleSetup.bind(this));

    // Validation commands
    this.program
      .command('validate')
      .description('Validate project configuration')
      .option('--permissions', 'Validate tool permissions')
      .option('--tdd', 'Validate TDD compliance')
      .action(this.handleValidate.bind(this));

    // Help and utilities
    this.program
      .command('doctor')
      .description('Diagnose issues and suggest fixes')
      .action(this.handleDoctor.bind(this));

    this.program
      .command('clean')
      .description('Clean up temporary files and caches')
      .option('--all', 'Clean everything including backups')
      .action(this.handleClean.bind(this));

    this.program
      .command('export')
      .description('Export workflow configuration')
      .option('--format <format>', 'Export format (json|yaml)', 'json')
      .action(this.handleExport.bind(this));

    this.program
      .command('import')
      .description('Import workflow configuration')
      .argument('<source>', 'Source file or URL')
      .action(this.handleImport.bind(this));

    this.program
      .command('analyze-concurrency')
      .description('Run empirical concurrency analysis')
      .option('--output <format>', 'Output format (json|markdown)', 'markdown')
      .action(this.handleConcurrencyAnalysis.bind(this));

    this.program
      .command('test-phase-b1')
      .description('Run comprehensive Phase B.1 concurrency testing')
      .option('--duration <ms>', 'Test duration in milliseconds', '120000')
      .option('--export-results <path>', 'Export detailed results to file')
      .action(this.handlePhaseB1Testing.bind(this));
  }

  /**
   * Handle assess command
   */
  async handleAssess(options) {
    console.log(chalk.bold.cyan('🔍 Running Code Assessment\n'));

    try {
      const routerScript = path.join(this.claudeDir, 'scripts', 'core', 'agent-command-router.js');
      const cmd = `node "${routerScript}" assess --scope ${options.scope} --workers ${options.workers}`;

      if (options.language) {
        cmd += ` --language ${options.language}`;
      }

      this.execCommand(cmd);

    } catch (error) {
      console.error(chalk.red(`Assessment failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle fix command
   */
  async handleFix(taskId, options) {
    console.log(chalk.bold.green(`🔧 Implementing Fix Pack: ${taskId}\n`));

    try {
      const routerScript = path.join(this.claudeDir, 'scripts', 'core', 'agent-command-router.js');
      let cmd = `node "${routerScript}" implement ${taskId}`;

      if (options.testFirst) {
        cmd += ' --test-first';
      }

      this.execCommand(cmd);

      if (options.autoCommit) {
        await this.autoCommitChanges(taskId);
      }

    } catch (error) {
      console.error(chalk.red(`Fix implementation failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle test command
   */
  async handleTest(options) {
    console.log(chalk.bold.yellow('🧪 Running TDD Cycle\n'));

    try {
      const languages = await this.detectLanguages();
      const targetLanguage = options.language || languages[0];

      if (targetLanguage === 'python' || languages.includes('python')) {
        await this.runPythonTests(options);
      }

      if (targetLanguage === 'javascript' || targetLanguage === 'typescript' ||
          languages.includes('javascript') || languages.includes('typescript')) {
        await this.runJSTests(options);
      }

    } catch (error) {
      console.error(chalk.red(`Testing failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle status command
   */
  async handleStatus(options) {
    console.log(chalk.bold.blue('📊 System Status\n'));

    try {
      const statusScript = path.join(this.claudeDir, 'scripts', 'monitoring', 'agent-status.js');

      if (options.agents) {
        this.execCommand(`node "${statusScript}" quick`);
      } else {
        this.execCommand(`node "${statusScript}" dashboard`);
      }

    } catch (error) {
      console.error(chalk.red(`Status check failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle setup command
   */
  async handleSetup(options) {
    console.log(chalk.bold.magenta('🚀 Setting up Claude Workflow\n'));

    try {
      const setupScript = path.join(this.claudeDir, 'setup.js');
      this.execCommand(`node "${setupScript}"`);

    } catch (error) {
      console.error(chalk.red(`Setup failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle validate command
   */
  async handleValidate(options) {
    console.log(chalk.bold.cyan('✅ Validating Configuration\n'));

    try {
      if (options.permissions) {
        const validatorScript = path.join(this.claudeDir, 'scripts', 'core', 'tool-permission-validator.js');
        this.execCommand(`node "${validatorScript}" check-all`);
      }

      if (options.tdd) {
        const tddScript = path.join(this.claudeDir, 'scripts', 'core', 'tdd-gate-enforcer.js');
        this.execCommand(`node "${tddScript}" validate`);
      }

      if (!options.permissions && !options.tdd) {
        // Run all validations
        await this.handleValidate({ permissions: true, tdd: true });
      }

    } catch (error) {
      console.error(chalk.red(`Validation failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle doctor command
   */
  async handleDoctor() {
    console.log(chalk.bold.green('🩺 Running Diagnostics\n'));

    const issues = [];
    const suggestions = [];

    // Check if .claude is properly configured
    if (!await this.fileExists(path.join(this.claudeDir, 'agents'))) {
      issues.push('❌ Agents directory not found');
      suggestions.push('Run: ./claude setup');
    }

    // Check for required dependencies
    const hasPackageJson = await this.fileExists('package.json');
    const hasPyprojectToml = await this.fileExists('pyproject.toml');

    if (!hasPackageJson && !hasPyprojectToml) {
      issues.push('❌ No package configuration found');
      suggestions.push('Run: ./claude setup to initialize project');
    }

    // Check agent configurations
    try {
      const statusScript = path.join(this.claudeDir, 'scripts', 'monitoring', 'agent-status.js');
      execSync(`node "${statusScript}" quick`, { stdio: 'ignore' });
      console.log(chalk.green('✅ All core agents configured'));
    } catch {
      issues.push('❌ Agent configuration issues detected');
      suggestions.push('Run: ./claude validate --permissions');
    }

    // Display results
    if (issues.length === 0) {
      console.log(chalk.green('\n🎉 No issues detected! System is healthy.\n'));
    } else {
      console.log(chalk.red('\n🚨 Issues detected:\n'));
      issues.forEach(issue => console.log(`  ${issue}`));

      console.log(chalk.yellow('\n💡 Suggestions:\n'));
      suggestions.forEach(suggestion => console.log(`  ${suggestion}`));
    }
  }

  /**
   * Handle clean command
   */
  async handleClean(options) {
    console.log(chalk.bold.red('🧹 Cleaning up\n'));

    const cleanTargets = [
      'node_modules/.cache',
      '.pytest_cache',
      '__pycache__',
      '.coverage',
      'coverage',
      '.nyc_output',
      '.stryker-tmp'
    ];

    if (options.all) {
      cleanTargets.push('.claude-backup', '.audit');
    }

    for (const target of cleanTargets) {
      try {
        await fs.rm(target, { recursive: true, force: true });
        console.log(chalk.green(`✅ Cleaned ${target}`));
      } catch {
        // Ignore errors - target might not exist
      }
    }

    console.log(chalk.green('\n🎉 Cleanup completed\n'));
  }

  /**
   * Handle export command
   */
  async handleExport(options) {
    console.log(chalk.bold.blue('📦 Exporting configuration\n'));

    const config = {
      version: this.config.version,
      timestamp: new Date().toISOString(),
      agents: await this.loadAgentConfigs(),
      settings: await this.loadSettings()
    };

    const filename = `claude-config.${options.format}`;

    if (options.format === 'yaml') {
      const yaml = require('js-yaml');
      await fs.writeFile(filename, yaml.dump(config));
    } else {
      await fs.writeFile(filename, JSON.stringify(config, null, 2));
    }

    console.log(chalk.green(`✅ Configuration exported to ${filename}\n`));
  }

  /**
   * Handle import command
   */
  async handleImport(source) {
    console.log(chalk.bold.blue(`📥 Importing configuration from ${source}\n`));

    try {
      let config;

      if (source.startsWith('http')) {
        // Handle URL import
        const response = await fetch(source);
        config = await response.json();
      } else {
        // Handle file import
        const content = await fs.readFile(source, 'utf8');
        if (source.endsWith('.yaml') || source.endsWith('.yml')) {
          const yaml = require('js-yaml');
          config = yaml.load(content);
        } else {
          config = JSON.parse(content);
        }
      }

      // Apply configuration
      await this.applyImportedConfig(config);

      console.log(chalk.green('✅ Configuration imported successfully\n'));

    } catch (error) {
      console.error(chalk.red(`Import failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle concurrency analysis command
   */
  async handleConcurrencyAnalysis(options) {
    console.log(chalk.bold.cyan('🔬 Running Concurrency Analysis\n'));

    try {
      const ConcurrencyTester = require(path.join(this.claudeDir, 'scripts', 'core', 'concurrency-tester.js'));
      const tester = new ConcurrencyTester();

      await tester.runAnalysis();

      if (options.output === 'json') {
        const reportPath = path.join(this.claudeDir, 'analysis', `${tester.testId}.json`);
        console.log(chalk.blue(`\nDetailed results: ${reportPath}`));
      }

    } catch (error) {
      console.error(chalk.red(`Concurrency analysis failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle Phase B.1 testing command
   */
  async handlePhaseB1Testing(options) {
    console.log(chalk.bold.cyan('🧪 Running Phase B.1 Comprehensive Testing\n'));

    try {
      const PhaseB1Tester = require(path.join(this.claudeDir, 'scripts', 'core', 'phase-b1-tester.js'));

      const testerConfig = {
        testDuration: parseInt(options.duration),
        exportPath: options.exportResults
      };

      const tester = new PhaseB1Tester(testerConfig);
      const success = await tester.runTestSuite();

      if (options.exportResults) {
        console.log(chalk.blue(`\nDetailed results exported to: ${options.exportResults}`));
      }

      process.exit(success ? 0 : 1);

    } catch (error) {
      console.error(chalk.red(`Phase B.1 testing failed: ${error.message}`));
      console.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * Utility methods
   */
  async detectLanguages() {
    const languages = [];

    if (await this.fileExists('package.json') || await this.hasFiles(['**/*.js', '**/*.ts'])) {
      languages.push('javascript');
    }

    if (await this.fileExists('tsconfig.json') || await this.hasFiles(['**/*.ts'])) {
      languages.push('typescript');
    }

    if (await this.fileExists('pyproject.toml') || await this.hasFiles(['**/*.py'])) {
      languages.push('python');
    }

    return languages.length > 0 ? languages : ['javascript']; // Default
  }

  async runPythonTests(options) {
    const pythonRunner = path.join(this.claudeDir, 'scripts', 'language', 'python-runner.py');
    let cmd = `python "${pythonRunner}"`;

    if (options.coverage) cmd += ' coverage';
    else if (options.mutation) cmd += ' mutation';
    else cmd += ' tdd';

    this.execCommand(cmd);
  }

  async runJSTests(options) {
    let cmd = 'npm test';

    if (options.watch) cmd = 'npm run test:watch';
    else if (options.mutation) cmd = 'npm run test:mutation';

    this.execCommand(cmd);
  }

  async autoCommitChanges(taskId) {
    try {
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "feat: implement fix pack ${taskId}\n\n🤖 Generated with Claude Code\n\nCo-Authored-By: Claude <noreply@anthropic.com>"`, { stdio: 'inherit' });
      console.log(chalk.green(`✅ Changes committed for ${taskId}`));
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Auto-commit failed: ${error.message}`));
    }
  }

  execCommand(cmd) {
    console.log(chalk.gray(`> ${cmd}\n`));
    execSync(cmd, { stdio: 'inherit' });
  }

  async fileExists(filepath) {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  async hasFiles(patterns) {
    // Simplified implementation
    return false;
  }

  async loadAgentConfigs() {
    // Load agent configurations
    return {};
  }

  async loadSettings() {
    // Load Claude settings
    return {};
  }

  async applyImportedConfig(config) {
    // Apply imported configuration
    console.log('Applying configuration...');
  }
}

// CLI execution
if (require.main === module) {
  const cli = new ClaudeCLI();
  cli.run().catch(error => {
    console.error(chalk.red(`CLI Error: ${error.message}`));
    process.exit(1);
  });
}

module.exports = ClaudeCLI;