#!/usr/bin/env node

/**
 * Process Cleanup Utility
 *
 * Kills all lingering Node.js processes that might be blocking system resources.
 * This script is designed to clean up processes left behind by our test/agent system.
 */

const { execSync } = require('child_process');
const path = require('path');

class ProcessCleanup {
  constructor() {
    this.projectDir = path.resolve(__dirname, '../..');
    this.processesToKill = [];
  }

  log(message, type = 'info') {
    const emoji =
      {
        info: '📝',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        cleanup: '🧹',
      }[type] || '📝';
    console.log(`${emoji} ${message}`);
  }

  /**
   * Check if a process is likely an LLM-enabled process
   */
  isLLMProcess(command) {
    const llmIndicators = [
      'agent-command-router',
      'memory-safe-router',
      'comprehensive-workflow',
      'agent:invoke',
      'assess',
      '.claude',
    ];
    return llmIndicators.some((indicator) => command.includes(indicator));
  }

  /**
   * Find all Node.js processes related to our project
   */
  findLingeringProcesses() {
    try {
      // Find Node.js processes that might be from our project
      const psOutput = execSync('ps aux | grep node', {
        encoding: 'utf8',
        timeout: 5000,
      });

      const lines = psOutput.split('\n').filter(
        (line) =>
          line.includes('node') &&
          !line.includes('grep') &&
          !line.includes('cleanup-processes') && // Don't kill ourselves
          (line.includes('.claude') ||
            line.includes('tdd-gate-enforcer') ||
            line.includes('memory-safe-router') ||
            line.includes('comprehensive-workflow') ||
            line.includes('agent-command-router') ||
            line.includes('linear-tdd-workflow') ||
            line.includes('jest') ||
            line.includes('npm')),
      );

      return lines.map((line) => {
        const parts = line.trim().split(/\s+/);
        const command = line.substring(line.indexOf('node'));
        return {
          pid: parts[1],
          command,
          isLLM: this.isLLMProcess(command),
        };
      });
    } catch (error) {
      this.log(`Error finding processes: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Kill specific processes
   */
  killProcess(pid, signal = 'SIGTERM') {
    try {
      execSync(`kill -${signal} ${pid}`, {
        timeout: 2000,
        stdio: 'ignore',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Force kill with SIGKILL
   */
  forceKillProcess(pid) {
    try {
      execSync(`kill -SIGKILL ${pid}`, {
        timeout: 2000,
        stdio: 'ignore',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clean up all lingering processes
   */
  async cleanup(options = {}) {
    const { dryRun = false, force = false } = options;

    this.log('Starting process cleanup...', 'cleanup');

    // Find lingering processes
    const processes = this.findLingeringProcesses();

    if (processes.length === 0) {
      this.log('No lingering processes found', 'success');
      return { cleaned: 0, errors: 0 };
    }

    this.log(`Found ${processes.length} potentially lingering processes`, 'warning');

    let cleaned = 0;
    let errors = 0;

    for (const process of processes) {
      const isLLM = process.isLLM;
      const emoji = isLLM ? '🤖' : '⚙️';
      this.log(
        `${emoji} Process ${process.pid}${isLLM ? ' [LLM]' : ''}: ${process.command.substring(0, 80)}...`,
      );

      if (dryRun) {
        this.log(`[DRY RUN] Would kill process ${process.pid}`, 'info');
        continue;
      }

      // For LLM processes, give more time for graceful shutdown
      const gracefulTimeout = isLLM ? 15000 : 5000;

      // Try graceful termination first
      if (this.killProcess(process.pid, 'SIGTERM')) {
        if (isLLM) {
          this.log(`⏳ Waiting for LLM process ${process.pid} to finish gracefully...`);
          await new Promise((resolve) => setTimeout(resolve, gracefulTimeout));
        }
        this.log(`✓ Gracefully terminated process ${process.pid}`, 'success');
        cleaned++;
      } else if (force && this.forceKillProcess(process.pid)) {
        this.log(`✓ Force killed process ${process.pid}`, 'success');
        cleaned++;
      } else {
        this.log(`✗ Failed to kill process ${process.pid}`, 'error');
        errors++;
      }

      // Wait a bit between kills
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.log(
      `Cleanup complete: ${cleaned} processes cleaned, ${errors} errors`,
      errors > 0 ? 'warning' : 'success',
    );

    return { cleaned, errors };
  }

  /**
   * Monitor system resources and suggest cleanup if needed
   */
  checkSystemResources() {
    try {
      // Check memory usage
      const memInfo = execSync('ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%mem | head -20', {
        encoding: 'utf8',
        timeout: 5000,
      });

      const nodeProcesses = memInfo
        .split('\n')
        .filter((line) => line.includes('node') && !line.includes('grep'));

      if (nodeProcesses.length > 5) {
        this.log(`Warning: ${nodeProcesses.length} Node.js processes running`, 'warning');
        this.log('Consider running cleanup if system is slow', 'warning');
      }

      return nodeProcesses.length;
    } catch (error) {
      this.log(`Error checking system resources: ${error.message}`, 'error');
      return 0;
    }
  }
}

// CLI execution
if (require.main === module) {
  const cleanup = new ProcessCleanup();
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Process Cleanup Utility

Usage:
  node cleanup-processes.js [options]

Options:
  --dry-run     Show what would be cleaned without actually doing it
  --force       Use SIGKILL if SIGTERM fails
  --check       Check system resources without cleaning
  --help        Show this help

Examples:
  node cleanup-processes.js --dry-run
  node cleanup-processes.js --force
  node cleanup-processes.js --check
`);
    process.exit(0);
  }

  const options = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    check: args.includes('--check'),
  };

  if (options.check) {
    const count = cleanup.checkSystemResources();
    process.exit(count > 10 ? 1 : 0);
  } else {
    cleanup
      .cleanup(options)
      .then((result) => {
        process.exit(result.errors > 0 ? 1 : 0);
      })
      .catch((error) => {
        console.error('Cleanup failed:', error.message);
        process.exit(1);
      });
  }
}

module.exports = ProcessCleanup;
