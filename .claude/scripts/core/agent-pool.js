#!/usr/bin/env node

/**
 * Agent Pool - Evidence-based concurrent agent management
 *
 * Based on Phase B.0 findings:
 * - Max 3 concurrent agents (conservative start)
 * - Task tool supports higher concurrency
 * - Focus on coordination and error handling
 */

const EventEmitter = require('events');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');

class AgentPool extends EventEmitter {
  constructor(mcpQueueManager, options = {}) {
    super();

    this.mcpQueueManager = mcpQueueManager;

    // Evidence-based configuration
    this.config = {
      maxConcurrentAgents: 3, // Conservative start based on MCP limits
      agentTimeout: 300000,   // 5 minutes max per agent task
      retryAttempts: 2,
      healthCheckInterval: 30000, // 30 seconds
      ...options
    };

    // Agent tracking
    this.activeAgents = new Map(); // agentId -> agentInfo
    this.agentCounter = 0;
    this.taskQueue = [];

    // Metrics
    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      timeoutTasks: 0,
      agentsSpawned: 0,
      averageTaskTime: 0,
      concurrencyUtilization: []
    };

    // Available agent types from our system
    this.availableAgents = [
      'auditor', 'executor', 'guardian', 'scholar', 'strategist',
      'analyzer', 'architect', 'cleaner', 'deployer', 'documenter',
      'integrator', 'migrator', 'monitor', 'optimizer', 'refactorer',
      'researcher', 'reviewer', 'securityguard', 'tester', 'validator'
    ];

    console.log(chalk.blue(`🤖 Agent Pool initialized (max ${this.config.maxConcurrentAgents} concurrent agents)`));

    // Start health monitoring
    this.startHealthMonitoring();
  }

  /**
   * Execute a task using an appropriate agent
   */
  async executeTask(taskSpec) {
    const taskId = this.generateTaskId();
    const queueTime = Date.now();

    const task = {
      id: taskId,
      agentType: taskSpec.agentType,
      command: taskSpec.command,
      params: taskSpec.params || {},
      priority: taskSpec.priority || 'normal',
      timeout: taskSpec.timeout || this.config.agentTimeout,
      queueTime,
      attempts: 0,
      resolve: null,
      reject: null
    };

    this.metrics.totalTasks++;

    console.log(chalk.gray(`📋 Queuing task ${taskId} for ${task.agentType}:${task.command}`));

    return new Promise((resolve, reject) => {
      task.resolve = resolve;
      task.reject = reject;

      // Add to task queue
      this.addToTaskQueue(task);

      // Try to execute immediately if capacity available
      this.processTaskQueue();
    });
  }

  /**
   * Add task to queue with priority ordering
   */
  addToTaskQueue(task) {
    if (task.priority === 'high') {
      this.taskQueue.unshift(task);
    } else if (task.priority === 'low') {
      this.taskQueue.push(task);
    } else {
      // Normal priority - insert before low priority items
      const lowPriorityIndex = this.taskQueue.findIndex(item => item.priority === 'low');
      if (lowPriorityIndex !== -1) {
        this.taskQueue.splice(lowPriorityIndex, 0, task);
      } else {
        this.taskQueue.push(task);
      }
    }
  }

  /**
   * Process task queue - spawn agents up to capacity limit
   */
  async processTaskQueue() {
    // Check capacity and available tasks
    const activeCount = this.activeAgents.size;
    const maxConcurrent = this.config.maxConcurrentAgents;

    if (activeCount >= maxConcurrent || this.taskQueue.length === 0) {
      return; // No capacity or no work
    }

    // Take next task from queue
    const task = this.taskQueue.shift();
    if (!task) return;

    // Spawn agent for this task
    this.spawnAgent(task)
      .finally(() => {
        // Process next task in queue
        setImmediate(() => this.processTaskQueue());
      });
  }

  /**
   * Spawn an agent to handle a specific task
   */
  async spawnAgent(task) {
    const agentId = this.generateAgentId();
    const startTime = Date.now();

    const agentInfo = {
      id: agentId,
      type: task.agentType,
      task: task,
      startTime,
      status: 'starting',
      process: null
    };

    // Track active agent
    this.activeAgents.set(agentId, agentInfo);
    this.metrics.agentsSpawned++;

    console.log(chalk.blue(`🚀 Spawning agent ${agentId} (${task.agentType}) for task ${task.id}`));

    try {
      // Execute the agent task
      const result = await this.executeAgentTask(agentInfo);

      // Calculate metrics
      const duration = Date.now() - startTime;
      const waitTime = startTime - task.queueTime;

      this.updateMetrics(duration, 'success');

      console.log(chalk.green(`✅ Agent ${agentId} completed task ${task.id} - ${duration}ms`));

      // Resolve the task
      task.resolve(result);

    } catch (error) {
      // Handle task failure
      const duration = Date.now() - startTime;

      // Check if we should retry
      if (task.attempts < this.config.retryAttempts) {
        task.attempts++;
        console.log(chalk.yellow(`⚠️  Retrying task ${task.id} (attempt ${task.attempts})`));

        // Add back to queue for retry
        this.addToTaskQueue(task);
      } else {
        // Task failed permanently
        this.updateMetrics(duration, 'failure');
        console.log(chalk.red(`❌ Agent ${agentId} failed task ${task.id} - ${error.message}`));

        task.reject(error);
      }
    } finally {
      // Remove from active tracking
      this.activeAgents.delete(agentId);
    }
  }

  /**
   * Execute agent task using Task tool or direct invocation
   */
  async executeAgentTask(agentInfo) {
    const { task, id: agentId } = agentInfo;

    agentInfo.status = 'running';

    // Validate agent type
    if (!this.availableAgents.includes(task.agentType)) {
      throw new Error(`Unknown agent type: ${task.agentType}`);
    }

    // For now, simulate agent execution based on our architecture
    // In real implementation, this would use the Task tool or direct MCP calls
    const result = await this.simulateAgentExecution(agentInfo);

    agentInfo.status = 'completed';
    return result;
  }

  /**
   * Simulate agent execution with realistic behavior
   */
  async simulateAgentExecution(agentInfo) {
    const { task, id: agentId } = agentInfo;

    // Simulate different agent behaviors based on type
    const agentBehavior = this.getAgentBehavior(task.agentType);

    // Simulate MCP operations through queue manager
    const mcpOperations = [];

    if (agentBehavior.usesLinear) {
      mcpOperations.push(
        this.mcpQueueManager.queueOperation('linear-server', 'list_issues', {
          limit: 10,
          assignee: 'me'
        })
      );
    }

    if (agentBehavior.usesSequentialThinking) {
      mcpOperations.push(
        this.mcpQueueManager.queueOperation('sequential-thinking', 'sequentialthinking', {
          thought: `Analyzing task ${task.id} for ${task.agentType}`,
          thoughtNumber: 1,
          totalThoughts: 2,
          nextThoughtNeeded: true
        })
      );
    }

    // Execute MCP operations if any
    let mcpResults = [];
    if (mcpOperations.length > 0) {
      mcpResults = await Promise.all(mcpOperations);
    }

    // Simulate agent processing time
    await this.sleep(agentBehavior.processingTime);

    // Simulate occasional failures (5% rate)
    if (Math.random() < 0.05) {
      throw new Error(`Simulated ${task.agentType} agent failure`);
    }

    return {
      agentId,
      taskId: task.id,
      agentType: task.agentType,
      command: task.command,
      mcpResults,
      result: `${task.agentType} completed ${task.command}`,
      timestamp: Date.now()
    };
  }

  /**
   * Get behavior profile for different agent types
   */
  getAgentBehavior(agentType) {
    const behaviors = {
      // Core agents with Linear integration
      auditor: { usesLinear: true, usesSequentialThinking: true, processingTime: 2000 },
      executor: { usesLinear: true, usesSequentialThinking: false, processingTime: 3000 },
      guardian: { usesLinear: true, usesSequentialThinking: false, processingTime: 1500 },
      scholar: { usesLinear: false, usesSequentialThinking: true, processingTime: 2500 },
      strategist: { usesLinear: true, usesSequentialThinking: true, processingTime: 1000 },

      // Specialized agents
      analyzer: { usesLinear: false, usesSequentialThinking: true, processingTime: 2000 },
      architect: { usesLinear: false, usesSequentialThinking: true, processingTime: 3000 },
      cleaner: { usesLinear: false, usesSequentialThinking: false, processingTime: 1000 },
      deployer: { usesLinear: false, usesSequentialThinking: false, processingTime: 2000 },
      documenter: { usesLinear: false, usesSequentialThinking: false, processingTime: 1500 },
      integrator: { usesLinear: false, usesSequentialThinking: false, processingTime: 2500 },
      migrator: { usesLinear: false, usesSequentialThinking: true, processingTime: 3000 },
      monitor: { usesLinear: false, usesSequentialThinking: false, processingTime: 1000 },
      optimizer: { usesLinear: false, usesSequentialThinking: true, processingTime: 2500 },
      refactorer: { usesLinear: false, usesSequentialThinking: false, processingTime: 2000 },
      researcher: { usesLinear: false, usesSequentialThinking: true, processingTime: 2000 },
      reviewer: { usesLinear: false, usesSequentialThinking: true, processingTime: 1500 },
      securityguard: { usesLinear: false, usesSequentialThinking: true, processingTime: 2000 },
      tester: { usesLinear: false, usesSequentialThinking: false, processingTime: 2500 },
      validator: { usesLinear: false, usesSequentialThinking: false, processingTime: 1500 }
    };

    return behaviors[agentType] || {
      usesLinear: false,
      usesSequentialThinking: false,
      processingTime: 2000
    };
  }

  /**
   * Get current pool status
   */
  getStatus() {
    const activeAgentInfo = Array.from(this.activeAgents.values()).map(agent => ({
      id: agent.id,
      type: agent.type,
      taskId: agent.task.id,
      status: agent.status,
      runtime: Date.now() - agent.startTime
    }));

    const utilization = (this.activeAgents.size / this.config.maxConcurrentAgents * 100).toFixed(1);

    return {
      configuration: {
        maxConcurrentAgents: this.config.maxConcurrentAgents,
        agentTimeout: this.config.agentTimeout
      },
      currentState: {
        activeAgents: this.activeAgents.size,
        queuedTasks: this.taskQueue.length,
        utilization: `${utilization}%`
      },
      activeAgents: activeAgentInfo,
      metrics: this.metrics
    };
  }

  /**
   * Update performance metrics
   */
  updateMetrics(duration, status) {
    if (status === 'success') {
      this.metrics.completedTasks++;
    } else if (status === 'timeout') {
      this.metrics.timeoutTasks++;
    } else {
      this.metrics.failedTasks++;
    }

    // Update average task time
    const completed = this.metrics.completedTasks;
    if (completed > 0) {
      this.metrics.averageTaskTime =
        (this.metrics.averageTaskTime * (completed - 1) + duration) / completed;
    }

    // Track utilization
    const utilization = this.activeAgents.size / this.config.maxConcurrentAgents;
    this.metrics.concurrencyUtilization.push(utilization);

    // Keep only last 100 utilization samples
    if (this.metrics.concurrencyUtilization.length > 100) {
      this.metrics.concurrencyUtilization.shift();
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health check on active agents
   */
  performHealthCheck() {
    const now = Date.now();

    for (const [agentId, agentInfo] of this.activeAgents.entries()) {
      const runtime = now - agentInfo.startTime;

      // Check for timeout
      if (runtime > agentInfo.task.timeout) {
        console.log(chalk.red(`⏰ Agent ${agentId} timed out after ${runtime}ms`));

        // Mark task as failed due to timeout
        this.updateMetrics(runtime, 'timeout');
        agentInfo.task.reject(new Error(`Agent timeout after ${runtime}ms`));

        // Remove from active tracking
        this.activeAgents.delete(agentId);
      }
    }
  }

  /**
   * Gracefully shutdown the agent pool
   */
  async shutdown(timeout = 60000) {
    console.log(chalk.yellow('🛑 Shutting down Agent Pool...'));

    // Stop accepting new tasks
    this.shuttingDown = true;

    // Reject all queued tasks
    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      task.reject(new Error('Agent pool shutting down'));
    }

    // Wait for active agents to complete
    const shutdownStart = Date.now();
    while (this.activeAgents.size > 0 && (Date.now() - shutdownStart) < timeout) {
      await this.sleep(1000);
      console.log(chalk.gray(`Waiting for ${this.activeAgents.size} agents to complete...`));
    }

    // Force cleanup any remaining agents
    for (const [agentId, agentInfo] of this.activeAgents.entries()) {
      console.log(chalk.red(`🚫 Force stopping agent ${agentId}`));
      agentInfo.task.reject(new Error('Agent pool shutdown'));
      this.activeAgents.delete(agentId);
    }

    console.log(chalk.green('✅ Agent Pool shutdown complete'));
  }

  /**
   * Generate unique task ID
   */
  generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Generate unique agent ID
   */
  generateAgentId() {
    return `agent-${++this.agentCounter}`;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Display real-time status
   */
  displayStatus() {
    const status = this.getStatus();

    console.log(chalk.bold.cyan('\n🤖 Agent Pool Status'));
    console.log(chalk.blue('─'.repeat(50)));

    // Current state
    console.log(chalk.white(`Active Agents:      ${status.currentState.activeAgents}/${status.configuration.maxConcurrentAgents}`));
    console.log(chalk.white(`Queued Tasks:       ${status.currentState.queuedTasks}`));
    console.log(chalk.white(`Utilization:        ${status.currentState.utilization}`));

    // Active agents
    if (status.activeAgents.length > 0) {
      console.log(chalk.blue('\nActive Agents:'));
      for (const agent of status.activeAgents) {
        const runtime = (agent.runtime / 1000).toFixed(1);
        console.log(chalk.white(`  ${agent.id.padEnd(10)} ${agent.type.padEnd(12)} ${agent.status.padEnd(10)} ${runtime}s`));
      }
    }

    // Metrics
    console.log(chalk.blue('─'.repeat(50)));
    console.log(chalk.white(`Total Tasks:        ${status.metrics.totalTasks}`));
    console.log(chalk.white(`Completed:          ${status.metrics.completedTasks}`));
    console.log(chalk.white(`Failed:             ${status.metrics.failedTasks}`));
    console.log(chalk.white(`Success Rate:       ${(status.metrics.completedTasks / Math.max(1, status.metrics.totalTasks) * 100).toFixed(1)}%`));
    console.log(chalk.white(`Avg Task Time:      ${status.metrics.averageTaskTime.toFixed(0)}ms`));
    console.log(chalk.blue('─'.repeat(50)));
  }
}

module.exports = AgentPool;