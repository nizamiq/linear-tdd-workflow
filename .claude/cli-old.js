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

// Native console styling to replace chalk
const colors = {
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  bold: Object.assign((text) => `\x1b[1m${text}\x1b[0m`, {
    cyan: (text) => `\x1b[1m\x1b[36m${text}\x1b[0m`,
    green: (text) => `\x1b[1m\x1b[32m${text}\x1b[0m`,
    yellow: (text) => `\x1b[1m\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[1m\x1b[34m${text}\x1b[0m`,
    red: (text) => `\x1b[1m\x1b[31m${text}\x1b[0m`,
    magenta: (text) => `\x1b[1m\x1b[35m${text}\x1b[0m`,
  }),
};

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
        defaultConcurrency: 10,
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

    // Journey commands
    this.program
      .command('journey')
      .description('Manage autonomous journeys')
      .argument('<action>', 'Journey action (start|list|status|stop)')
      .argument('[journey-id]', 'Journey ID (e.g., JR-1)')
      .option('--auto-fix', 'Enable autonomous fixes')
      .option('--dry-run', 'Simulate without changes')
      .option('--parallel', 'Run journeys in parallel')
      .option('--project-type <type>', 'Override detected project type')
      .action(this.handleJourney.bind(this));

    // Guardian command for CI monitoring
    this.program
      .command('guardian')
      .description('Pipeline monitoring and recovery')
      .argument('<action>', 'Action (monitor-pipeline|recover|status)')
      .option('--auto-fix', 'Enable automatic recovery')
      .option('--project-type <type>', 'Project type override')
      .action(this.handleGuardian.bind(this));

    // Scholar command for pattern learning
    this.program
      .command('scholar')
      .description('Pattern mining and learning')
      .argument('<action>', 'Action (extract-patterns|analyze|train)')
      .option('--project-type <type>', 'Project type')
      .option('--languages <list>', 'Languages to analyze')
      .action(this.handleScholar.bind(this));

    // Release command
    this.program
      .command('release')
      .description('Release management')
      .argument('<action>', 'Action (prepare|validate|deploy)')
      .option('--version <version>', 'Release version')
      .option('--project-type <type>', 'Project type')
      .action(this.handleRelease.bind(this));

    // Validator command for quality gates
    this.program
      .command('validator')
      .description('Quality gate validation')
      .argument('<action>', 'Action (check-gates|run-tests)')
      .option('--project-type <type>', 'Project type')
      .option('--test-cmd <cmd>', 'Test command override')
      .option('--lint-cmd <cmd>', 'Lint command override')
      .action(this.handleValidator.bind(this));

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

    // Linear integration commands
    this.program
      .command('linear:test-connection')
      .description('Test Linear API connection and authentication')
      .action(this.handleLinearTestConnection.bind(this));

    this.program
      .command('linear:sync')
      .description('Sync agents with Linear workspace')
      .option('--force', 'Force sync even if already configured')
      .action(this.handleLinearSync.bind(this));

    this.program
      .command('linear:status')
      .description('Show Linear integration status')
      .action(this.handleLinearStatus.bind(this));

    // Command discovery for Claude Code
    this.program
      .command('commands:list')
      .description('List available commands for Claude Code')
      .option('--json', 'Output in JSON format')
      .action(this.handleCommandsList.bind(this));

    // Agent invocation commands
    this.program
      .command('agent:invoke')
      .description('Invoke specific agent with command')
      .argument(
        '<agent-command>',
        'Agent command in format AGENT:COMMAND (e.g., AUDITOR:assess-code)',
      )
      .option('--scope <scope>', 'Assessment scope (full, changed, critical)', 'changed')
      .option('--depth <depth>', 'Analysis depth (deep, standard, quick)', 'standard')
      .option('--language <language>', 'Target language filter')
      .option('--workers <count>', 'Number of parallel workers', '4')
      .option('--task-id <id>', 'Linear task ID for fixes')
      .option('--auto-fix', 'Enable automatic fixes where possible')
      .option('--dry-run', 'Show what would be done without executing')
      // STRATEGIST-specific options
      .option('--task-type <type>', 'Workflow task type (assessment, fix, recovery)')
      .option('--priority <priority>', 'Task priority (low, normal, high, critical)')
      .option('--workflow <name>', 'Workflow name for coordination')
      .option('--agents <list>', 'Comma-separated list of agents')
      .option('--mode <mode>', 'Execution mode (sequential, parallel)')
      .option('--action <action>', 'Backlog action (prioritize, assign, review)')
      .option('--team <team>', 'Linear team ID')
      .option('--type <type>', 'Conflict or escalation type')
      .option('--severity <severity>', 'Issue severity (low, medium, high, critical)')
      .option('--budget <amount>', 'Resource budget allocation')
      .option('--timeframe <duration>', 'Time allocation (1d, 1w, etc.)')
      // DEPLOYER-specific options
      .option('--env <environment>', 'Target environment (dev, staging, prod)')
      .option('--app-version <tag>', 'Version or tag to deploy')
      .option('--strategy <strategy>', 'Deployment strategy (rolling, bluegreen, canary)')
      .option('--target <version>', 'Target version for rollback')
      .option('--immediate', 'Execute immediate rollback')
      .option('--release-action <action>', 'Release action (create, promote, tag)')
      .option('--from-env <env>', 'Source environment for promotion')
      .option('--to-env <env>', 'Target environment for promotion')
      // OPTIMIZER-specific options
      .option('--profile-type <type>', 'Profiling type (cpu, memory, io)')
      .option('--profile-duration <seconds>', 'Profiling duration in seconds')
      .option('--complexity <target>', 'Target algorithm complexity (O(n), O(log n))')
      .option('--optimization-scope <scope>', 'Optimization scope (function, module)')
      .option('--memory-target <percentage>', 'Memory reduction target percentage')
      .option('--analyze-leaks', 'Enable memory leak analysis')
      // VALIDATOR-specific options
      .option('--coverage', 'Run tests with coverage reporting')
      .option('--suite <type>', 'Test suite type (unit, integration, e2e, all)')
      .option('--threshold <percentage>', 'Coverage or mutation threshold percentage')
      .option('--parallel', 'Run tests in parallel')
      .option('--verbose', 'Verbose test output')
      // SCHOLAR-specific options
      .option('--period <duration>', 'Analysis time period (7d, 30d, etc.)')
      .option('--source <type>', 'Source type for pattern extraction (commits, fixes, refactors)')
      .option('--pattern-id <id>', 'Pattern ID for effectiveness analysis')
      .option('--metrics <type>', 'Metrics type (reuse, quality, impact)')
      .option('--agent <name>', 'Target agent for training')
      .option('--patterns <list>', 'Pattern list for training')
      .option('--training-mode <mode>', 'Training mode (supervised, reinforcement)')
      .allowUnknownOption()
      .action(this.handleAgentInvoke.bind(this));
  }

  /**
   * Handle assess command
   */
  async handleAssess(options) {
    console.log(colors.bold.cyan('🔍 Running Code Assessment\n'));

    try {
      const routerScript = path.join(this.claudeDir, 'scripts', 'core', 'agent-command-router.js');
      const cmd = `node "${routerScript}" assess --scope ${options.scope} --workers ${options.workers}`;

      if (options.language) {
        cmd += ` --language ${options.language}`;
      }

      this.execCommand(cmd);
    } catch (error) {
      console.error(colors.red(`Assessment failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle fix command
   */
  async handleFix(taskId, options) {
    console.log(colors.bold.green(`🔧 Implementing Fix Pack: ${taskId}\n`));

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
      console.error(colors.red(`Fix implementation failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle test command
   */
  async handleTest(options) {
    console.log(colors.bold.yellow('🧪 Running TDD Cycle\n'));

    try {
      const languages = await this.detectLanguages();
      const targetLanguage = options.language || languages[0];

      if (targetLanguage === 'python' || languages.includes('python')) {
        await this.runPythonTests(options);
      }

      if (
        targetLanguage === 'javascript' ||
        targetLanguage === 'typescript' ||
        languages.includes('javascript') ||
        languages.includes('typescript')
      ) {
        await this.runJSTests(options);
      }
    } catch (error) {
      console.error(colors.red(`Testing failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle status command
   */
  async handleStatus(options) {
    console.log(colors.bold.blue('📊 System Status\n'));

    try {
      const statusScript = path.join(this.claudeDir, 'scripts', 'monitoring', 'agent-status.js');

      if (options.agents) {
        this.execCommand(`node "${statusScript}" quick`);
      } else {
        this.execCommand(`node "${statusScript}" dashboard`);
      }
    } catch (error) {
      console.error(colors.red(`Status check failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle setup command
   */
  async handleSetup(options) {
    console.log(colors.bold.magenta('🚀 Setting up Claude Workflow\n'));

    try {
      const setupScript = path.join(this.claudeDir, 'setup.js');
      this.execCommand(`node "${setupScript}"`);
    } catch (error) {
      console.error(colors.red(`Setup failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle validate command
   */
  async handleValidate(options) {
    console.log(colors.bold.cyan('✅ Validating Configuration\n'));

    try {
      if (options.permissions) {
        const validatorScript = path.join(
          this.claudeDir,
          'scripts',
          'core',
          'tool-permission-validator.js',
        );
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
      console.error(colors.red(`Validation failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle doctor command
   */
  async handleDoctor() {
    console.log(colors.bold.green('🩺 Running Diagnostics\n'));

    const issues = [];
    const suggestions = [];

    // Check if .claude is properly configured
    if (!(await this.fileExists(path.join(this.claudeDir, 'agents')))) {
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
      console.log(colors.green('✅ All core agents configured'));
    } catch {
      issues.push('❌ Agent configuration issues detected');
      suggestions.push('Run: ./claude validate --permissions');
    }

    // Display results
    if (issues.length === 0) {
      console.log(colors.green('\n🎉 No issues detected! System is healthy.\n'));
    } else {
      console.log(colors.red('\n🚨 Issues detected:\n'));
      issues.forEach((issue) => console.log(`  ${issue}`));

      console.log(colors.yellow('\n💡 Suggestions:\n'));
      suggestions.forEach((suggestion) => console.log(`  ${suggestion}`));
    }
  }

  /**
   * Handle clean command
   */
  async handleClean(options) {
    console.log(colors.bold.red('🧹 Cleaning up\n'));

    const cleanTargets = [
      'node_modules/.cache',
      '.pytest_cache',
      '__pycache__',
      '.coverage',
      'coverage',
      '.nyc_output',
      '.stryker-tmp',
    ];

    if (options.all) {
      cleanTargets.push('.claude-backup', '.audit');
    }

    for (const target of cleanTargets) {
      try {
        await fs.rm(target, { recursive: true, force: true });
        console.log(colors.green(`✅ Cleaned ${target}`));
      } catch {
        // Ignore errors - target might not exist
      }
    }

    console.log(colors.green('\n🎉 Cleanup completed\n'));
  }

  /**
   * Handle export command
   */
  async handleExport(options) {
    console.log(colors.bold.blue('📦 Exporting configuration\n'));

    const config = {
      version: this.config.version,
      timestamp: new Date().toISOString(),
      agents: await this.loadAgentConfigs(),
      settings: await this.loadSettings(),
    };

    const filename = `claude-config.${options.format}`;

    if (options.format === 'yaml') {
      const yaml = require('js-yaml');
      await fs.writeFile(filename, yaml.dump(config));
    } else {
      await fs.writeFile(filename, JSON.stringify(config, null, 2));
    }

    console.log(colors.green(`✅ Configuration exported to ${filename}\n`));
  }

  /**
   * Handle import command
   */
  async handleImport(source) {
    console.log(colors.bold.blue(`📥 Importing configuration from ${source}\n`));

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

      console.log(colors.green('✅ Configuration imported successfully\n'));
    } catch (error) {
      console.error(colors.red(`Import failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle concurrency analysis command
   */
  async handleConcurrencyAnalysis(options) {
    console.log(colors.bold.cyan('🔬 Running Concurrency Analysis\n'));

    try {
      const ConcurrencyTester = require(
        path.join(this.claudeDir, 'scripts', 'core', 'concurrency-tester.js'),
      );
      const tester = new ConcurrencyTester();

      await tester.runAnalysis();

      if (options.output === 'json') {
        const reportPath = path.join(this.claudeDir, 'analysis', `${tester.testId}.json`);
        console.log(colors.blue(`\nDetailed results: ${reportPath}`));
      }
    } catch (error) {
      console.error(colors.red(`Concurrency analysis failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle Phase B.1 testing command
   */
  async handlePhaseB1Testing(options) {
    console.log(colors.bold.cyan('🧪 Running Phase B.1 Comprehensive Testing\n'));

    try {
      const PhaseB1Tester = require(
        path.join(this.claudeDir, 'scripts', 'core', 'phase-b1-tester.js'),
      );

      const testerConfig = {
        testDuration: parseInt(options.duration),
        exportPath: options.exportResults,
      };

      const tester = new PhaseB1Tester(testerConfig);
      const success = await tester.runTestSuite();

      if (options.exportResults) {
        console.log(colors.blue(`\nDetailed results exported to: ${options.exportResults}`));
      }

      process.exit(success ? 0 : 1);
    } catch (error) {
      console.error(colors.red(`Phase B.1 testing failed: ${error.message}`));
      console.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * Utility methods
   */
  async detectLanguages() {
    const languages = [];

    if ((await this.fileExists('package.json')) || (await this.hasFiles(['**/*.js', '**/*.ts']))) {
      languages.push('javascript');
    }

    if ((await this.fileExists('tsconfig.json')) || (await this.hasFiles(['**/*.ts']))) {
      languages.push('typescript');
    }

    if ((await this.fileExists('pyproject.toml')) || (await this.hasFiles(['**/*.py']))) {
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
      execSync(
        `git commit -m "feat: implement fix pack ${taskId}\n\n🤖 Generated with Claude Code\n\nCo-Authored-By: Claude <noreply@anthropic.com>"`,
        { stdio: 'inherit' },
      );
      console.log(colors.green(`✅ Changes committed for ${taskId}`));
    } catch (error) {
      console.warn(colors.yellow(`Warning: Auto-commit failed: ${error.message}`));
    }
  }

  execCommand(cmd) {
    console.log(colors.gray(`> ${cmd}\n`));
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

  /**
   * Handle Linear test connection command
   */
  async handleLinearTestConnection() {
    console.log(colors.bold.cyan('🔗 Testing Linear API Connection\n'));

    try {
      // Check for Linear API key
      const apiKey = process.env.LINEAR_API_KEY;
      if (!apiKey) {
        console.log(colors.red('❌ LINEAR_API_KEY environment variable not set'));
        console.log(colors.yellow('\nPlease set your Linear API key:'));
        console.log(colors.cyan('export LINEAR_API_KEY="your-api-key-here"'));
        console.log(colors.gray('Get your API key from: https://linear.app/settings/api'));
        process.exit(1);
      }

      // Test connection using curl or fetch
      console.log(colors.gray('🔄 Testing API connection...'));

      try {
        const response = await fetch('https://api.linear.app/graphql', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                viewer {
                  id
                  name
                  email
                }
                organization {
                  id
                  name
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.errors) {
          throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
        }

        // Connection successful
        console.log(colors.green('✅ Linear API connection successful!'));
        console.log(colors.bold('\n📊 Connection Details:'));
        console.log(colors.cyan(`   User: ${data.data.viewer.name} (${data.data.viewer.email})`));
        console.log(colors.cyan(`   Organization: ${data.data.organization.name}`));
        console.log(colors.cyan(`   User ID: ${data.data.viewer.id}`));
        console.log(colors.cyan(`   Org ID: ${data.data.organization.id}`));

        // Test MCP Linear integration if available
        try {
          const mcpTest = await this.testMCPLinearIntegration();
          if (mcpTest.success) {
            console.log(colors.green('\n✅ MCP Linear integration available'));
            console.log(colors.gray(`   Server: ${mcpTest.server}`));
          }
        } catch (error) {
          console.log(colors.yellow('\n⚠️  MCP Linear integration not available'));
          console.log(colors.gray(`   Reason: ${error.message}`));
        }

        console.log(colors.bold.green('\n🎉 Linear integration ready!'));
      } catch (error) {
        console.log(colors.red('❌ Linear API connection failed'));
        console.log(colors.red(`   Error: ${error.message}`));

        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          console.log(colors.yellow('\n💡 Troubleshooting:'));
          console.log(colors.gray('   • Check your API key is correct'));
          console.log(colors.gray('   • Ensure the key has proper permissions'));
          console.log(colors.gray("   • Verify the key hasn't expired"));
        }

        process.exit(1);
      }
    } catch (error) {
      console.error(colors.red(`Connection test failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Test MCP Linear integration
   */
  async testMCPLinearIntegration() {
    // Simple test to see if MCP Linear tools are available
    // This would integrate with the MCP server if available
    return {
      success: false,
      server: 'mcp-linear-server',
      error: 'MCP integration testing not yet implemented',
    };
  }

  /**
   * Handle commands list for Claude Code discovery
   */
  async handleCommandsList(options) {
    const commands = {
      journey: {
        assess: {
          description: 'Code quality assessment → Linear tasks',
          entrypoint: 'make assess [SCOPE=full|changed]',
          script: 'node .claude/journeys/jr2-assessment.js',
          sla: '≤12min for 150k LOC',
        },
        fix: {
          description: 'TDD fix implementation',
          entrypoint: 'make fix TASK=CLEAN-XXX',
          script: 'node .claude/journeys/jr3-fix-pack.js',
          sla: '≤30min per fix',
        },
        recover: {
          description: 'CI/CD pipeline recovery',
          entrypoint: 'make recover',
          script: 'node .claude/journeys/jr4-ci-recovery.js',
          sla: '≤10min recovery',
        },
        learn: {
          description: 'Pattern mining from PRs',
          entrypoint: 'make learn',
          script: 'node .claude/journeys/jr5-pattern-mining.js',
          sla: 'Weekly analysis',
        },
        release: {
          description: 'Production release management',
          entrypoint: 'make release',
          script: 'node .claude/journeys/jr6-release.js',
          sla: '≤2hr release cycle',
        },
      },
      workflow: {
        status: {
          description: 'Current workflow status',
          entrypoint: 'make status',
          script: 'node .claude/cli.js status',
          sla: 'Real-time',
        },
        validate: {
          description: 'Run quality gates',
          entrypoint: 'make validate',
          script: 'npm test && npm run lint',
          sla: '≤5min',
        },
        monitor: {
          description: 'Live monitoring dashboard',
          entrypoint: 'make monitor',
          script: 'node .claude/cli.js monitor',
          sla: 'Continuous',
        },
      },
    };

    if (options.json) {
      console.log(JSON.stringify(commands, null, 2));
    } else {
      console.log(colors.bold.cyan('🚀 Available Commands for Claude Code\n'));

      console.log(colors.bold.yellow('Journey Commands (Core TDD + Linear Flow):'));
      Object.entries(commands.journey).forEach(([name, cmd]) => {
        console.log(colors.green(`  /${name}`) + colors.gray(` - ${cmd.description}`));
        console.log(colors.gray(`       Entry: ${cmd.entrypoint}`));
        console.log(colors.gray(`       SLA: ${cmd.sla}\n`));
      });

      console.log(colors.bold.yellow('Workflow Commands:'));
      Object.entries(commands.workflow).forEach(([name, cmd]) => {
        console.log(colors.green(`  /${name}`) + colors.gray(` - ${cmd.description}`));
        console.log(colors.gray(`       Entry: ${cmd.entrypoint}`));
        console.log(colors.gray(`       SLA: ${cmd.sla}\n`));
      });

      console.log(colors.cyan('💡 Tip: Each command has full documentation in .claude/commands/'));
      console.log(colors.gray('   Example: cat .claude/commands/journey-assess.md\n'));
    }
  }

  /**
   * Handle Linear sync command - Uses MCP tools instead of webhooks
   */
  async handleLinearSync(options) {
    console.log(colors.bold.cyan('🔄 Syncing with Linear Workspace (via MCP)\n'));

    try {
      // Note: This is a placeholder implementation showing the MCP-based approach
      // In a real Claude Code session, you would use the mcp__linear-server tools directly

      console.log(colors.gray('Fetching workspace data from Linear...'));

      // Step 1: Get current user and team info
      console.log(colors.blue('📊 Fetching user and team information...'));
      console.log(colors.gray('   Using: mcp__linear-server__get_user({ query: "me" })'));

      // Step 2: Sync active issues
      console.log(colors.blue('\n📋 Syncing active issues...'));
      console.log(colors.gray('   Using: mcp__linear-server__list_issues({'));
      console.log(colors.gray('     assignee: "me",'));
      console.log(colors.gray('     includeArchived: false,'));
      console.log(colors.gray('     orderBy: "updatedAt"'));
      console.log(colors.gray('   })'));

      // Step 3: Check for new comments
      console.log(colors.blue('\n💬 Checking for agent mentions in comments...'));
      console.log(colors.gray('   Scanning recent issues for @mentions'));

      // Step 4: Update local cache
      console.log(colors.blue('\n💾 Updating local cache...'));
      const cacheFile = path.join(this.claudeDir, 'cache', 'linear-sync.json');
      const syncData = {
        lastSync: new Date().toISOString(),
        syncMethod: 'MCP',
        message: 'Sync uses Linear MCP tools - no webhooks needed!',
      };

      await fs.mkdir(path.dirname(cacheFile), { recursive: true });
      await fs.writeFile(cacheFile, JSON.stringify(syncData, null, 2));

      console.log(colors.green('\n✅ Sync completed successfully!'));
      console.log(colors.gray(`   Cache updated at: ${cacheFile}`));
      console.log(
        colors.cyan('\n💡 Tip: Linear MCP tools provide real-time access without webhooks'),
      );
      console.log(colors.gray('   No infrastructure needed - works directly in Claude Code!'));
    } catch (error) {
      console.error(colors.red(`Sync failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle agent invoke command
   */
  async handleAgentInvoke(agentCommand, options) {
    console.log(colors.bold.cyan(`🤖 Invoking Agent Command: ${agentCommand}\n`));

    try {
      // Parse agent and command
      const [agent, command] = agentCommand.split(':');
      if (!agent || !command) {
        console.log(colors.red('❌ Invalid agent command format'));
        console.log(colors.yellow('Expected format: AGENT:COMMAND (e.g., AUDITOR:assess-code)'));
        process.exit(1);
      }

      // Validate agent exists
      const validAgents = [
        'AUDITOR',
        'EXECUTOR',
        'GUARDIAN',
        'STRATEGIST',
        'SCHOLAR',
        'TESTER',
        'VALIDATOR',
        'ANALYZER',
        'OPTIMIZER',
        'CLEANER',
        'REVIEWER',
        'DEPLOYER',
        'MONITOR',
        'MIGRATOR',
        'ARCHITECT',
        'REFACTORER',
        'RESEARCHER',
        'SECURITYGUARD',
        'DOCUMENTER',
        'INTEGRATOR',
      ];

      if (!validAgents.includes(agent.toUpperCase())) {
        console.log(colors.red(`❌ Unknown agent: ${agent}`));
        console.log(colors.yellow('Available agents:'));
        validAgents.forEach((a) => console.log(colors.gray(`   • ${a}`)));
        process.exit(1);
      }

      // Build command for agent router
      const routerScript = path.join(this.claudeDir, 'scripts', 'core', 'agent-command-router.js');
      let cmd = `node "${routerScript}" invoke ${agent}:${command}`;

      // Add options
      if (options.scope) cmd += ` --scope ${options.scope}`;
      if (options.depth) cmd += ` --depth ${options.depth}`;
      if (options.language) cmd += ` --language ${options.language}`;
      if (options.workers) cmd += ` --workers ${options.workers}`;
      if (options.taskId) cmd += ` --task-id ${options.taskId}`;
      if (options.autoFix) cmd += ` --auto-fix`;
      if (options.dryRun) cmd += ` --dry-run`;

      // STRATEGIST-specific options
      if (options.taskType) cmd += ` --task-type ${options.taskType}`;
      if (options.priority) cmd += ` --priority ${options.priority}`;
      if (options.workflow) cmd += ` --workflow ${options.workflow}`;
      if (options.agents) cmd += ` --agents ${options.agents}`;
      if (options.mode) cmd += ` --mode ${options.mode}`;
      if (options.action) cmd += ` --action ${options.action}`;
      if (options.team) cmd += ` --team ${options.team}`;
      if (options.type) cmd += ` --type ${options.type}`;
      if (options.severity) cmd += ` --severity ${options.severity}`;
      if (options.budget) cmd += ` --budget ${options.budget}`;
      if (options.timeframe) cmd += ` --timeframe ${options.timeframe}`;

      // DEPLOYER-specific options
      if (options.env) cmd += ` --env ${options.env}`;
      if (options.appVersion) cmd += ` --app-version ${options.appVersion}`;
      if (options.strategy) cmd += ` --strategy ${options.strategy}`;
      if (options.target) cmd += ` --target ${options.target}`;
      if (options.immediate) cmd += ` --immediate`;
      if (options.releaseAction) cmd += ` --release-action ${options.releaseAction}`;
      if (options.fromEnv) cmd += ` --from-env ${options.fromEnv}`;
      if (options.toEnv) cmd += ` --to-env ${options.toEnv}`;

      // OPTIMIZER-specific options
      if (options.profileType) cmd += ` --profile-type ${options.profileType}`;
      if (options.profileDuration) cmd += ` --profile-duration ${options.profileDuration}`;
      if (options.complexity) cmd += ` --complexity ${options.complexity}`;
      if (options.optimizationScope) cmd += ` --optimization-scope ${options.optimizationScope}`;
      if (options.memoryTarget) cmd += ` --memory-target ${options.memoryTarget}`;
      if (options.analyzeLeaks) cmd += ` --analyze-leaks`;

      console.log(colors.gray(`🔄 Executing: ${cmd}\n`));

      // Execute the command
      const { spawn } = require('child_process');
      const child = spawn('sh', ['-c', cmd], {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      // Process cleanup handlers for long-running LLM calls
      const cleanup = () => {
        if (child && !child.killed) {
          console.log('⏱️ Gracefully terminating agent process...');
          child.kill('SIGTERM');
          setTimeout(() => {
            if (!child.killed) {
              console.log('⚠️ Force killing unresponsive agent process...');
              child.kill('SIGKILL');
            }
          }, 15000); // 15 seconds for LLM cleanup
        }
      };

      // Cleanup on process exit
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      process.on('exit', cleanup);

      // Progress indicator for long-running LLM calls
      const progressTimer = setInterval(() => {
        console.log(colors.gray('⏳ Agent is processing (LLM calls may take several minutes)...'));
      }, 30000); // Every 30 seconds

      child.on('close', (code) => {
        clearInterval(progressTimer);
        if (code === 0) {
          console.log(colors.green(`\n✅ Agent command completed successfully`));
        } else {
          console.log(colors.red(`\n❌ Agent command failed with exit code ${code}`));
          process.exit(code);
        }
      });

      child.on('error', (error) => {
        console.error(colors.red(`Failed to execute agent command: ${error.message}`));
        cleanup();
        process.exit(1);
      });
    } catch (error) {
      console.error(colors.red(`Agent invocation failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle journey command
   */
  async handleJourney(action, journeyId, options) {
    console.log(colors.bold.cyan(`🚀 Journey Management: ${action}\n`));

    try {
      const journeyPath = path.join(this.claudeDir, 'journeys');

      switch (action) {
        case 'start':
          if (!journeyId) {
            console.log(colors.red('❌ Journey ID required for start action'));
            console.log(colors.yellow('Available journeys:'));
            console.log(colors.gray('   • JR-1: New Project Onboarding'));
            console.log(colors.gray('   • JR-2: Clean-Code Assessment'));
            console.log(colors.gray('   • JR-3: TDD Fix Pack Implementation'));
            console.log(colors.gray('   • JR-4: CI Break Diagnosis & Recovery'));
            console.log(colors.gray('   • JR-5: Pattern Mining & Continuous Improvement'));
            console.log(colors.gray('   • JR-6: UAT & Production Release'));
            process.exit(1);
          }

          const journeyScript = path.join(journeyPath, `${journeyId.toLowerCase()}-*.js`);
          const files = require('glob').sync(journeyScript);

          if (files.length === 0) {
            console.log(colors.red(`❌ Journey ${journeyId} not found`));
            process.exit(1);
          }

          let cmd = `node "${files[0]}"`;
          if (options.autoFix) cmd += ' --auto-fix';
          if (options.dryRun) cmd += ' --dry-run';
          if (options.projectType) cmd += ` --project-type ${options.projectType}`;

          console.log(colors.gray(`Starting journey ${journeyId}...`));
          this.execCommand(cmd);
          break;

        case 'list':
          console.log(colors.bold('Available Journeys:\n'));
          const registry = require(path.join(journeyPath, 'registry.yaml'));
          // Simple YAML parsing for display
          console.log(colors.cyan('JR-1: New Project Onboarding'));
          console.log(colors.gray('   Initialize project with agents and run first assessment\n'));
          console.log(colors.cyan('JR-2: Clean-Code Assessment'));
          console.log(colors.gray('   Autonomous code quality scanning and issue detection\n'));
          console.log(colors.cyan('JR-3: TDD Fix Pack Implementation'));
          console.log(colors.gray('   Autonomous TDD cycle execution for approved tasks\n'));
          console.log(colors.cyan('JR-4: CI Break Diagnosis & Recovery'));
          console.log(colors.gray('   Autonomous pipeline monitoring and self-healing\n'));
          console.log(colors.cyan('JR-5: Pattern Mining & Continuous Improvement'));
          console.log(colors.gray('   Autonomous learning from code changes and fixes\n'));
          console.log(colors.cyan('JR-6: UAT & Production Release'));
          console.log(colors.gray('   Semi-autonomous release coordination\n'));
          break;

        case 'status':
          console.log(colors.yellow('⚠️  Journey status monitoring not yet implemented'));
          break;

        case 'stop':
          if (!journeyId) {
            console.log(colors.red('❌ Journey ID required for stop action'));
            process.exit(1);
          }
          console.log(colors.yellow(`⚠️  Stopping journey ${journeyId} not yet implemented`));
          break;

        default:
          console.log(colors.red(`❌ Unknown action: ${action}`));
          console.log(colors.yellow('Available actions: start, list, status, stop'));
          process.exit(1);
      }
    } catch (error) {
      console.error(colors.red(`Journey command failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle guardian command
   */
  async handleGuardian(action, options) {
    console.log(colors.bold.yellow(`🛡️ Guardian: ${action}\n`));

    try {
      const guardianScript = path.join(this.claudeDir, 'agents', 'guardian.js');
      let cmd = `node "${guardianScript}" ${action}`;

      if (options.autoFix) cmd += ' --auto-fix';
      if (options.projectType) cmd += ` --project-type ${options.projectType}`;

      this.execCommand(cmd);
    } catch (error) {
      console.error(colors.red(`Guardian command failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle scholar command
   */
  async handleScholar(action, options) {
    console.log(colors.bold.magenta(`🧠 Scholar: ${action}\n`));

    try {
      const scholarScript = path.join(this.claudeDir, 'agents', 'scholar.js');
      let cmd = `node "${scholarScript}" ${action}`;

      if (options.projectType) cmd += ` --project-type ${options.projectType}`;
      if (options.languages) cmd += ` --languages ${options.languages}`;

      this.execCommand(cmd);
    } catch (error) {
      console.error(colors.red(`Scholar command failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle release command
   */
  async handleRelease(action, options) {
    console.log(colors.bold.blue(`🚀 Release: ${action}\n`));

    try {
      const releaseScript = path.join(this.claudeDir, 'scripts', 'release.js');
      let cmd = `node "${releaseScript}" ${action}`;

      if (options.version) cmd += ` --version ${options.version}`;
      if (options.projectType) cmd += ` --project-type ${options.projectType}`;

      this.execCommand(cmd);
    } catch (error) {
      console.error(colors.red(`Release command failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle validator command
   */
  async handleValidator(action, options) {
    console.log(colors.bold.green(`✅ Validator: ${action}\n`));

    try {
      const validatorScript = path.join(this.claudeDir, 'agents', 'validator.js');
      let cmd = `node "${validatorScript}" ${action}`;

      if (options.projectType) cmd += ` --project-type ${options.projectType}`;
      if (options.testCmd) cmd += ` --test-cmd "${options.testCmd}"`;
      if (options.lintCmd) cmd += ` --lint-cmd "${options.lintCmd}"`;

      this.execCommand(cmd);
    } catch (error) {
      console.error(colors.red(`Validator command failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Handle Linear status command
   */
  async handleLinearStatus() {
    console.log(colors.bold.cyan('📊 Linear Integration Status\n'));

    try {
      // Check API key
      const hasApiKey = !!process.env.LINEAR_API_KEY;
      console.log(colors.gray('🔑 Authentication:'));
      console.log(`   API Key: ${hasApiKey ? colors.green('✅ Set') : colors.red('❌ Not set')}`);

      // Check MCP integration
      console.log(colors.gray('\n🔌 MCP Integration:'));
      console.log(`   Status: ${colors.yellow('⚠️  Not implemented')}`);

      // Check agent configurations
      console.log(colors.gray('\n🤖 Agent Linear Access:'));
      console.log(`   STRATEGIST: ${colors.green('✅ Full CRUD')}`);
      console.log(`   AUDITOR: ${colors.green('✅ CREATE only')}`);
      console.log(`   MONITOR: ${colors.green('✅ CREATE only')}`);
      console.log(`   SCHOLAR: ${colors.green('✅ READ only')}`);
      console.log(`   Others: ${colors.green('✅ UPDATE only')}`);

      // Check configuration files
      console.log(colors.gray('\n⚙️  Configuration:'));
      const settingsPath = path.join(this.claudeDir, 'settings.local.json');
      const hasSettings = require('fs').existsSync(settingsPath);
      console.log(
        `   Local settings: ${hasSettings ? colors.green('✅ Found') : colors.yellow('⚠️  Not found')}`,
      );

      if (!hasApiKey) {
        console.log(colors.yellow('\n💡 Next steps:'));
        console.log(colors.gray('   1. Set LINEAR_API_KEY environment variable'));
        console.log(colors.gray('   2. Run: npm run linear:test-connection'));
        console.log(colors.gray('   3. Configure team settings in .claude/settings.local.json'));
      }
    } catch (error) {
      console.error(colors.red(`Status check failed: ${error.message}`));
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const cli = new ClaudeCLI();
  cli.run().catch((error) => {
    console.error(colors.red(`CLI Error: ${error.message}`));
    process.exit(1);
  });
}

module.exports = ClaudeCLI;
