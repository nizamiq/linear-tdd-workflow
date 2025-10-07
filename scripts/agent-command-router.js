#!/usr/bin/env node

/**
 * Agent Command Router - Parallel execution engine for multi-agent TDD workflow
 *
 * Handles:
 * - Fan-out/fan-in patterns for parallel work
 * - Agent-specific tool scoping and FIL guardrails
 * - Path-based locking to prevent conflicts
 * - TDD gate enforcement
 */

const { Command } = require('commander');
const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const chalk = require('chalk');
const ora = require('ora');

class AgentCommandRouter {
  constructor() {
    this.activeAgents = new Map();
    this.pathLocks = new Map();
    this.concurrencyLimits = new Map();
  }

  /**
   * Load agent configuration from .md frontmatter
   */
  async loadAgentConfig(agentName) {
    const agentPath = path.join(
      __dirname,
      '..',
      '.claude',
      'agents',
      `${agentName.toLowerCase()}.md`,
    );

    try {
      const content = await fs.readFile(agentPath, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (!frontmatterMatch) {
        throw new Error(`No frontmatter found in ${agentPath}`);
      }

      const config = yaml.load(frontmatterMatch[1]);
      return config;
    } catch (error) {
      throw new Error(`Failed to load agent config for ${agentName}: ${error.message}`);
    }
  }

  /**
   * Validate FIL (Feature Impact Level) constraints
   */
  validateFIL(agentConfig, operation) {
    const { fil } = agentConfig;
    if (!fil) return true;

    // Extract FIL level from operation or PR diff
    const filLevel = this.extractFILLevel(operation);

    if (fil.block && fil.block.includes(filLevel)) {
      throw new Error(`Agent ${agentConfig.name} is blocked from ${filLevel} operations`);
    }

    if (fil.allow && !fil.allow.includes(filLevel)) {
      throw new Error(`Agent ${agentConfig.name} is not allowed for ${filLevel} operations`);
    }

    return true;
  }

  /**
   * Extract FIL level from operation context
   */
  extractFILLevel(operation) {
    // Simplified FIL classification - would be enhanced with AST analysis
    if (operation.includes('format') || operation.includes('lint')) return 'FIL-0';
    if (operation.includes('rename') || operation.includes('constant')) return 'FIL-1';
    if (operation.includes('config') || operation.includes('utility')) return 'FIL-2';
    if (operation.includes('api') || operation.includes('migration')) return 'FIL-3';

    return 'FIL-1'; // Default to low-risk
  }

  /**
   * Acquire path locks to prevent conflicting concurrent operations
   */
  async acquirePathLocks(agentConfig, paths) {
    const { locks } = agentConfig;
    if (!locks || locks.scope === 'none') return [];

    const acquiredLocks = [];

    for (const lockPath of paths) {
      if (this.pathLocks.has(lockPath)) {
        // Release any locks we acquired so far
        acquiredLocks.forEach((lock) => this.pathLocks.delete(lock));
        throw new Error(`Path ${lockPath} is locked by another agent`);
      }

      this.pathLocks.set(lockPath, agentConfig.name);
      acquiredLocks.push(lockPath);
    }

    return acquiredLocks;
  }

  /**
   * Release path locks
   */
  releasePathLocks(locks) {
    locks.forEach((lock) => this.pathLocks.delete(lock));
  }

  /**
   * Check concurrency limits
   */
  checkConcurrencyLimit(agentConfig) {
    const { concurrency } = agentConfig;
    if (!concurrency) return true;

    const currentCount = this.concurrencyLimits.get(agentConfig.name) || 0;
    if (currentCount >= concurrency.maxParallel) {
      throw new Error(`Agent ${agentConfig.name} at max concurrency (${concurrency.maxParallel})`);
    }

    return true;
  }

  /**
   * Execute partitioned assessment (fan-out/fan-in pattern)
   */
  async executePartitionedAssessment(scope = 'changed', maxWorkers = 10) {
    const spinner = ora('Starting partitioned code assessment').start();

    try {
      // 1. Load AUDITOR configuration
      const auditorConfig = await this.loadAgentConfig('auditor');

      // 2. Partition files by path/package
      const partitions = await this.partitionFiles(scope, maxWorkers);
      spinner.text = `Created ${partitions.length} assessment partitions`;

      // 3. Fan-out: Execute parallel assessments
      const assessmentPromises = partitions.map((partition, index) =>
        this.executeAuditorPartition(auditorConfig, partition, index),
      );

      const results = await Promise.all(assessmentPromises);

      // 4. Fan-in: Merge and deduplicate findings
      const mergedFindings = this.mergeAssessmentResults(results);

      // 5. Generate Linear tasks
      await this.generateLinearTasks(mergedFindings);

      spinner.succeed(`Assessment complete: ${mergedFindings.length} findings`);
      return mergedFindings;
    } catch (error) {
      spinner.fail(`Assessment failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Partition files for parallel processing
   */
  async partitionFiles(scope, maxWorkers) {
    // Implementation would use git diff, glob patterns, etc.
    // For now, simplified partitioning by directory
    const partitions = [];

    if (scope === 'full') {
      partitions.push({ path: 'src/**', type: 'source' });
      partitions.push({ path: 'lib/**', type: 'library' });
      partitions.push({ path: 'tests/**', type: 'test' });
    } else {
      // Get changed files from git
      partitions.push({ path: 'changed', type: 'diff' });
    }

    return partitions.slice(0, maxWorkers);
  }

  /**
   * Execute AUDITOR on a partition
   */
  async executeAuditorPartition(config, partition, index) {
    // Simulate auditor execution
    return {
      partition: index,
      findings: [
        {
          id: `CLEAN-${index * 100 + 1}`,
          type: 'complexity',
          severity: 'medium',
          path: partition.path,
          effort: 'small',
        },
      ],
    };
  }

  /**
   * Merge assessment results and deduplicate
   */
  mergeAssessmentResults(results) {
    const allFindings = results.flatMap((r) => r.findings);

    // Deduplicate by path + type
    const unique = new Map();
    allFindings.forEach((finding) => {
      const key = `${finding.path}:${finding.type}`;
      if (!unique.has(key)) {
        unique.set(key, finding);
      }
    });

    return Array.from(unique.values());
  }

  /**
   * Generate Linear tasks from findings
   */
  async generateLinearTasks(findings) {
    // Would integrate with Linear API
    console.log(`Generated ${findings.length} Linear tasks`);
  }

  /**
   * Execute Fix Pack with TDD enforcement
   */
  async executeFixPack(taskId, options = {}) {
    const spinner = ora(`Implementing Fix Pack ${taskId}`).start();

    try {
      // 1. Load task details
      const task = await this.loadLinearTask(taskId);

      // 2. Validate FIL constraints
      const executorConfig = await this.loadAgentConfig('executor');
      this.validateFIL(executorConfig, task.description);

      // 3. Acquire path locks
      const affectedPaths = this.getAffectedPaths(task);
      const locks = await this.acquirePathLocks(executorConfig, affectedPaths);

      try {
        // 4. Execute TDD cycle: RED → GREEN → REFACTOR
        await this.executeTDDCycle(task, executorConfig);

        spinner.succeed(`Fix Pack ${taskId} implemented successfully`);
      } finally {
        this.releasePathLocks(locks);
      }
    } catch (error) {
      spinner.fail(`Fix Pack ${taskId} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute TDD cycle with strict gate enforcement
   */
  async executeTDDCycle(task, executorConfig) {
    // RED: Write failing test
    await this.executeAgent('tester', {
      command: 'generate-failing-test',
      task: task,
      diffCoverageTarget: 80,
    });

    // GREEN: Minimal implementation
    await this.executeAgent('executor', {
      command: 'implement-minimal-fix',
      task: task,
      maxLOC: executorConfig.fil?.maxLinesOfCode || 300,
    });

    // Validate GREEN phase
    const coverage = await this.executeAgent('validator', {
      command: 'validate-coverage',
      task: task,
      threshold: 80,
    });

    if (coverage.diffCoverage < 80) {
      throw new Error(`Insufficient diff coverage: ${coverage.diffCoverage}%`);
    }

    // REFACTOR: Improve with test safety
    await this.executeAgent('executor', {
      command: 'refactor-with-tests',
      task: task,
    });
  }

  /**
   * Execute agent with configuration validation
   */
  async executeAgent(agentName, params) {
    const config = await this.loadAgentConfig(agentName);

    // Validate permissions, concurrency, etc.
    this.checkConcurrencyLimit(config);

    // Increment concurrency counter
    this.concurrencyLimits.set(agentName, (this.concurrencyLimits.get(agentName) || 0) + 1);

    try {
      // Execute agent (would call Claude Code with agent context)
      console.log(`Executing ${agentName}:${params.command}`);

      // Simulate execution time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true, data: params };
    } finally {
      // Decrement concurrency counter
      this.concurrencyLimits.set(
        agentName,
        Math.max(0, (this.concurrencyLimits.get(agentName) || 0) - 1),
      );
    }
  }

  /**
   * Load Linear task details
   */
  async loadLinearTask(taskId) {
    // Would integrate with Linear API
    return {
      id: taskId,
      description: 'Fix complexity issue',
      files: ['src/utils.js'],
      type: 'FIL-1',
    };
  }

  /**
   * Get affected file paths from task
   */
  getAffectedPaths(task) {
    return task.files || ['src/**'];
  }
}

// CLI setup
const program = new Command();
const router = new AgentCommandRouter();

program
  .name('agent-router')
  .description('Multi-agent TDD workflow command router')
  .version('1.0.0');

program
  .command('assess')
  .description('Run partitioned code assessment')
  .option('--scope <scope>', 'Assessment scope (full|changed)', 'changed')
  .option('--workers <num>', 'Max parallel workers', '10')
  .action(async (options) => {
    try {
      await router.executePartitionedAssessment(options.scope, parseInt(options.workers));
    } catch (error) {
      console.error(chalk.red(`Assessment failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('implement')
  .description('Implement Fix Pack with TDD enforcement')
  .argument('<task-id>', 'Linear task ID (e.g., CLEAN-123)')
  .action(async (taskId) => {
    try {
      await router.executeFixPack(taskId);
    } catch (error) {
      console.error(chalk.red(`Implementation failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show agent status and concurrency')
  .action(async () => {
    console.log('Active agents:', router.activeAgents.size);
    console.log('Path locks:', router.pathLocks.size);
    console.log('Concurrency limits:', Object.fromEntries(router.concurrencyLimits));
  });

if (require.main === module) {
  program.parse();
}

module.exports = AgentCommandRouter;
