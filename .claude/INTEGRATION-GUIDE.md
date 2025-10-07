# 🔌 Integration Guide - Linear TDD Workflow

## Overview

This guide explains the different integration modes available for connecting the Linear TDD Workflow system with Linear.app and GitHub. Choose the approach that best fits your infrastructure and needs.

## Integration Modes

### 🟢 **Standard Mode** (Recommended for Claude Code)

**What:** Direct API integration using MCP servers and CLI tools
**Infrastructure:** None required - works immediately
**Best for:** 99% of users, especially Claude Code sessions

#### How it Works

- **Linear MCP Server** provides direct API access to Linear
- **GitHub CLI (`gh`)** handles GitHub operations
- **No webhooks, no servers, no infrastructure**

#### Available Operations

```javascript
// Direct Linear operations via MCP
mcp__linear-server__list_issues({ assignee: "me" })
mcp__linear-server__create_issue({ title: "Bug fix", team: "engineering" })
mcp__linear-server__update_issue({ id: "ISS-123", state: "Done" })

// Direct GitHub operations via CLI
gh pr create --title "Fix authentication"
gh issue list --assignee @me
gh pr review --approve
```

#### Setup

```bash
# Already configured in Claude Code!
# Just use the MCP tools directly
```

#### Benefits

✅ **Zero setup** - Works immediately
✅ **No infrastructure** - No servers needed
✅ **Real-time** - Direct API calls
✅ **Reliable** - No webhook failures
✅ **Simple debugging** - Synchronous operations

---

### 🟡 **Polling Mode** (For CI/CD)

**What:** Scheduled synchronization via cron or CI pipelines
**Infrastructure:** CI/CD system (GitHub Actions, Jenkins, etc.)
**Best for:** Automated workflows, scheduled updates

#### How it Works

- Scheduled jobs run `linear:sync` command
- Polls Linear API for changes at intervals
- Updates local cache and triggers actions

#### Setup Example (GitHub Actions)

```yaml
name: Linear Sync
on:
  schedule:
    - cron: '*/15 * * * *' # Every 15 minutes

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run linear:sync
```

#### Commands

```bash
# Manual sync
npm run linear:sync

# With options
npm run linear:sync -- --force --verbose
```

#### Benefits

✅ **Predictable** - Runs on schedule
✅ **CI-friendly** - Integrates with pipelines
✅ **Batch processing** - Efficient for bulk updates
✅ **Audit trail** - Clear execution logs

---

### 🔴 **Webhook Mode** (Advanced/Enterprise)

**What:** Real-time event-driven integration via webhooks
**Infrastructure:** Dedicated server, HTTPS endpoint, monitoring
**Best for:** Enterprise teams with DevOps resources

#### Requirements

- **Persistent server** (VPS, AWS EC2, etc.)
- **Public HTTPS endpoint** with SSL
- **Process manager** (PM2, systemd)
- **Monitoring** (Datadog, New Relic)
- **Security** (Firewall, rate limiting)

#### When to Consider

- Sub-second event response required
- Compliance audit requirements
- High-volume operations (>1000 events/hour)
- Dedicated infrastructure team

#### Documentation

See `.claude/advanced/webhooks/README.md` for setup instructions

⚠️ **WARNING:** Not recommended for Claude Code or typical development workflows

---

## Choosing the Right Mode

### Decision Tree

```
Do you use Claude Code?
├─ Yes → Use Standard Mode (MCP + CLI)
└─ No → Continue ↓

Do you have CI/CD pipelines?
├─ Yes → Consider Polling Mode
└─ No → Continue ↓

Do you have dedicated infrastructure?
├─ Yes → Can use Webhook Mode (but why?)
└─ No → Use Standard Mode
```

### Quick Comparison

| Feature        | Standard (MCP) | Polling      | Webhooks     |
| -------------- | -------------- | ------------ | ------------ |
| Setup Time     | 0 minutes      | 5 minutes    | 2+ hours     |
| Infrastructure | None           | CI/CD        | Server + SSL |
| Maintenance    | None           | Minimal      | Significant  |
| Response Time  | ~1 second      | 1-15 minutes | <1 second    |
| Reliability    | High           | High         | Medium       |
| Debugging      | Easy           | Easy         | Complex      |
| Claude Code    | ✅ Perfect     | ⚠️ Limited   | ❌ No        |

---

## Migration Paths

### From Webhooks → Standard Mode

Replace webhook handlers with direct MCP calls:

```javascript
// OLD: Webhook handler
webhookHandler.on('issue.created', async (issue) => {
  await processNewIssue(issue);
});

// NEW: Direct MCP call when needed
const issues =
  (await mcp__linear) -
  server__list_issues({
    createdAt: '-PT1H', // Last hour
  });
issues.forEach(processNewIssue);
```

### From Polling → Standard Mode

Replace scheduled syncs with on-demand operations:

```javascript
// OLD: Scheduled sync every 15 minutes
setInterval(syncLinear, 15 * 60 * 1000);

// NEW: Sync when actually needed
async function onUserAction() {
  const data = (await mcp__linear) - server__list_issues();
  // Process immediately
}
```

---

## Best Practices

### For Standard Mode (MCP)

1. **Cache strategically** - Don't over-fetch data
2. **Batch operations** - Group related API calls
3. **Handle rate limits** - Respect API quotas
4. **Use filters** - Request only needed data

### Example: Efficient Issue Fetching

```javascript
// Good: Fetch only what's needed
const activeIssues =
  (await mcp__linear) -
  server__list_issues({
    assignee: 'me',
    state: 'In Progress',
    limit: 10,
  });

// Bad: Fetching everything
const allIssues =
  (await mcp__linear) -
  server__list_issues({
    limit: 250, // Don't do this unless necessary
  });
```

---

## Common Patterns

### 1. Task Creation from Code Assessment

```javascript
// Using MCP directly in Claude Code
const issue =
  (await mcp__linear) -
  server__create_issue({
    title: 'Fix: Authentication vulnerability',
    team: 'engineering',
    labels: ['security', 'high-priority'],
    description: 'Found during code assessment...',
  });
```

### 2. PR Status Updates

```bash
# Using GitHub CLI
gh pr list --state open --json number,title,labels |
  jq '.[] | select(.labels[].name == "needs-review")'
```

### 3. Sprint Progress Tracking

```javascript
// Get current sprint issues
const sprint =
  (await mcp__linear) -
  server__list_issues({
    cycle: 'current',
    team: 'engineering',
  });
```

---

## Troubleshooting

### Standard Mode Issues

**"MCP server not available"**

- Ensure Claude Code has MCP servers configured
- Check `.claude/mcp.json` exists

**"Rate limit exceeded"**

- Implement exponential backoff
- Cache frequently accessed data
- Batch operations when possible

### Getting Help

1. Check integration mode: `npm run linear:status`
2. Test connection: `npm run linear:test-connection`
3. View logs: Check Claude Code output
4. Report issues: GitHub Issues

---

## Summary

- **Use Standard Mode (MCP)** for Claude Code and development
- **Consider Polling** for CI/CD automation
- **Avoid Webhooks** unless you have specific enterprise requirements

The MCP + CLI approach provides the best balance of simplicity, reliability, and functionality for the Linear TDD Workflow system.
