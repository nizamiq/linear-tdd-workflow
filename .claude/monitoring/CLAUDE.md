# 📊 Monitoring Directory - Claude Code Guide

## Purpose

This directory contains monitoring and observability tools that track system health, performance, and operational metrics. These tools help maintain system reliability and identify issues before they become problems.

## Available Monitors

### Production Monitor (`production-monitor.js`)

**Purpose:** Monitors production system health
**Tracks:**

- Agent performance metrics
- Pipeline success rates
- Error frequencies
- Resource utilization
- SLA compliance

**Usage:**

```bash
# Start monitoring
node .claude/monitoring/production-monitor.js

# With custom interval
MONITOR_INTERVAL=60000 node .claude/monitoring/production-monitor.js

# Dashboard mode
node .claude/monitoring/production-monitor.js --dashboard
```

## Metrics Collected

### System Metrics

- **CPU Usage**: Agent and journey execution
- **Memory**: Heap usage and garbage collection
- **I/O**: File operations and network requests
- **Queue Depth**: Pending tasks and operations

### Agent Metrics

```javascript
{
  "agent": "AUDITOR",
  "metrics": {
    "executionsTotal": 1234,
    "executionsSuccess": 1200,
    "executionsFailure": 34,
    "averageDuration": 8500,  // ms
    "p95Duration": 12000,      // ms
    "lastExecution": "2025-01-01T10:00:00Z"
  }
}
```

### Pipeline Metrics

- **Build Success Rate**: Percentage of successful builds
- **Test Pass Rate**: Test suite success percentage
- **Deployment Frequency**: Releases per day/week
- **MTTR**: Mean Time To Recovery
- **Lead Time**: Commit to production time

### Quality Metrics

- **Code Coverage**: Overall and diff coverage
- **Mutation Score**: Test effectiveness
- **Technical Debt**: Issues by severity
- **Fix Rate**: Issues resolved per sprint

## Monitoring Configuration

### Environment Variables

```bash
# Monitoring settings
MONITOR_ENABLED=true
MONITOR_INTERVAL=300000        # 5 minutes
MONITOR_RETENTION_DAYS=30      # Keep 30 days of metrics
ALERT_THRESHOLD_ERROR_RATE=0.05  # 5% error rate triggers alert
```

### Settings Configuration

```json
{
  "monitoring": {
    "enabled": true,
    "interval": 300000,
    "metrics": {
      "system": true,
      "agents": true,
      "pipeline": true,
      "quality": true
    },
    "alerts": {
      "errorRate": 0.05,
      "memoryUsage": 0.9,
      "pipelineFailure": 3,
      "slaBreachMinutes": 15
    },
    "export": {
      "format": "prometheus",
      "endpoint": "http://metrics-server:9090"
    }
  }
}
```

## Alert Rules

### Critical Alerts

Immediate notification required:

```javascript
// Error rate exceeds threshold
if (errorRate > 0.05) {
  alert('CRITICAL', 'Error rate exceeds 5%', {
    current: errorRate,
    threshold: 0.05,
  });
}

// Pipeline failures
if (consecutiveFailures >= 3) {
  alert('CRITICAL', 'Pipeline failing repeatedly', {
    failures: consecutiveFailures,
  });
}
```

### Warning Alerts

Attention needed:

```javascript
// Memory usage high
if (memoryUsage > 0.8) {
  alert('WARNING', 'Memory usage above 80%', {
    usage: memoryUsage,
  });
}

// SLA at risk
if (timeToResolution > sla * 0.9) {
  alert('WARNING', 'SLA at risk', {
    elapsed: timeToResolution,
    sla: sla,
  });
}
```

## Dashboard Views

### Real-time Dashboard

```bash
# Start dashboard
node .claude/monitoring/production-monitor.js --dashboard

# Custom refresh rate
node .claude/monitoring/production-monitor.js --dashboard --refresh 1000
```

Dashboard shows:

```
╔══════════════════════════════════════════════╗
║         System Health Dashboard              ║
╠══════════════════════════════════════════════╣
║ Agents      : ✅ Healthy (5/5 active)       ║
║ Pipeline    : ✅ Passing (last: 2m ago)     ║
║ Error Rate  : 0.02% (↓ 0.5%)                ║
║ Memory      : 67% (1.2GB / 1.8GB)           ║
║ Queue       : 3 tasks pending                ║
╠══════════════════════════════════════════════╣
║ Recent Executions:                           ║
║ • AUDITOR   : ✅ Completed (8.2s)           ║
║ • EXECUTOR  : 🔄 Running (2.1s)             ║
║ • GUARDIAN  : ✅ Completed (5.4s)           ║
╚══════════════════════════════════════════════╝
```

## Metrics Export

### Prometheus Format

```bash
# Export metrics for Prometheus
node .claude/monitoring/production-monitor.js --export prometheus

# Output format
linear_tdd_agent_executions_total{agent="AUDITOR"} 1234
linear_tdd_agent_success_rate{agent="AUDITOR"} 0.973
linear_tdd_pipeline_success_rate 0.95
linear_tdd_error_rate 0.02
```

### JSON Format

```bash
# Export as JSON
node .claude/monitoring/production-monitor.js --export json > metrics.json
```

## Health Checks

### System Health

```javascript
GET /health
Response: {
  "status": "healthy",
  "checks": {
    "agents": "passing",
    "database": "passing",
    "linear": "passing",
    "memory": "passing"
  },
  "uptime": 864000,
  "version": "1.3.0"
}
```

### Agent Health

```javascript
GET /health/agents
Response: {
  "AUDITOR": "healthy",
  "EXECUTOR": "healthy",
  "GUARDIAN": "degraded",  // High error rate
  "STRATEGIST": "healthy",
  "SCHOLAR": "healthy"
}
```

## Performance Profiling

### CPU Profiling

```bash
# Start with profiling
node --prof .claude/monitoring/production-monitor.js

# Process profile
node --prof-process isolate-*.log > profile.txt
```

### Memory Profiling

```bash
# Heap snapshot
node --inspect .claude/monitoring/production-monitor.js
# Open chrome://inspect and take heap snapshot
```

## Historical Analysis

### Trend Analysis

```javascript
// Weekly trend
const weeklyTrend = analyzeMetrics({
  period: '7d',
  metrics: ['errorRate', 'successRate', 'avgDuration'],
});

// Identify patterns
if (weeklyTrend.errorRate.increasing) {
  investigate('Error rate trending up');
}
```

### Anomaly Detection

```javascript
// Detect anomalies
const anomalies = detectAnomalies({
  metric: 'executionDuration',
  method: 'zscore',
  threshold: 3,
});

if (anomalies.length > 0) {
  alert('Anomaly detected', anomalies);
}
```

## Integration Points

### Linear Integration

- Create incidents for critical alerts
- Update dashboard metrics
- Track SLA compliance

### Slack/Discord Notifications

```javascript
// Send alerts
await sendAlert({
  channel: '#monitoring',
  severity: 'critical',
  message: 'Pipeline failure rate above threshold',
});
```

## Important Notes

- Metrics are stored locally in `.claude/metrics/`
- Retention period is 30 days by default
- Monitoring runs in separate process
- No PII is collected in metrics
- All metrics are aggregated

## Quick Reference

| Metric          | Command                      | Purpose           |
| --------------- | ---------------------------- | ----------------- |
| System health   | `node production-monitor.js` | Overall health    |
| Agent metrics   | `--metrics agents`           | Agent performance |
| Pipeline status | `--metrics pipeline`         | CI/CD health      |
| Dashboard       | `--dashboard`                | Real-time view    |
| Export          | `--export json`              | Export metrics    |
