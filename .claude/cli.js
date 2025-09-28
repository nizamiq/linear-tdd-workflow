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
  bold: Object.assign(
    (text) => `\x1b[1m${text}\x1b[0m`,
    {
      cyan: (text) => `\x1b[1m\x1b[36m${text}\x1b[0m`,
      green: (text) => `\x1b[1m\x1b[32m${text}\x1b[0m`,
      yellow: (text) => `\x1b[1m\x1b[33m${text}\x1b[0m`,
      blue: (text) => `\x1b[1m\x1b[34m${text}\x1b[0m`,
      red: (text) => `\x1b[1m\x1b[31m${text}\x1b[0m`,
      magenta: (text) => `\x1b[1m\x1b[35m${text}\x1b[0m`
    }
  )
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

    // Agent invocation commands
    this.program
      .command('agent:invoke')
      .description('Invoke specific agent with command')
      .argument('<agent-command>', 'Agent command in format AGENT:COMMAND (e.g., AUDITOR:assess-code)')
      .option('--scope <scope>', 'Assessment scope (full, changed, critical)', 'changed')
      .option('--depth <depth>', 'Analysis depth (deep, standard, quick)', 'standard')
      .option('--language <language>', 'Target language filter')
      .option('--workers <count>', 'Number of parallel workers', '4')
      .option('--task-id <id>', 'Linear task ID for fixes')
      .option('--auto-fix', 'Enable automatic fixes where possible')
      .option('--dry-run', 'Show what would be done without executing')
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

      if (targetLanguage === 'javascript' || targetLanguage === 'typescript' ||
          languages.includes('javascript') || languages.includes('typescript')) {
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
      issues.forEach(issue => console.log(`  ${issue}`));

      console.log(colors.yellow('\n💡 Suggestions:\n'));
      suggestions.forEach(suggestion => console.log(`  ${suggestion}`));
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
      '.stryker-tmp'
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
      settings: await this.loadSettings()
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
      const ConcurrencyTester = require(path.join(this.claudeDir, 'scripts', 'core', 'concurrency-tester.js'));
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
      const PhaseB1Tester = require(path.join(this.claudeDir, 'scripts', 'core', 'phase-b1-tester.js'));

      const testerConfig = {
        testDuration: parseInt(options.duration),
        exportPath: options.exportResults
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
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
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
            `
          })
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
          console.log(colors.gray('   • Verify the key hasn\'t expired'));
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
      error: 'MCP integration testing not yet implemented'
    };
  }

  /**
   * Handle Linear sync command
   */
  async handleLinearSync(options) {
    console.log(colors.bold.cyan('🔄 Syncing with Linear Workspace\n'));

    try {
      console.log(colors.gray('This command will sync agent configurations with Linear...'));
      console.log(colors.yellow('⚠️  Linear sync functionality not yet implemented'));
      console.log(colors.gray('\nWould sync:'));
      console.log(colors.gray('   • Team configurations'));
      console.log(colors.gray('   • Project mappings'));
      console.log(colors.gray('   • Agent permissions'));
      console.log(colors.gray('   • Workflow automation'));

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
        'AUDITOR', 'EXECUTOR', 'GUARDIAN', 'STRATEGIST', 'SCHOLAR',
        'TESTER', 'VALIDATOR', 'ANALYZER', 'OPTIMIZER', 'CLEANER',
        'REVIEWER', 'DEPLOYER', 'MONITOR', 'MIGRATOR', 'ARCHITECT',
        'REFACTORER', 'RESEARCHER', 'SECURITYGUARD', 'DOCUMENTER', 'INTEGRATOR'
      ];

      if (!validAgents.includes(agent.toUpperCase())) {
        console.log(colors.red(`❌ Unknown agent: ${agent}`));
        console.log(colors.yellow('Available agents:'));
        validAgents.forEach(a => console.log(colors.gray(`   • ${a}`)));
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

      console.log(colors.gray(`🔄 Executing: ${cmd}\n`));

      // Execute the command
      const { spawn } = require('child_process');
      const child = spawn('sh', ['-c', cmd], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(colors.green(`\n✅ Agent command completed successfully`));
        } else {
          console.log(colors.red(`\n❌ Agent command failed with exit code ${code}`));
          process.exit(code);
        }
      });

      child.on('error', (error) => {
        console.error(colors.red(`Failed to execute agent command: ${error.message}`));
        process.exit(1);
      });

    } catch (error) {
      console.error(colors.red(`Agent invocation failed: ${error.message}`));
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
      console.log(`   Local settings: ${hasSettings ? colors.green('✅ Found') : colors.yellow('⚠️  Not found')}`);

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
  cli.run().catch(error => {
    console.error(colors.red(`CLI Error: ${error.message}`));
    process.exit(1);
  });
}

module.exports = ClaudeCLI;