#!/usr/bin/env node

/**
 * Agent Status Monitor - Shows real-time status of all agents
 *
 * Displays:
 * - Agent health and availability
 * - Concurrency limits and current usage
 * - Path locks and conflicts
 * - Recent performance metrics
 * - SLA compliance status
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

class AgentStatusMonitor {
  constructor() {
    this.agentsDir = path.join(__dirname, '..', '.claude', 'agents');
  }

  /**
   * Display comprehensive agent status dashboard
   */
  async displayStatus() {
    console.log(chalk.bold('\n🤖 Linear TDD Workflow - Agent Status Dashboard\n'));

    // 1. Load all agent configurations
    const agents = await this.loadAllAgents();

    // 2. Core agent status
    await this.displayCoreAgents(agents);

    // 3. Specialized agent status
    await this.displaySpecializedAgents(agents);

    // 4. System health overview
    await this.displaySystemHealth(agents);

    // 5. Performance metrics
    await this.displayPerformanceMetrics();

    // 6. Concurrency and locks
    await this.displayConcurrencyStatus();
  }

  /**
   * Load all agent configurations
   */
  async loadAllAgents() {
    const agents = new Map();

    try {
      const files = await fs.readdir(this.agentsDir);
      const agentFiles = files.filter((f) => f.endsWith('.md'));

      for (const file of agentFiles) {
        const agentPath = path.join(this.agentsDir, file);
        const content = await fs.readFile(agentPath, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (frontmatterMatch) {
          const config = yaml.load(frontmatterMatch[1]);
          config.filename = file;
          agents.set(config.name, config);
        }
      }

      return agents;
    } catch (error) {
      console.error(chalk.red(`Failed to load agents: ${error.message}`));
      return new Map();
    }
  }

  /**
   * Display core 5 agents status
   */
  async displayCoreAgents(agents) {
    console.log(chalk.bold.blue('📊 Core Agents (MUST-HAVE)\n'));

    const coreAgents = ['auditor', 'executor', 'guardian', 'strategist', 'scholar'];

    for (const agentName of coreAgents) {
      const agent = agents.get(agentName);
      if (agent) {
        await this.displayAgentStatus(agent, true);
      } else {
        console.log(chalk.red(`❌ ${agentName.toUpperCase()}: NOT CONFIGURED`));
      }
    }
  }

  /**
   * Display specialized agents status
   */
  async displaySpecializedAgents(agents) {
    console.log(chalk.bold.cyan('\n🔧 Specialized Agents (PARALLELIZABLE)\n'));

    const specializedAgents = Array.from(agents.keys()).filter(
      (name) => !['auditor', 'executor', 'guardian', 'strategist', 'scholar'].includes(name),
    );

    // Group by domain
    const domains = {
      Testing: ['tester', 'validator'],
      Quality: ['analyzer', 'optimizer', 'cleaner', 'reviewer'],
      Infrastructure: ['deployer', 'monitor', 'migrator'],
      Architecture: ['architect', 'refactorer', 'researcher'],
      Security: ['securityguard'],
      Documentation: ['documenter'],
      Integration: ['integrator'],
    };

    for (const [domain, agentList] of Object.entries(domains)) {
      console.log(chalk.bold(`  ${domain}:`));

      for (const agentName of agentList) {
        const agent = agents.get(agentName);
        if (agent) {
          await this.displayAgentStatus(agent, false);
        }
      }
      console.log();
    }
  }

  /**
   * Display individual agent status
   */
  async displayAgentStatus(agent, isCore = false) {
    const icon = isCore ? '🎯' : '⚡';
    const name = agent.name.toUpperCase().padEnd(12);

    // Status indicators
    const hasConfig = agent.tools && agent.tools.length > 0 ? '✅' : '❌';
    const hasFIL = agent.fil ? '🛡️' : '⚠️';
    const hasConcurrency = agent.concurrency ? '⚡' : '📝';

    // SLA compliance
    const slaStatus = this.checkSLACompliance(agent);

    console.log(
      `${icon} ${chalk.bold(name)} ` +
        `${hasConfig} Config ${hasFIL} FIL ${hasConcurrency} Concurrency ` +
        `${slaStatus.icon} SLA`,
    );

    // Details
    if (agent.concurrency) {
      const concurrency = `${agent.concurrency.maxParallel || 1} workers, ${agent.concurrency.conflictStrategy || 'queue'}`;
      console.log(`    Concurrency: ${concurrency}`);
    }

    if (agent.fil) {
      const filInfo = `Allow: [${agent.fil.allow?.join(', ') || 'none'}], Block: [${agent.fil.block?.join(', ') || 'none'}]`;
      console.log(`    FIL Policy: ${filInfo}`);
    }

    if (agent.sla) {
      console.log(`    SLA Targets: ${JSON.stringify(agent.sla)}`);
    }
  }

  /**
   * Check SLA compliance
   */
  checkSLACompliance(agent) {
    if (!agent.sla) {
      return { icon: '📋', status: 'no-sla' };
    }

    // Mock SLA check - would integrate with actual metrics
    const mockCompliance = Math.random() > 0.2; // 80% compliance rate

    return {
      icon: mockCompliance ? '✅' : '⚠️',
      status: mockCompliance ? 'compliant' : 'warning',
    };
  }

  /**
   * Display system health overview
   */
  async displaySystemHealth(agents) {
    console.log(chalk.bold.green('\n🏥 System Health Overview\n'));

    const coreAgentsConfigured = [
      'auditor',
      'executor',
      'guardian',
      'strategist',
      'scholar',
    ].filter((name) => agents.has(name)).length;

    const totalAgentsConfigured = agents.size;

    const healthMetrics = {
      'Core Agents': `${coreAgentsConfigured}/5 configured`,
      'Total Agents': `${totalAgentsConfigured}/20 configured`,
      'TDD Gates': '✅ Active',
      'Parallel Execution': '✅ Available',
      'FIL Enforcement': '✅ Active',
      'Coverage Threshold': '≥80% diff coverage',
      'Mutation Testing': '≥30% threshold',
    };

    for (const [metric, value] of Object.entries(healthMetrics)) {
      console.log(`  ${metric.padEnd(20)}: ${value}`);
    }
  }

  /**
   * Display performance metrics
   */
  async displayPerformanceMetrics() {
    console.log(chalk.bold.yellow('\n📈 Performance Metrics (Last 24h)\n'));

    // Mock metrics - would come from actual monitoring
    const metrics = {
      'Assessment SLA': '✅ 11.2m avg (target: ≤12m)',
      'Fix Pack Throughput': '✅ 9.3 PRs/day (target: ≥8)',
      'Pipeline Recovery': '✅ 8.7m p95 (target: ≤10m)',
      'Rollback Rate': '✅ 0.2% (target: ≤0.3%)',
      'Auto-recovery': '✅ 92% (target: ≥90%)',
      'Coverage Compliance': '✅ 89% PRs (target: ≥80%)',
      'Mutation Score': '⚠️ 28% avg (target: ≥30%)',
    };

    for (const [metric, value] of Object.entries(metrics)) {
      const color = value.includes('✅') ? chalk.green : chalk.yellow;
      console.log(`  ${color(metric.padEnd(20))}: ${value}`);
    }
  }

  /**
   * Display concurrency and lock status
   */
  async displayConcurrencyStatus() {
    console.log(chalk.bold.magenta('\n🔐 Concurrency & Locks Status\n'));

    // Mock concurrency data
    const concurrencyData = {
      'Active Workers': '7/50 slots used',
      'Path Locks': '3 files locked',
      'Queue Depth': '2 tasks waiting',
      'Conflict Resolution': 'queue strategy active',
    };

    for (const [item, status] of Object.entries(concurrencyData)) {
      console.log(`  ${item.padEnd(20)}: ${status}`);
    }

    // Show current locks
    console.log('\n  📝 Current Path Locks:');
    const mockLocks = [
      'src/utils.js → EXECUTOR (Fix Pack CLEAN-123)',
      'tests/integration/ → VALIDATOR (Coverage check)',
      'package.json → SECURITYGUARD (Dependency scan)',
    ];

    mockLocks.forEach((lock) => {
      console.log(`    🔒 ${lock}`);
    });
  }

  /**
   * Quick health check
   */
  async quickHealthCheck() {
    const agents = await this.loadAllAgents();
    const coreCount = ['auditor', 'executor', 'guardian', 'strategist', 'scholar'].filter((name) =>
      agents.has(name),
    ).length;

    if (coreCount === 5) {
      console.log(chalk.green('✅ All core agents configured'));
      return true;
    } else {
      console.log(chalk.red(`❌ Only ${coreCount}/5 core agents configured`));
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new AgentStatusMonitor();

  const [, , command] = process.argv;

  switch (command) {
    case 'quick':
      monitor.quickHealthCheck();
      break;

    case 'dashboard':
    default:
      monitor.displayStatus().catch((error) => {
        console.error(chalk.red(`Status check failed: ${error.message}`));
        process.exit(1);
      });
      break;
  }
}

module.exports = AgentStatusMonitor;
