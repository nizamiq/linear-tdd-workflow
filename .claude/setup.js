#!/usr/bin/env node

/**
 * Setup Script for Claude Code Workflow System
 *
 * Simplified for native Claude Code integration.
 * This script verifies the system is properly configured
 * with .md agents and slash commands.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Console colors
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

class Setup {
  constructor() {
    this.projectRoot = process.cwd();
    this.claudeDir = path.join(this.projectRoot, '.claude');
  }

  async run() {
    console.log(colors.bold('\n🚀 Claude Code Workflow System Setup\n'));

    try {
      // Check if .claude directory exists
      await this.checkClaudeDirectory();

      // Check for agents
      await this.checkAgents();

      // Check for commands
      await this.checkCommands();

      // Check environment setup
      await this.checkEnvironment();

      // Check Linear configuration
      await this.checkLinearConfig();

      // Install dependencies if needed
      await this.checkDependencies();

      console.log(colors.green('\n✅ Setup complete! System is ready for Claude Code.\n'));
      console.log('Available slash commands:');
      console.log('  ' + colors.cyan('/assess') + ' - Code quality assessment');
      console.log('  ' + colors.cyan('/fix <TASK-ID>') + ' - Implement fix with TDD');
      console.log('  ' + colors.cyan('/recover') + ' - Fix CI/CD pipeline');
      console.log('  ' + colors.cyan('/learn') + ' - Extract patterns');
      console.log('  ' + colors.cyan('/release <version>') + ' - Manage release');
      console.log('  ' + colors.cyan('/status') + ' - Check workflow status');

      // Create marker file
      await fs.writeFile(
        path.join(this.projectRoot, '.claude-installed'),
        `Claude Code Workflow System v2.0\nInstalled: ${new Date().toISOString()}\n`,
      );
    } catch (error) {
      console.error(colors.red(`Setup failed: ${error.message}`));
      process.exit(1);
    }
  }

  async checkClaudeDirectory() {
    try {
      await fs.access(this.claudeDir);
      console.log(colors.green('✓') + ' .claude directory found');
    } catch {
      console.error(colors.red('✗') + ' .claude directory not found');
      throw new Error('.claude directory is required');
    }
  }

  async checkAgents() {
    const agentDir = path.join(this.claudeDir, 'agents');
    const files = await fs.readdir(agentDir);
    const mdAgents = files.filter((f) => f.endsWith('.md'));

    if (mdAgents.length === 0) {
      console.error(colors.red('✗') + ' No agent files found');
      throw new Error('No .md agent files in .claude/agents/');
    }

    console.log(colors.green('✓') + ` ${mdAgents.length} agents configured`);

    // Verify core agents exist
    const coreAgents = ['auditor.md', 'executor.md', 'guardian.md', 'strategist.md', 'scholar.md'];
    const missingCore = coreAgents.filter((agent) => !mdAgents.includes(agent));

    if (missingCore.length > 0) {
      console.warn(colors.yellow('⚠') + ` Missing core agents: ${missingCore.join(', ')}`);
    }
  }

  async checkCommands() {
    const commandDir = path.join(this.claudeDir, 'commands');
    const files = await fs.readdir(commandDir);
    const mdCommands = files.filter((f) => f.endsWith('.md') && !f.includes('README'));

    if (mdCommands.length === 0) {
      console.error(colors.red('✗') + ' No command files found');
      throw new Error('No .md command files in .claude/commands/');
    }

    console.log(colors.green('✓') + ` ${mdCommands.length} slash commands configured`);

    // Verify core commands exist
    const coreCommands = [
      'assess.md',
      'fix.md',
      'recover.md',
      'learn.md',
      'release.md',
      'status.md',
    ];
    const missingCommands = coreCommands.filter((cmd) => !mdCommands.includes(cmd));

    if (missingCommands.length > 0) {
      console.warn(colors.yellow('⚠') + ` Missing core commands: ${missingCommands.join(', ')}`);
    }
  }

  async checkEnvironment() {
    const envPath = path.join(this.projectRoot, '.env');
    const envExamplePath = path.join(this.projectRoot, '.env.example');

    try {
      await fs.access(envPath);
      console.log(colors.green('✓') + ' .env file exists');
    } catch {
      console.log(colors.yellow('⚠') + ' .env file not found');

      // Try to create from example
      try {
        const exampleContent = await fs.readFile(envExamplePath, 'utf8');
        await fs.writeFile(envPath, exampleContent);
        console.log(colors.green('✓') + ' Created .env from .env.example');
        console.log(colors.yellow('  ⚠ Please configure your LINEAR_API_KEY in .env'));
      } catch {
        // Create basic .env
        const basicEnv = `# Linear Integration
LINEAR_API_KEY=lin_api_xxxxx  # Replace with your Linear API key
LINEAR_TEAM_ID=your-team-id   # Replace with your Linear team ID
LINEAR_PROJECT_ID=             # Optional: specific project ID
LINEAR_TASK_PREFIX=            # Optional: custom task prefix

# System Settings
DEBUG=false
NODE_ENV=development
`;
        await fs.writeFile(envPath, basicEnv);
        console.log(colors.green('✓') + ' Created basic .env file');
        console.log(colors.yellow('  ⚠ Please configure your Linear credentials in .env'));
      }
    }
  }

  async checkLinearConfig() {
    // Check if Linear config exists
    const configPath = path.join(this.claudeDir, 'config', 'linear.config.js');

    try {
      await fs.access(configPath);
      console.log(colors.green('✓') + ' Linear configuration found');

      // Try to load and validate
      try {
        require('dotenv').config();
        const LinearConfig = require(configPath);
        const config = new LinearConfig();
        const linearConfig = config.getConfig();
        console.log(colors.green('✓') + ' Linear configuration valid');
      } catch (error) {
        if (error.message.includes('LINEAR_API_KEY')) {
          console.log(colors.yellow('⚠') + ' Linear API key not configured');
        } else {
          console.warn(colors.yellow('⚠') + ` Linear config issue: ${error.message}`);
        }
      }
    } catch {
      console.log(colors.yellow('⚠') + ' Linear configuration not found (optional)');
    }
  }

  async checkDependencies() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

      // Check for required dependencies
      const required = ['commander', 'dotenv'];
      const missing = required.filter(
        (dep) => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep],
      );

      if (missing.length > 0) {
        console.log(
          colors.yellow('⚠') + ` Installing missing dependencies: ${missing.join(', ')}`,
        );
        execSync(`npm install ${missing.join(' ')}`, { stdio: 'inherit' });
      }

      console.log(colors.green('✓') + ' Dependencies installed');
    } catch (error) {
      console.warn(colors.yellow('⚠') + ' Could not verify dependencies');
    }
  }
}

// Run setup
if (require.main === module) {
  const setup = new Setup();
  setup.run().catch((error) => {
    console.error(colors.red(`Setup failed: ${error.message}`));
    process.exit(1);
  });
}

module.exports = Setup;
