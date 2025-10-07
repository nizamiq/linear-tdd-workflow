#!/usr/bin/env node

/**
 * Performance Monitor - Real-time system performance tracking
 *
 * Evidence-based monitoring for Phase B.1:
 * - Track MCP response times and success rates
 * - Monitor agent utilization and throughput
 * - Detect performance degradation patterns
 * - Generate actionable alerts
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

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

class PerformanceMonitor extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      sampleInterval: 5000, // 5 second sampling
      reportInterval: 30000, // 30 second reports
      alertThresholds: {
        mcpResponseTime: 1000, // 1 second max
        mcpSuccessRate: 90, // 90% minimum
        agentUtilization: 95, // 95% max utilization
        queueDepth: 10, // 10 operations max
        throughputDrop: 50, // 50% throughput drop
      },
      retentionHours: 24, // Keep 24 hours of data
      ...options,
    };

    // Performance data storage
    this.metrics = {
      system: {
        startTime: null,
        totalRequests: 0,
        totalErrors: 0,
        uptime: 0,
      },
      mcp: {
        responseTimeSamples: [],
        successRateSamples: [],
        errorCounts: {},
        throughputSamples: [],
      },
      agents: {
        utilizationSamples: [],
        completionRateSamples: [],
        taskDurationSamples: [],
        queueDepthSamples: [],
      },
      alerts: [],
    };

    // Component references
    this.orchestrator = null;
    this.mcpQueueManager = null;
    this.agentPool = null;

    // Monitoring state
    this.isMonitoring = false;
    this.sampleTimer = null;
    this.reportTimer = null;
  }

  /**
   * Start monitoring with component references
   */
  start(orchestrator, mcpQueueManager, agentPool) {
    if (this.isMonitoring) {
      return;
    }

    this.orchestrator = orchestrator;
    this.mcpQueueManager = mcpQueueManager;
    this.agentPool = agentPool;

    this.metrics.system.startTime = Date.now();
    this.isMonitoring = true;

    // Start sampling
    this.sampleTimer = setInterval(() => {
      this.collectSample();
    }, this.config.sampleInterval);

    // Start reporting
    this.reportTimer = setInterval(() => {
      this.generateReport();
    }, this.config.reportInterval);

    this.emit('monitoring-started');
  }

  /**
   * Collect performance sample
   */
  async collectSample() {
    const timestamp = Date.now();

    try {
      // System metrics
      this.metrics.system.uptime = timestamp - this.metrics.system.startTime;

      // MCP metrics
      if (this.mcpQueueManager) {
        const mcpStatus = this.mcpQueueManager.getStatus();
        this.collectMcpMetrics(mcpStatus, timestamp);
      }

      // Agent metrics
      if (this.agentPool) {
        const agentStatus = this.agentPool.getStatus();
        this.collectAgentMetrics(agentStatus, timestamp);
      }

      this.evaluateAlerts(timestamp);

      // Clean old data
      this.cleanOldData(timestamp);
    } catch (error) {}
  }

  /**
   * Collect MCP-specific metrics
   */
  collectMcpMetrics(mcpStatus, timestamp) {
    const metrics = mcpStatus.metrics;

    // Response time
    if (metrics.averageResponseTime > 0) {
      this.metrics.mcp.responseTimeSamples.push({
        timestamp,
        value: metrics.averageResponseTime,
      });
    }

    // Success rate
    const successRate = parseFloat(metrics.successRate);
    if (!isNaN(successRate)) {
      this.metrics.mcp.successRateSamples.push({
        timestamp,
        value: successRate,
      });
    }

    const totalRequests = metrics.totalRequests;
    const uptimeMinutes = this.metrics.system.uptime / 60000;
    const throughput = uptimeMinutes > 0 ? totalRequests / uptimeMinutes : 0;

    this.metrics.mcp.throughputSamples.push({
      timestamp,
      value: throughput,
    });

    // Error tracking
    if (metrics.failedRequests > 0) {
      this.metrics.mcp.errorCounts[timestamp] = metrics.failedRequests;
    }
  }

  /**
   * Collect agent-specific metrics
   */
  collectAgentMetrics(agentStatus, timestamp) {
    const config = agentStatus.configuration;
    const current = agentStatus.currentState;
    const metrics = agentStatus.metrics;

    // Utilization
    const utilization = (current.activeAgents / config.maxConcurrentAgents) * 100;
    this.metrics.agents.utilizationSamples.push({
      timestamp,
      value: utilization,
    });

    // Queue depth
    this.metrics.agents.queueDepthSamples.push({
      timestamp,
      value: current.queuedTasks,
    });

    // Completion rate
    const totalTasks = metrics.totalTasks;
    const completedTasks = metrics.completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;

    this.metrics.agents.completionRateSamples.push({
      timestamp,
      value: completionRate,
    });

    // Average task duration
    if (metrics.averageTaskTime > 0) {
      this.metrics.agents.taskDurationSamples.push({
        timestamp,
        value: metrics.averageTaskTime,
      });
    }
  }

  /**
   * Evaluate alert conditions
   */
  evaluateAlerts(timestamp) {
    const alerts = [];

    // MCP response time alert
    const recentResponseTimes = this.getRecentSamples(this.metrics.mcp.responseTimeSamples, 5);
    if (recentResponseTimes.length > 0) {
      const avgResponseTime =
        recentResponseTimes.reduce((sum, sample) => sum + sample.value, 0) /
        recentResponseTimes.length;
      if (avgResponseTime > this.config.alertThresholds.mcpResponseTime) {
        alerts.push({
          type: 'mcp_response_time',
          severity: 'warning',
          message: `High MCP response time: ${avgResponseTime.toFixed(0)}ms (threshold: ${this.config.alertThresholds.mcpResponseTime}ms)`,
          value: avgResponseTime,
          threshold: this.config.alertThresholds.mcpResponseTime,
        });
      }
    }

    // MCP success rate alert
    const recentSuccessRates = this.getRecentSamples(this.metrics.mcp.successRateSamples, 5);
    if (recentSuccessRates.length > 0) {
      const avgSuccessRate =
        recentSuccessRates.reduce((sum, sample) => sum + sample.value, 0) /
        recentSuccessRates.length;
      if (avgSuccessRate < this.config.alertThresholds.mcpSuccessRate) {
        alerts.push({
          type: 'mcp_success_rate',
          severity: 'critical',
          message: `Low MCP success rate: ${avgSuccessRate.toFixed(1)}% (threshold: ${this.config.alertThresholds.mcpSuccessRate}%)`,
          value: avgSuccessRate,
          threshold: this.config.alertThresholds.mcpSuccessRate,
        });
      }
    }

    // Agent utilization alert
    const recentUtilization = this.getRecentSamples(this.metrics.agents.utilizationSamples, 5);
    if (recentUtilization.length > 0) {
      const avgUtilization =
        recentUtilization.reduce((sum, sample) => sum + sample.value, 0) / recentUtilization.length;
      if (avgUtilization > this.config.alertThresholds.agentUtilization) {
        alerts.push({
          type: 'agent_utilization',
          severity: 'warning',
          message: `High agent utilization: ${avgUtilization.toFixed(1)}% (threshold: ${this.config.alertThresholds.agentUtilization}%)`,
          value: avgUtilization,
          threshold: this.config.alertThresholds.agentUtilization,
        });
      }
    }

    // Queue depth alert
    const recentQueueDepth = this.getRecentSamples(this.metrics.agents.queueDepthSamples, 3);
    if (recentQueueDepth.length > 0) {
      const avgQueueDepth =
        recentQueueDepth.reduce((sum, sample) => sum + sample.value, 0) / recentQueueDepth.length;
      if (avgQueueDepth > this.config.alertThresholds.queueDepth) {
        alerts.push({
          type: 'queue_depth',
          severity: 'warning',
          message: `High queue depth: ${avgQueueDepth.toFixed(1)} tasks (threshold: ${this.config.alertThresholds.queueDepth})`,
          value: avgQueueDepth,
          threshold: this.config.alertThresholds.queueDepth,
        });
      }
    }

    // Process new alerts
    for (const alert of alerts) {
      this.processAlert(alert, timestamp);
    }
  }

  /**
   * Process and emit alerts
   */
  processAlert(alert, timestamp) {
    // Add timestamp to alert
    alert.timestamp = timestamp;

    const recentAlerts = this.metrics.alerts.filter(
      (a) => a.type === alert.type && timestamp - a.timestamp < 300000, // 5 minutes
    );

    if (recentAlerts.length === 0) {
      // Store alert
      this.metrics.alerts.push(alert);

      // Display alert
      const color = alert.severity === 'critical' ? colors.red : colors.yellow;

      // Emit alert event
      this.emit('alert', alert);
    }
  }

  /**
   * Get recent samples within a time window
   */
  getRecentSamples(samples, minutes) {
    const cutoff = Date.now() - minutes * 60000;
    return samples.filter((sample) => sample.timestamp > cutoff);
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const now = Date.now();
    const uptime = (now - this.metrics.system.startTime) / 1000;

    // System overview

    // MCP performance
    this.reportMcpPerformance();

    // Agent performance
    this.reportAgentPerformance();

    // Recent alerts
    this.reportRecentAlerts();
  }

  /**
   * Report MCP performance metrics
   */
  reportMcpPerformance() {
    // Response time
    const recentResponseTimes = this.getRecentSamples(this.metrics.mcp.responseTimeSamples, 10);
    if (recentResponseTimes.length > 0) {
      const avgResponseTime =
        recentResponseTimes.reduce((sum, s) => sum + s.value, 0) / recentResponseTimes.length;
      const color =
        avgResponseTime > this.config.alertThresholds.mcpResponseTime
          ? colors.yellow
          : colors.white;
    }

    // Success rate
    const recentSuccessRates = this.getRecentSamples(this.metrics.mcp.successRateSamples, 10);
    if (recentSuccessRates.length > 0) {
      const avgSuccessRate =
        recentSuccessRates.reduce((sum, s) => sum + s.value, 0) / recentSuccessRates.length;
      const color =
        avgSuccessRate < this.config.alertThresholds.mcpSuccessRate ? colors.yellow : colors.white;
    }

    // Throughput
    const recentThroughput = this.getRecentSamples(this.metrics.mcp.throughputSamples, 10);
    if (recentThroughput.length > 0) {
      const avgThroughput =
        recentThroughput.reduce((sum, s) => sum + s.value, 0) / recentThroughput.length;
    }
  }

  /**
   * Report agent performance metrics
   */
  reportAgentPerformance() {
    // Utilization
    const recentUtilization = this.getRecentSamples(this.metrics.agents.utilizationSamples, 10);
    if (recentUtilization.length > 0) {
      const avgUtilization =
        recentUtilization.reduce((sum, s) => sum + s.value, 0) / recentUtilization.length;
      const color =
        avgUtilization > this.config.alertThresholds.agentUtilization
          ? colors.yellow
          : colors.white;
    }

    // Queue depth
    const recentQueueDepth = this.getRecentSamples(this.metrics.agents.queueDepthSamples, 10);
    if (recentQueueDepth.length > 0) {
      const avgQueueDepth =
        recentQueueDepth.reduce((sum, s) => sum + s.value, 0) / recentQueueDepth.length;
      const color =
        avgQueueDepth > this.config.alertThresholds.queueDepth ? colors.yellow : colors.white;
    }

    // Completion rate
    const recentCompletionRate = this.getRecentSamples(
      this.metrics.agents.completionRateSamples,
      10,
    );
    if (recentCompletionRate.length > 0) {
      const avgCompletionRate =
        recentCompletionRate.reduce((sum, s) => sum + s.value, 0) / recentCompletionRate.length;
    }

    // Task duration
    const recentTaskDuration = this.getRecentSamples(this.metrics.agents.taskDurationSamples, 10);
    if (recentTaskDuration.length > 0) {
      const avgTaskDuration =
        recentTaskDuration.reduce((sum, s) => sum + s.value, 0) / recentTaskDuration.length;
    }
  }

  /**
   * Report recent alerts
   */
  reportRecentAlerts() {
    const recentAlerts = this.metrics.alerts.filter(
      (alert) => Date.now() - alert.timestamp < 600000, // Last 10 minutes
    );

    if (recentAlerts.length > 0) {
      for (const alert of recentAlerts.slice(-5)) {
        // Show last 5
        const color = alert.severity === 'critical' ? colors.red : colors.yellow;
        const timeAgo = Math.round((Date.now() - alert.timestamp) / 60000);
      }
    }
  }

  /**
   * Clean old data to prevent memory issues
   */
  cleanOldData(timestamp) {
    const cutoff = timestamp - this.config.retentionHours * 60 * 60 * 1000;

    // Clean MCP data
    this.metrics.mcp.responseTimeSamples = this.metrics.mcp.responseTimeSamples.filter(
      (s) => s.timestamp > cutoff,
    );
    this.metrics.mcp.successRateSamples = this.metrics.mcp.successRateSamples.filter(
      (s) => s.timestamp > cutoff,
    );
    this.metrics.mcp.throughputSamples = this.metrics.mcp.throughputSamples.filter(
      (s) => s.timestamp > cutoff,
    );

    // Clean agent data
    this.metrics.agents.utilizationSamples = this.metrics.agents.utilizationSamples.filter(
      (s) => s.timestamp > cutoff,
    );
    this.metrics.agents.completionRateSamples = this.metrics.agents.completionRateSamples.filter(
      (s) => s.timestamp > cutoff,
    );
    this.metrics.agents.taskDurationSamples = this.metrics.agents.taskDurationSamples.filter(
      (s) => s.timestamp > cutoff,
    );
    this.metrics.agents.queueDepthSamples = this.metrics.agents.queueDepthSamples.filter(
      (s) => s.timestamp > cutoff,
    );

    // Clean alerts
    this.metrics.alerts = this.metrics.alerts.filter((a) => a.timestamp > cutoff);

    // Clean MCP error counts
    for (const [ts, count] of Object.entries(this.metrics.mcp.errorCounts)) {
      if (parseInt(ts) < cutoff) {
        delete this.metrics.mcp.errorCounts[ts];
      }
    }
  }

  /**
   * Get comprehensive metrics summary
   */
  getMetricsSummary() {
    const now = Date.now();

    return {
      timestamp: now,
      uptime: now - this.metrics.system.startTime,
      mcp: {
        averageResponseTime: this.calculateAverage(this.metrics.mcp.responseTimeSamples, 10),
        averageSuccessRate: this.calculateAverage(this.metrics.mcp.successRateSamples, 10),
        currentThroughput: this.calculateAverage(this.metrics.mcp.throughputSamples, 5),
      },
      agents: {
        averageUtilization: this.calculateAverage(this.metrics.agents.utilizationSamples, 10),
        averageQueueDepth: this.calculateAverage(this.metrics.agents.queueDepthSamples, 10),
        averageCompletionRate: this.calculateAverage(this.metrics.agents.completionRateSamples, 10),
        averageTaskDuration: this.calculateAverage(this.metrics.agents.taskDurationSamples, 10),
      },
      recentAlerts: this.metrics.alerts.filter((a) => now - a.timestamp < 600000),
    };
  }

  /**
   * Calculate average for recent samples
   */
  calculateAverage(samples, minutes) {
    const recentSamples = this.getRecentSamples(samples, minutes);
    if (recentSamples.length === 0) return 0;
    return recentSamples.reduce((sum, s) => sum + s.value, 0) / recentSamples.length;
  }

  /**
   * Export metrics to file
   */
  async exportMetrics(filePath) {
    try {
      const summary = this.getMetricsSummary();
      await fs.writeFile(filePath, JSON.stringify(summary, null, 2));
    } catch (error) {}
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.sampleTimer) {
      clearInterval(this.sampleTimer);
      this.sampleTimer = null;
    }

    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }

    this.emit('monitoring-stopped');
  }
}

module.exports = PerformanceMonitor;
