#!/usr/bin/env node

/**
 * Concurrency Control Plane - Advanced orchestration for multi-agent execution
 *
 * Features:
 * - Path-based lock registry with TTL
 * - Agent pool management (active/idle/queued)
 * - Cost tracking and budget enforcement
 * - Circuit breaker for SLA/budget violations
 * - Work-stealing for fairness
 * - Sharding algorithms for parallel execution
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ConcurrencyManager extends EventEmitter {
  constructor(options = {}) {
    super();

    // Configuration
    this.config = {
      maxConcurrent: options.maxConcurrent || 10,
      maxQueueSize: options.maxQueueSize || 100,
      lockTTL: options.lockTTL || 15 * 60 * 1000, // 15 minutes default
      budgetPerRepo: options.budgetPerRepo || 2500,
      budgetGlobal: options.budgetGlobal || 10000,
      costPerOperation: options.costPerOperation || {
        assessment: 0.5,
        fixPack: 3,
        validation: 0.2,
        pattern: 1,
        recovery: 2,
      },
      sla: {
        orchestrationOverhead: 0.05, // 5% max
        utilizationTarget: 0.75, // 75% min
        decisionTime: 2000, // 2s max
        planningTime: 1500, // 1.5s max
      },
    };

    // State management
    this.state = {
      activeAgents: new Map(), // agentId -> {name, startTime, operation, cost}
      idleAgents: new Set(), // agentId set
      queuedTasks: [], // {task, priority, timestamp}
      pathLocks: new Map(), // path -> {agentId, timestamp, ttl}
      budgetUsed: {
        daily: 0,
        monthly: 0,
        perRepo: new Map(),
      },
      metrics: {
        tasksCompleted: 0,
        averageWaitTime: 0,
        utilizationRate: 0,
        orchestrationOverhead: 0,
        costPerFix: [],
      },
    };

    // Circuit breaker
    this.circuitBreaker = {
      isOpen: false,
      failures: 0,
      threshold: 5,
      resetTime: 60000, // 1 minute
    };

    // Start background tasks
    this.startMaintenanceTasks();
  }

  /**
   * Schedule a task for execution with sharding and concurrency management
   */
  async scheduleTask(task) {
    const startTime = Date.now();

    // Check circuit breaker
    if (this.circuitBreaker.isOpen) {
      throw new Error('Circuit breaker is open - system overloaded');
    }

    // Check budget constraints
    const estimatedCost = this.estimateTaskCost(task);
    if (!this.checkBudget(task.repo, estimatedCost)) {
      return this.queueTask(task, 'budget_exceeded');
    }

    // Check concurrency limits
    if (this.state.activeAgents.size >= this.config.maxConcurrent) {
      return this.queueTask(task, 'concurrency_limit');
    }

    // Attempt to acquire necessary locks
    const requiredPaths = this.getRequiredPaths(task);
    const locks = await this.acquirePathLocks(requiredPaths, task.agentId);

    if (!locks) {
      return this.queueTask(task, 'path_locked');
    }

    // Execute task
    try {
      const agentId = task.agentId || this.generateAgentId();

      this.state.activeAgents.set(agentId, {
        name: task.agentName,
        startTime: Date.now(),
        operation: task.operation,
        cost: estimatedCost,
        paths: requiredPaths,
      });

      // Track orchestration overhead
      const overhead = Date.now() - startTime;
      this.updateMetric('orchestrationOverhead', overhead);

      return {
        agentId,
        status: 'scheduled',
        estimatedCost,
        locks: requiredPaths,
        queuePosition: 0,
      };
    } catch (error) {
      this.releasePathLocks(requiredPaths);
      this.handleFailure(error);
      throw error;
    }
  }

  /**
   * Implement sharding strategy for parallel execution
   */
  async createShardingPlan(operation, scope) {
    const shards = [];

    switch (operation) {
      case 'assessment':
        shards.push(...(await this.shardByPath(scope)));
        break;

      case 'validation':
        shards.push(...(await this.shardByTestSuite(scope)));
        break;

      case 'fixPack':
        shards.push(...(await this.shardByModule(scope)));
        break;

      case 'pattern':
        shards.push(...(await this.shardByLanguage(scope)));
        break;

      default:
        shards.push({ id: 'single', scope });
    }

    // Optimize shards for even distribution
    return this.optimizeShards(shards);
  }

  /**
   * Path-based sharding for assessment
   */
  async shardByPath(scope) {
    const shards = [];
    const paths = [
      'src/components',
      'src/services',
      'src/utils',
      'lib',
      'tests/unit',
      'tests/integration',
      'scripts',
      'docs',
    ];

    for (const pathPattern of paths) {
      if (scope === 'full' || scope.includes(pathPattern)) {
        shards.push({
          id: crypto.randomBytes(8).toString('hex'),
          type: 'path',
          pattern: pathPattern,
          priority: this.getPathPriority(pathPattern),
          estimatedSize: await this.estimatePathSize(pathPattern),
        });
      }
    }

    return shards;
  }

  /**
   * Module-based sharding for Fix Packs
   */
  async shardByModule(scope) {
    const shards = [];

    // Parse package.json for workspaces or detect modules
    try {
      const packageJson = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf8'),
      );

      if (packageJson.workspaces) {
        for (const workspace of packageJson.workspaces) {
          shards.push({
            id: crypto.randomBytes(8).toString('hex'),
            type: 'module',
            path: workspace,
            priority: 'normal',
            dependencies: [],
          });
        }
      }
    } catch (error) {
      // Fallback to directory-based sharding
      shards.push({
        id: crypto.randomBytes(8).toString('hex'),
        type: 'module',
        path: '.',
        priority: 'normal',
      });
    }

    return shards;
  }

  /**
   * Acquire path locks with TTL
   */
  async acquirePathLocks(paths, agentId) {
    const acquiredLocks = [];
    const timestamp = Date.now();

    for (const lockPath of paths) {
      const existingLock = this.state.pathLocks.get(lockPath);

      // Check if path is already locked
      if (existingLock && timestamp < existingLock.timestamp + existingLock.ttl) {
        // Path is locked, rollback acquired locks
        for (const acquired of acquiredLocks) {
          this.state.pathLocks.delete(acquired);
        }
        return null;
      }

      // Acquire lock
      this.state.pathLocks.set(lockPath, {
        agentId,
        timestamp,
        ttl: this.config.lockTTL,
      });

      acquiredLocks.push(lockPath);
    }

    return acquiredLocks;
  }

  /**
   * Release path locks
   */
  releasePathLocks(paths) {
    for (const lockPath of paths) {
      this.state.pathLocks.delete(lockPath);
    }
  }

  /**
   * Work-stealing algorithm for load balancing
   */
  async stealWork() {
    // Find overloaded agents
    const agentLoads = new Map();

    for (const [agentId, agent] of this.state.activeAgents) {
      const runtime = Date.now() - agent.startTime;
      agentLoads.set(agentId, runtime);
    }

    // Sort by load
    const sorted = Array.from(agentLoads.entries()).sort((a, b) => b[1] - a[1]);

    if (sorted.length < 2) return;

    const [overloadedId, overloadedTime] = sorted[0];
    const [underloadedId, underloadedTime] = sorted[sorted.length - 1];

    // Steal work if imbalance is significant (>30% difference)
    if (overloadedTime > underloadedTime * 1.3) {
      // Move queued task to underloaded agent
      const task = this.state.queuedTasks.shift();
      if (task) {
        task.preferredAgent = underloadedId;
        await this.scheduleTask(task);
      }
    }
  }

  /**
   * Budget management
   */
  checkBudget(repo, cost) {
    const repoUsed = this.state.budgetUsed.perRepo.get(repo) || 0;
    const globalUsed = this.state.budgetUsed.monthly;

    // Check repo budget
    if (repoUsed + cost > this.config.budgetPerRepo) {
      this.emit('budget_warning', {
        repo,
        used: repoUsed,
        limit: this.config.budgetPerRepo,
        requested: cost,
      });

      // Throttle at 95%
      if (repoUsed / this.config.budgetPerRepo > 0.95) {
        return false;
      }
    }

    // Check global budget
    if (globalUsed + cost > this.config.budgetGlobal) {
      this.emit('budget_critical', {
        used: globalUsed,
        limit: this.config.budgetGlobal,
        requested: cost,
      });

      return false;
    }

    // Update budget tracking
    this.state.budgetUsed.perRepo.set(repo, repoUsed + cost);
    this.state.budgetUsed.monthly += cost;

    return true;
  }

  /**
   * Estimate task cost based on operation type
   */
  estimateTaskCost(task) {
    const baseCost = this.config.costPerOperation[task.operation] || 1;
    const sizeFactor = this.estimateSizeFactor(task);
    const complexityFactor = task.complexity || 1;

    return baseCost * sizeFactor * complexityFactor;
  }

  /**
   * Queue task for later execution
   */
  queueTask(task, reason) {
    if (this.state.queuedTasks.length >= this.config.maxQueueSize) {
      throw new Error('Queue is full');
    }

    const queueEntry = {
      task,
      priority: task.priority || 'normal',
      timestamp: Date.now(),
      reason,
      retries: 0,
    };

    this.state.queuedTasks.push(queueEntry);
    this.state.queuedTasks.sort((a, b) => {
      // Priority-based sorting with aging
      const ageA = Date.now() - a.timestamp;
      const ageB = Date.now() - b.timestamp;
      const priorityWeight = { critical: 1000, high: 100, normal: 10, low: 1 };

      return priorityWeight[b.priority] + ageB / 1000 - (priorityWeight[a.priority] + ageA / 1000);
    });

    return {
      status: 'queued',
      queuePosition: this.state.queuedTasks.length,
      reason,
      estimatedWait: this.estimateWaitTime(),
    };
  }

  /**
   * Process queued tasks
   */
  async processQueue() {
    while (
      this.state.queuedTasks.length > 0 &&
      this.state.activeAgents.size < this.config.maxConcurrent
    ) {
      const entry = this.state.queuedTasks.shift();

      try {
        await this.scheduleTask(entry.task);
      } catch (error) {
        entry.retries++;
        if (entry.retries < 3) {
          this.state.queuedTasks.push(entry);
        } else {
          this.emit('task_failed', { task: entry.task, error });
        }
      }
    }
  }

  /**
   * Complete task and update metrics
   */
  async completeTask(agentId, result) {
    const agent = this.state.activeAgents.get(agentId);
    if (!agent) return;

    // Calculate metrics
    const runtime = Date.now() - agent.startTime;
    const actualCost = result.cost || agent.cost;

    // Update metrics
    this.state.metrics.tasksCompleted++;
    this.state.metrics.costPerFix.push(actualCost);

    // Release resources
    this.releasePathLocks(agent.paths || []);
    this.state.activeAgents.delete(agentId);
    this.state.idleAgents.add(agentId);

    // Process queue
    await this.processQueue();

    // Work stealing check
    if (this.state.activeAgents.size > 0) {
      await this.stealWork();
    }

    return {
      agentId,
      runtime,
      cost: actualCost,
      utilization: this.calculateUtilization(),
    };
  }

  /**
   * Calculate system utilization
   */
  calculateUtilization() {
    const active = this.state.activeAgents.size;
    const total = active + this.state.idleAgents.size;

    return total > 0 ? active / total : 0;
  }

  /**
   * Handle failures and circuit breaker
   */
  handleFailure(error) {
    this.circuitBreaker.failures++;

    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.isOpen = true;

      setTimeout(() => {
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failures = 0;
      }, this.circuitBreaker.resetTime);

      this.emit('circuit_breaker_open', {
        failures: this.circuitBreaker.failures,
        resetIn: this.circuitBreaker.resetTime,
      });
    }
  }

  /**
   * Background maintenance tasks
   */
  startMaintenanceTasks() {
    // Clean up expired locks
    setInterval(() => {
      const now = Date.now();
      for (const [path, lock] of this.state.pathLocks) {
        if (now > lock.timestamp + lock.ttl) {
          this.state.pathLocks.delete(path);
        }
      }
    }, 60000); // Every minute

    // Process queue
    setInterval(() => {
      this.processQueue();
    }, 5000); // Every 5 seconds

    // Calculate metrics
    setInterval(() => {
      this.state.metrics.utilizationRate = this.calculateUtilization();

      // Average cost per fix
      if (this.state.metrics.costPerFix.length > 0) {
        const sorted = [...this.state.metrics.costPerFix].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];

        this.emit('metrics_update', {
          utilization: this.state.metrics.utilizationRate,
          costMedian: median,
          costP95: p95,
          tasksCompleted: this.state.metrics.tasksCompleted,
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Helper methods
   */
  generateAgentId() {
    return crypto.randomBytes(8).toString('hex');
  }

  getRequiredPaths(task) {
    return task.paths || [];
  }

  getPathPriority(path) {
    if (path.includes('src')) return 'high';
    if (path.includes('test')) return 'normal';
    return 'low';
  }

  async estimatePathSize(pathPattern) {
    // Simplified size estimation
    if (pathPattern.includes('src')) return 'large';
    if (pathPattern.includes('test')) return 'medium';
    return 'small';
  }

  estimateSizeFactor(task) {
    const sizeMap = { small: 0.5, medium: 1, large: 2, xlarge: 3 };
    return sizeMap[task.size] || 1;
  }

  estimateWaitTime() {
    const queueLength = this.state.queuedTasks.length;
    const activeAgents = this.state.activeAgents.size;
    const avgTaskTime = 5 * 60 * 1000; // 5 minutes average

    return Math.ceil(
      (queueLength / Math.max(1, this.config.maxConcurrent - activeAgents)) * avgTaskTime,
    );
  }

  optimizeShards(shards) {
    // Balance shards for even distribution
    const targetShardCount = Math.min(shards.length, this.config.maxConcurrent);

    if (shards.length <= targetShardCount) {
      return shards;
    }

    // Merge small shards
    const optimized = [];
    let current = null;

    for (const shard of shards) {
      if (!current) {
        current = shard;
      } else if (current.estimatedSize === 'small' && shard.estimatedSize === 'small') {
        // Merge small shards
        current = {
          ...current,
          id: `${current.id}_${shard.id}`,
          pattern: `${current.pattern},${shard.pattern}`,
        };
      } else {
        optimized.push(current);
        current = shard;
      }
    }

    if (current) {
      optimized.push(current);
    }

    return optimized;
  }

  /**
   * Status reporting
   */
  getStatus() {
    return {
      active: this.state.activeAgents.size,
      idle: this.state.idleAgents.size,
      queued: this.state.queuedTasks.length,
      locks: this.state.pathLocks.size,
      utilization: this.calculateUtilization(),
      budget: {
        monthly: this.state.budgetUsed.monthly,
        perRepo: Object.fromEntries(this.state.budgetUsed.perRepo),
      },
      circuitBreaker: {
        status: this.circuitBreaker.isOpen ? 'open' : 'closed',
        failures: this.circuitBreaker.failures,
      },
      metrics: this.state.metrics,
    };
  }
}

// Export for use in other modules
module.exports = ConcurrencyManager;

// CLI interface
if (require.main === module) {
  const manager = new ConcurrencyManager();

  // Event listeners for monitoring
  manager.on('budget_warning', (data) => {
    console.warn('⚠️ Budget warning:', data);
  });

  manager.on('budget_critical', (data) => {
    console.error('🚨 Budget critical:', data);
  });

  manager.on('circuit_breaker_open', (data) => {
    console.error('🔒 Circuit breaker opened:', data);
  });

  manager.on('metrics_update', (data) => {
    console.log('📊 Metrics:', data);
  });

  // Example usage
  const exampleTask = {
    agentName: 'AUDITOR',
    operation: 'assessment',
    repo: 'linear-tdd-workflow',
    paths: ['src/components', 'src/services'],
    priority: 'high',
    complexity: 1.5,
  };

  manager
    .scheduleTask(exampleTask)
    .then((result) => console.log('Task scheduled:', result))
    .catch((error) => console.error('Scheduling failed:', error));

  // Status monitoring
  setInterval(() => {
    console.log('System status:', JSON.stringify(manager.getStatus(), null, 2));
  }, 10000);
}
