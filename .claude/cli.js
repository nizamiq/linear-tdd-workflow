#!/usr/bin/env node

/**
 * Claude CLI - Simplified for Claude Code Native Integration
 *
 * This CLI now primarily serves as a backup for running journeys
 * when slash commands are not available. Claude Code handles
 * agent discovery and invocation natively.
 */

const { Command } = require('commander');
const path = require('path');
const fs = require('fs').promises;
const { execSync } = require('child_process');

// Native console styling
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

class ClaudeCLI {
  constructor() {
    this.claudeDir = __dirname;
    this.projectRoot = process.cwd();
    this.program = new Command();
  }

  async run() {
    this.setupCommands();
    await this.program.parseAsync(process.argv);
  }

  setupCommands() {
    this.program
      .name('claude')
      .description('Claude Code Workflow System - Backup CLI')
      .version('2.0.0');

    // Info command - shows available agents and commands
    this.program
      .command('info')
      .description('Show available agents and slash commands')
      .action(async () => {
        console.log(colors.bold('\n🤖 Claude Code Native Integration\n'));
        console.log("This system now uses Claude Code's native agent discovery.");
        console.log('\nCore Workflow Commands:');
        console.log('  ' + colors.cyan('/assess') + ' - Code quality assessment (AUDITOR)');
        console.log('  ' + colors.cyan('/fix <TASK-ID>') + ' - Implement fix with TDD (EXECUTOR)');
        console.log('  ' + colors.cyan('/recover') + ' - Fix CI/CD pipeline (GUARDIAN)');
        console.log('  ' + colors.cyan('/learn') + ' - Extract patterns (SCHOLAR)');
        console.log('  ' + colors.cyan('/release <version>') + ' - Manage release (STRATEGIST)');
        console.log('  ' + colors.cyan('/status') + ' - Check workflow status (STRATEGIST)');
        console.log('  ' + colors.cyan('/cycle') + ' - Sprint planning (PLANNER)');

        console.log('\nDevelopment Commands:');
        console.log('  ' + colors.cyan('/django') + ' - Django development (DJANGO-PRO)');
        console.log('  ' + colors.cyan('/python') + ' - Python optimization (PYTHON-PRO)');
        console.log(
          '  ' + colors.cyan('/typescript') + ' - TypeScript development (TYPESCRIPT-PRO)',
        );

        console.log('\nInfrastructure Commands:');
        console.log(
          '  ' + colors.cyan('/deploy') + ' - Production deployment (DEPLOYMENT-ENGINEER)',
        );
        console.log(
          '  ' + colors.cyan('/optimize-db') + ' - Database optimization (DATABASE-OPTIMIZER)',
        );
        console.log(
          '  ' + colors.cyan('/monitor') + ' - Observability setup (OBSERVABILITY-ENGINEER)',
        );

        console.log('\nAgent Files:');
        const agentFiles = await fs.readdir(path.join(this.claudeDir, 'agents'));
        const mdAgents = agentFiles.filter((f) => f.endsWith('.md'));
        mdAgents.forEach((agent) => {
          console.log('  ' + colors.green('✓') + ' .claude/agents/' + agent);
        });

        console.log('\nFor journey execution, use:');
        console.log('  ' + colors.yellow('make assess'));
        console.log('  ' + colors.yellow('make fix-pack'));
        console.log('  ' + colors.yellow('make recover'));
        console.log('  ' + colors.yellow('make learn'));
        console.log('  ' + colors.yellow('make release'));
      });

    // Journey runner - for backward compatibility
    this.program
      .command('journey')
      .description('Run a specific journey')
      .argument('<name>', 'Journey name (assess, fix, recover, learn, release)')
      .option('--task-id <id>', 'Linear task ID (for fix journey)')
      .action(async (name, options) => {
        const journeyMap = {
          assess: 'jr2-assessment.js',
          fix: 'jr3-fix-pack.js',
          recover: 'jr4-ci-recovery.js',
          learn: 'jr5-pattern-mining.js',
          release: 'jr6-release.js',
        };

        const journeyFile = journeyMap[name];
        if (!journeyFile) {
          console.error(colors.red(`Unknown journey: ${name}`));
          process.exit(1);
        }

        const journeyPath = path.join(this.claudeDir, 'journeys', journeyFile);
        console.log(colors.cyan(`Running journey: ${name}`));

        try {
          const args = options.taskId ? `--task-id ${options.taskId}` : '';
          execSync(`node ${journeyPath} ${args}`, { stdio: 'inherit' });
        } catch (error) {
          console.error(colors.red(`Journey failed: ${error.message}`));
          process.exit(1);
        }
      });

    // Status command
    this.program
      .command('status')
      .description('Show system status')
      .action(async () => {
        console.log(colors.bold('\n📊 System Status\n'));

        // Check for .env
        try {
          await fs.access(path.join(this.projectRoot, '.env'));
          console.log(colors.green('✓') + ' Environment configured');
        } catch {
          console.log(colors.red('✗') + ' Missing .env file');
        }

        // Check for agents
        const agentFiles = await fs.readdir(path.join(this.claudeDir, 'agents'));
        const mdAgents = agentFiles.filter((f) => f.endsWith('.md'));
        console.log(colors.green('✓') + ` ${mdAgents.length} agents available`);

        // Check for commands
        const commandFiles = await fs.readdir(path.join(this.claudeDir, 'commands'));
        const mdCommands = commandFiles.filter((f) => f.endsWith('.md') && !f.includes('README'));
        console.log(colors.green('✓') + ` ${mdCommands.length} slash commands available`);

        // Check Linear config
        if (process.env.LINEAR_API_KEY) {
          console.log(colors.green('✓') + ' Linear integration configured');
        } else {
          console.log(colors.yellow('⚠') + ' Linear API key not set');
        }

        console.log('\n' + colors.cyan('System ready for Claude Code!'));
      });

    // List commands - for Claude Code discovery
    this.program
      .command('commands:list')
      .description('List available commands (for Claude Code)')
      .option('--json', 'Output as JSON')
      .action(async (options) => {
        const commands = [
          // Core workflow
          { command: '/assess', description: 'Code quality assessment', agent: 'auditor' },
          { command: '/fix', description: 'TDD fix implementation', agent: 'executor' },
          { command: '/recover', description: 'CI/CD recovery', agent: 'guardian' },
          { command: '/learn', description: 'Pattern extraction', agent: 'scholar' },
          { command: '/release', description: 'Release management', agent: 'strategist' },
          { command: '/status', description: 'Workflow status', agent: 'strategist' },
          { command: '/cycle', description: 'Sprint planning', agent: 'planner' },
          // Development
          { command: '/django', description: 'Django development', agent: 'django-pro' },
          { command: '/python', description: 'Python optimization', agent: 'python-pro' },
          {
            command: '/typescript',
            description: 'TypeScript development',
            agent: 'typescript-pro',
          },
          // Infrastructure
          {
            command: '/deploy',
            description: 'Production deployment',
            agent: 'deployment-engineer',
          },
          {
            command: '/optimize-db',
            description: 'Database optimization',
            agent: 'database-optimizer',
          },
          {
            command: '/monitor',
            description: 'Observability setup',
            agent: 'observability-engineer',
          },
        ];

        if (options.json) {
          console.log(JSON.stringify(commands, null, 2));
        } else {
          commands.forEach((cmd) => {
            console.log(`${cmd.command} - ${cmd.description} (${cmd.agent})`);
          });
        }
      });
  }
}

// Run CLI
const cli = new ClaudeCLI();
cli.run().catch((error) => {
  console.error(colors.red(`Error: ${error.message}`));
  process.exit(1);
});
