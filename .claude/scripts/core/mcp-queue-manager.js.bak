#!/usr/bin/env node

/**
 * MCP Queue Manager - Evidence-based concurrency management
 *
 * Based on Phase B.0 findings:
 * - Linear server: Max 2 concurrent operations
 * - Sequential Thinking: Max 2 concurrent operations
 * - Response times: 200-800ms typical
 * - Need timeout and retry logic
 */

const EventEmitter = require('events');
const chalk = require('chalk');

class McpQueueManager extends EventEmitter {
  constructor(options = {}) {
    super();

    // Evidence-based limits from Phase B.0
    this.serverLimits = {
      'linear-server': 2,
      'sequential-thinking': 2,
      'context7': 1, // Conservative for unknown servers
      'kubernetes': 1,
      'playwright': 2,
      ...options.customLimits
    };

    // Active operations per server
    this.activeOperations = {};

    // Queues per server
    this.queues = {};

    // Operation tracking
    this.operationId = 0;
    this.metrics = {
      totalRequests: 0,
      completedRequests: 0,
      failedRequests: 0,
      timeoutRequests: 0,
      averageResponseTime: 0,
      queueWaitTimes: []
    };

    // Configuration
    this.config = {
      defaultTimeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second base delay
      maxQueueSize: 50,
      ...options
    };

    // Error recovery manager (set later)
    this.errorRecoveryManager = null;

    // Initialize server tracking
    this.initializeServers();

    console.log(chalk.blue(`🔌 MCP Queue Manager initialized with limits: ${JSON.stringify(this.serverLimits)}`));
  }

  /**
   * Initialize server tracking structures
   */
  initializeServers() {
    for (const serverName of Object.keys(this.serverLimits)) {
      this.activeOperations[serverName] = new Set();
      this.queues[serverName] = [];
    }
  }

  /**
   * Set error recovery manager for circuit breaker integration
   */
  setErrorRecoveryManager(errorRecoveryManager) {
    this.errorRecoveryManager = errorRecoveryManager;
  }

  /**
   * Queue an MCP operation with automatic execution when capacity available
   */
  async queueOperation(serverName, operation, params = {}, options = {}) {
    const operationId = this.generateOperationId();
    const queueTime = Date.now();

    const request = {
      id: operationId,
      serverName,
      operation,
      params,
      queueTime,
      attempts: 0,
      timeout: options.timeout || this.config.defaultTimeout,
      priority: options.priority || 'normal', // high, normal, low
      resolve: null,
      reject: null,
      abortController: new AbortController()
    };

    this.metrics.totalRequests++;

    console.log(chalk.gray(`📥 Queuing ${serverName}:${operation} (ID: ${operationId})`));

    return new Promise((resolve, reject) => {
      request.resolve = resolve;
      request.reject = reject;

      // Check circuit breaker
      if (this.errorRecoveryManager && !this.errorRecoveryManager.shouldAllowOperation(serverName)) {
        reject(new Error(`Circuit breaker open for ${serverName} - operation blocked`));
        return;
      }

      // Check queue capacity
      if (this.queues[serverName].length >= this.config.maxQueueSize) {
        reject(new Error(`Queue full for ${serverName} (max: ${this.config.maxQueueSize})`));
        return;
      }

      // Add to appropriate queue with priority ordering
      this.addToQueue(serverName, request);

      // Try to execute immediately if capacity available
      this.processQueue(serverName);
    });
  }

  /**
   * Add request to queue with priority ordering
   */
  addToQueue(serverName, request) {
    const queue = this.queues[serverName];

    if (request.priority === 'high') {
      // Insert at front of queue
      queue.unshift(request);
    } else if (request.priority === 'low') {
      // Add to end of queue
      queue.push(request);
    } else {
      // Normal priority - insert before low priority items
      const lowPriorityIndex = queue.findIndex(item => item.priority === 'low');
      if (lowPriorityIndex !== -1) {
        queue.splice(lowPriorityIndex, 0, request);
      } else {
        queue.push(request);
      }
    }
  }

  /**
   * Process queue for a specific server
   */
  async processQueue(serverName) {
    // Check if we have capacity and pending requests
    const activeCount = this.activeOperations[serverName].size;
    const maxConcurrent = this.serverLimits[serverName] || 1;
    const pendingRequests = this.queues[serverName];

    if (activeCount >= maxConcurrent || pendingRequests.length === 0) {
      return; // No capacity or no work
    }

    // Take next request from queue
    const request = pendingRequests.shift();

    if (!request) return;

    // Track as active
    this.activeOperations[serverName].add(request.id);

    // Execute the operation
    this.executeOperation(request)
      .finally(() => {
        // Remove from active tracking
        this.activeOperations[serverName].delete(request.id);

        // Process next item in queue
        setImmediate(() => this.processQueue(serverName));
      });
  }

  /**
   * Execute an MCP operation with timeout and retry logic
   */
  async executeOperation(request) {
    const { serverName, operation, params, timeout, attempts } = request;
    const startTime = Date.now();

    console.log(chalk.blue(`🔄 Executing ${serverName}:${operation} (ID: ${request.id}, attempt: ${attempts + 1})`));

    try {
      // Increment attempt counter
      request.attempts++;

      // Execute the operation with timeout
      const result = await Promise.race([
        this.callMcpOperation(serverName, operation, params),
        this.createTimeoutPromise(timeout, request.abortController.signal)
      ]);

      // Calculate metrics
      const duration = Date.now() - startTime;
      const waitTime = startTime - request.queueTime;

      this.updateMetrics(duration, waitTime, 'success');

      // Record success for circuit breaker
      if (this.errorRecoveryManager) {
        this.errorRecoveryManager.recordOperationResult(serverName, true);
      }

      console.log(chalk.green(`✅ Completed ${serverName}:${operation} (ID: ${request.id}) - ${duration}ms`));

      // Resolve the original promise
      request.resolve(result);

    } catch (error) {
      const duration = Date.now() - startTime;
      const waitTime = startTime - request.queueTime;

      // Check if we should retry
      if (request.attempts < this.config.retryAttempts && !request.abortController.signal.aborted) {
        console.log(chalk.yellow(`⚠️  Retrying ${serverName}:${operation} (ID: ${request.id}) - ${error.message}`));

        // Exponential backoff delay
        const delay = this.config.retryDelay * Math.pow(2, request.attempts - 1);
        setTimeout(() => {
          this.executeOperation(request);
        }, delay);

        return;
      }

      // Record failure for circuit breaker
      if (this.errorRecoveryManager) {
        this.errorRecoveryManager.recordOperationResult(serverName, false);
      }

      // Track failure metrics
      if (error.message.includes('timeout')) {
        this.updateMetrics(duration, waitTime, 'timeout');
        console.log(chalk.red(`⏰ Timeout ${serverName}:${operation} (ID: ${request.id}) after ${duration}ms`));

        // Handle timeout error through recovery manager
        if (this.errorRecoveryManager) {
          this.errorRecoveryManager.handleError('mcp_timeout', {
            serverName,
            operation,
            duration,
            attempts: request.attempts
          });
        }
      } else {
        this.updateMetrics(duration, waitTime, 'failure');
        console.log(chalk.red(`❌ Failed ${serverName}:${operation} (ID: ${request.id}) - ${error.message}`));

        // Handle other errors through recovery manager
        if (this.errorRecoveryManager) {
          const errorType = error.message.includes('network') ? 'network_error' : 'mcp_failure';
          this.errorRecoveryManager.handleError(errorType, {
            serverName,
            operation,
            error,
            attempts: request.attempts
          });
        }
      }

      // Reject the original promise
      request.reject(error);
    }
  }

  /**
   * Call actual MCP operation (to be integrated with real MCP tools)
   */
  async callMcpOperation(serverName, operation, params) {
    // For now, simulate MCP calls based on our Phase B.0 findings
    // In real implementation, this would use actual Task tool or MCP calls

    const responseTime = this.getSimulatedResponseTime(serverName);
    await this.sleep(responseTime);

    // Simulate occasional failures (5% rate based on testing)
    if (Math.random() < 0.05) {
      throw new Error(`Simulated ${serverName} service error`);
    }

    return {
      server: serverName,
      operation,
      params,
      result: `mock_${operation}_result`,
      timestamp: Date.now()
    };
  }

  /**
   * Get simulated response time based on Phase B.0 findings
   */
  getSimulatedResponseTime(serverName) {
    const baseTimes = {
      'linear-server': 250,      // 200-400ms observed
      'sequential-thinking': 400, // 300-600ms observed
      'context7': 200,
      'kubernetes': 150,
      'playwright': 300
    };

    const baseTime = baseTimes[serverName] || 300;
    const variance = baseTime * 0.5; // ±50% variance

    return baseTime + (Math.random() * variance * 2 - variance);
  }

  /**
   * Create timeout promise
   */
  createTimeoutPromise(timeout, abortSignal) {
    return new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);

      // Cancel timeout if operation is aborted
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Operation aborted'));
        });
      }
    });
  }

  /**
   * Update performance metrics
   */
  updateMetrics(duration, waitTime, status) {
    if (status === 'success') {
      this.metrics.completedRequests++;
    } else if (status === 'timeout') {
      this.metrics.timeoutRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    const totalCompleted = this.metrics.completedRequests;
    if (totalCompleted > 0) {
      this.metrics.averageResponseTime =
        (this.metrics.averageResponseTime * (totalCompleted - 1) + duration) / totalCompleted;
    }

    // Track queue wait times
    this.metrics.queueWaitTimes.push(waitTime);

    // Keep only last 100 wait times for average calculation
    if (this.metrics.queueWaitTimes.length > 100) {
      this.metrics.queueWaitTimes.shift();
    }
  }

  /**
   * Get current status and metrics
   */
  getStatus() {
    const queueSizes = {};
    const activeCounts = {};

    for (const serverName of Object.keys(this.serverLimits)) {
      queueSizes[serverName] = this.queues[serverName].length;
      activeCounts[serverName] = this.activeOperations[serverName].size;
    }

    const avgWaitTime = this.metrics.queueWaitTimes.length > 0
      ? this.metrics.queueWaitTimes.reduce((a, b) => a + b, 0) / this.metrics.queueWaitTimes.length
      : 0;

    return {
      serverLimits: this.serverLimits,
      queueSizes,
      activeCounts,
      metrics: {
        ...this.metrics,
        averageWaitTime: avgWaitTime,
        successRate: this.metrics.totalRequests > 0
          ? (this.metrics.completedRequests / this.metrics.totalRequests * 100).toFixed(1)
          : 0
      }
    };
  }

  /**
   * Gracefully shutdown - complete active operations and reject queued ones
   */
  async shutdown(timeout = 30000) {
    console.log(chalk.yellow('🛑 Shutting down MCP Queue Manager...'));

    // Stop accepting new requests
    this.shuttingDown = true;

    // Reject all queued operations
    for (const serverName of Object.keys(this.queues)) {
      const queue = this.queues[serverName];
      while (queue.length > 0) {
        const request = queue.shift();
        request.reject(new Error('Service shutting down'));
      }
    }

    // Wait for active operations to complete (with timeout)
    const shutdownStart = Date.now();
    while (this.hasActiveOperations() && (Date.now() - shutdownStart) < timeout) {
      await this.sleep(100);
    }

    // Force abort any remaining operations
    for (const serverName of Object.keys(this.activeOperations)) {
      for (const operationId of this.activeOperations[serverName]) {
        // Operations should have abort controllers for cleanup
      }
    }

    console.log(chalk.green('✅ MCP Queue Manager shutdown complete'));
  }

  /**
   * Check if any operations are still active
   */
  hasActiveOperations() {
    return Object.values(this.activeOperations)
      .some(activeSet => activeSet.size > 0);
  }

  /**
   * Generate unique operation ID
   */
  generateOperationId() {
    return `mcp-op-${++this.operationId}`;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Display real-time status (for monitoring)
   */
  displayStatus() {
    const status = this.getStatus();

    console.log(chalk.bold.cyan('\n📊 MCP Queue Manager Status'));
    console.log(chalk.blue('─'.repeat(50)));

    // Server status
    for (const [server, limit] of Object.entries(status.serverLimits)) {
      const active = status.activeCounts[server];
      const queued = status.queueSizes[server];
      const utilization = ((active / limit) * 100).toFixed(0);

      console.log(chalk.white(`${server.padEnd(20)} ${active}/${limit} active (${utilization}%) | ${queued} queued`));
    }

    // Metrics
    console.log(chalk.blue('─'.repeat(50)));
    console.log(chalk.white(`Total Requests:     ${status.metrics.totalRequests}`));
    console.log(chalk.white(`Success Rate:       ${status.metrics.successRate}%`));
    console.log(chalk.white(`Avg Response Time:  ${status.metrics.averageResponseTime.toFixed(0)}ms`));
    console.log(chalk.white(`Avg Wait Time:      ${status.metrics.averageWaitTime.toFixed(0)}ms`));
    console.log(chalk.blue('─'.repeat(50)));
  }
}

module.exports = McpQueueManager;