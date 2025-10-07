#!/usr/bin/env node

/**
 * Error Recovery Manager - Comprehensive error handling and recovery system
 *
 * Phase B.1 error recovery strategy:
 * - Circuit breaker pattern for MCP servers
 * - Agent failure isolation and recovery
 * - Graceful degradation under load
 * - Automatic retry with exponential backoff
 * - System health monitoring and alerts
 */

const EventEmitter = require('events');

// Native ANSI colors to replace chalk
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

class ErrorRecoveryManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      // Circuit breaker settings
      circuitBreaker: {
        failureThreshold: 5, // Failures before opening circuit
        resetTimeout: 60000, // 1 minute before attempting reset
        halfOpenMaxCalls: 3, // Max calls in half-open state
        successThreshold: 2, // Successes needed to close circuit
      },
      // Retry settings
      retry: {
        maxAttempts: 3,
        baseDelay: 1000, // 1 second base delay
        maxDelay: 30000, // 30 second max delay
        backoffMultiplier: 2, // Exponential backoff
      },
      // Health check settings
      healthCheck: {
        interval: 30000, // 30 second health checks
        timeout: 10000, // 10 second timeout
        degradedThreshold: 70, // 70% success rate = degraded
        criticalThreshold: 50, // 50% success rate = critical
      },
      ...options,
    };

    // Circuit breaker state per service
    this.circuitBreakers = new Map();

    // Error tracking
    this.errorStats = {
      mcp: {
        'linear-server': { failures: 0, successes: 0, lastError: null },
        'sequential-thinking': { failures: 0, successes: 0, lastError: null },
        context7: { failures: 0, successes: 0, lastError: null },
        kubernetes: { failures: 0, successes: 0, lastError: null },
        playwright: { failures: 0, successes: 0, lastError: null },
      },
      agents: {
        failures: 0,
        timeouts: 0,
        recoveries: 0,
        lastError: null,
      },
      system: {
        degradedCount: 0,
        criticalCount: 0,
        lastDegradation: null,
      },
    };

    // Recovery strategies
    this.recoveryStrategies = new Map();
    this.initializeRecoveryStrategies();

    // Health monitoring
    this.healthTimer = null;
    this.isMonitoring = false;
  }

  /**
   * Initialize recovery strategies for different error types
   */
  initializeRecoveryStrategies() {
    // MCP timeout recovery
    this.recoveryStrategies.set('mcp_timeout', {
      name: 'MCP Timeout Recovery',
      action: async (context) => {
        const { serverName, operation } = context;

        this.openCircuitBreaker(serverName);

        // Wait before retry
        await this.sleep(this.config.retry.baseDelay);

        return { recovered: true, action: 'circuit_breaker_opened' };
      },
    });

    // Agent failure recovery
    this.recoveryStrategies.set('agent_failure', {
      name: 'Agent Failure Recovery',
      action: async (context) => {
        const { agentType, taskId, error } = context;

        this.errorStats.agents.failures++;
        this.errorStats.agents.lastError = error;

        const isTransient = this.isTransientError(error);

        if (isTransient) {
          // Retry with exponential backoff
          const delay = this.calculateRetryDelay(context.attempt || 1);
          await this.sleep(delay);
          return { recovered: true, action: 'retry_with_backoff', delay };
        } else {
          return { recovered: false, action: 'permanent_failure' };
        }
      },
    });

    // System overload recovery
    this.recoveryStrategies.set('system_overload', {
      name: 'System Overload Recovery',
      action: async (context) => {
        this.errorStats.system.degradedCount++;
        this.errorStats.system.lastDegradation = Date.now();

        // Implement graceful degradation
        return {
          recovered: true,
          action: 'graceful_degradation',
          recommendations: [
            'Reduce concurrent agent limit',
            'Increase MCP operation timeouts',
            'Enable request queuing',
          ],
        };
      },
    });

    // Network connectivity recovery
    this.recoveryStrategies.set('network_error', {
      name: 'Network Connectivity Recovery',
      action: async (context) => {
        const { serverName } = context;

        const delay = Math.min(
          this.config.retry.baseDelay * Math.pow(2, context.attempt || 1),
          this.config.retry.maxDelay,
        );

        await this.sleep(delay);

        return { recovered: true, action: 'network_retry', delay };
      },
    });
  }

  /**
   * Start error monitoring and recovery
   */
  start() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;

    // Start health monitoring
    this.healthTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheck.interval);

    this.emit('monitoring-started');
  }

  /**
   * Handle error with appropriate recovery strategy
   */
  async handleError(errorType, context = {}) {
    try {
      // Get recovery strategy
      const strategy = this.recoveryStrategies.get(errorType);

      if (!strategy) {
        return { recovered: false, action: 'no_strategy' };
      }

      // Execute recovery
      const result = await strategy.action(context);

      if (result.recovered) {
        this.errorStats.agents.recoveries++;
      } else {
      }

      // Emit recovery event
      this.emit('error-recovery', {
        errorType,
        strategy: strategy.name,
        result,
        context,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      return { recovered: false, action: 'recovery_error', error: error.message };
    }
  }

  /**
   * Circuit breaker implementation
   */
  openCircuitBreaker(serverName) {
    const breaker = this.getCircuitBreaker(serverName);

    if (breaker.state !== 'open') {
      breaker.state = 'open';
      breaker.openTime = Date.now();
      breaker.failures = 0; // Reset failure count

      // Schedule reset attempt
      setTimeout(() => {
        this.attemptCircuitReset(serverName);
      }, this.config.circuitBreaker.resetTimeout);

      this.emit('circuit-breaker-opened', { serverName, timestamp: Date.now() });
    }
  }

  /**
   * Attempt to reset circuit breaker
   */
  attemptCircuitReset(serverName) {
    const breaker = this.getCircuitBreaker(serverName);

    if (breaker.state === 'open') {
      breaker.state = 'half-open';
      breaker.halfOpenCalls = 0;
      breaker.halfOpenSuccesses = 0;

      this.emit('circuit-breaker-half-open', { serverName, timestamp: Date.now() });
    }
  }

  /**
   * Record operation result for circuit breaker
   */
  recordOperationResult(serverName, success) {
    const breaker = this.getCircuitBreaker(serverName);
    const stats = this.errorStats.mcp[serverName];

    if (success) {
      stats.successes++;

      if (breaker.state === 'half-open') {
        breaker.halfOpenSuccesses++;
        breaker.halfOpenCalls++;

        if (breaker.halfOpenSuccesses >= this.config.circuitBreaker.successThreshold) {
          breaker.state = 'closed';
          this.emit('circuit-breaker-closed', { serverName, timestamp: Date.now() });
        }
      } else if (breaker.state === 'closed') {
        // Reset failure count on success
        breaker.failures = 0;
      }
    } else {
      stats.failures++;

      if (breaker.state === 'closed') {
        breaker.failures++;

        if (breaker.failures >= this.config.circuitBreaker.failureThreshold) {
          this.openCircuitBreaker(serverName);
        }
      } else if (breaker.state === 'half-open') {
        breaker.halfOpenCalls++;

        breaker.state = 'open';
        breaker.openTime = Date.now();

        // Schedule another reset attempt
        setTimeout(() => {
          this.attemptCircuitReset(serverName);
        }, this.config.circuitBreaker.resetTimeout);
      }
    }
  }

  /**
   * Check if operation should be allowed through circuit breaker
   */
  shouldAllowOperation(serverName) {
    const breaker = this.getCircuitBreaker(serverName);

    switch (breaker.state) {
      case 'closed':
        return true;

      case 'open':
        return false;

      case 'half-open':
        return breaker.halfOpenCalls < this.config.circuitBreaker.halfOpenMaxCalls;

      default:
        return true;
    }
  }

  /**
   * Get or create circuit breaker for server
   */
  getCircuitBreaker(serverName) {
    if (!this.circuitBreakers.has(serverName)) {
      this.circuitBreakers.set(serverName, {
        state: 'closed',
        failures: 0,
        openTime: null,
        halfOpenCalls: 0,
        halfOpenSuccesses: 0,
      });
    }
    return this.circuitBreakers.get(serverName);
  }

  /**
   * Determine if error is transient and should be retried
   */
  isTransientError(error) {
    const transientPatterns = [
      /timeout/i,
      /network/i,
      /connection/i,
      /temporary/i,
      /503/,
      /502/,
      /429/, // Rate limiting
    ];

    const errorMessage = error.message || error.toString();
    return transientPatterns.some((pattern) => pattern.test(errorMessage));
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt) {
    const delay =
      this.config.retry.baseDelay * Math.pow(this.config.retry.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.config.retry.maxDelay);
  }

  /**
   * Perform system health check
   */
  performHealthCheck() {
    const health = this.assessSystemHealth();

    if (health.status === 'degraded') {
      this.emit('health-degraded', health);
    } else if (health.status === 'critical') {
      this.emit('health-critical', health);
    }
  }

  /**
   * Assess overall system health
   */
  assessSystemHealth() {
    const now = Date.now();
    const health = {
      status: 'healthy',
      timestamp: now,
      issues: [],
    };

    // Check MCP server health
    for (const [serverName, stats] of Object.entries(this.errorStats.mcp)) {
      const total = stats.failures + stats.successes;
      if (total > 10) {
        // Only assess if we have enough data
        const successRate = (stats.successes / total) * 100;

        if (successRate < this.config.healthCheck.criticalThreshold) {
          health.status = 'critical';
          health.issues.push(`${serverName} success rate: ${successRate.toFixed(1)}%`);
        } else if (successRate < this.config.healthCheck.degradedThreshold) {
          health.status = health.status === 'critical' ? 'critical' : 'degraded';
          health.issues.push(`${serverName} success rate: ${successRate.toFixed(1)}%`);
        }
      }
    }

    // Check circuit breaker states
    for (const [serverName, breaker] of this.circuitBreakers.entries()) {
      if (breaker.state === 'open') {
        health.status = health.status === 'critical' ? 'critical' : 'degraded';
        health.issues.push(`${serverName} circuit breaker open`);
      }
    }

    // Set reason
    if (health.issues.length > 0) {
      health.reason = health.issues.join(', ');
    }

    return health;
  }

  /**
   * Get comprehensive error statistics
   */
  getErrorStats() {
    return {
      ...this.errorStats,
      circuitBreakers: Object.fromEntries(this.circuitBreakers),
      systemHealth: this.assessSystemHealth(),
    };
  }

  /**
   * Reset error statistics
   */
  resetStats() {
    for (const serverStats of Object.values(this.errorStats.mcp)) {
      serverStats.failures = 0;
      serverStats.successes = 0;
      serverStats.lastError = null;
    }

    this.errorStats.agents.failures = 0;
    this.errorStats.agents.timeouts = 0;
    this.errorStats.agents.recoveries = 0;
    this.errorStats.agents.lastError = null;

    this.errorStats.system.degradedCount = 0;
    this.errorStats.system.criticalCount = 0;
    this.errorStats.system.lastDegradation = null;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Stop error monitoring
   */
  stop() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }

    this.emit('monitoring-stopped');
  }
}

module.exports = ErrorRecoveryManager;
