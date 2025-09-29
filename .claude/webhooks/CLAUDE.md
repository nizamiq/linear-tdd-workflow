# 🔔 Webhooks Directory - Claude Code Guide

## Purpose

This directory contains webhook handlers that receive and process events from external services, enabling real-time synchronization and automated responses to changes in Linear, GitHub, and other integrated systems.

## Available Webhooks

### Linear Webhook Handler (`linear-webhook-handler.js`)
**Purpose:** Processes Linear.app webhook events
**Handles:**
- Issue created/updated/deleted
- Comment added
- Status changed
- Sprint events
- Project updates

**Event Processing:**
```javascript
// Webhook receives Linear event
{
  "action": "create",
  "type": "Issue",
  "data": {
    "id": "issue-id",
    "title": "Fix authentication bug",
    "state": "Todo"
  }
}
```

### Webhook Server (`webhook-server.js`)
**Purpose:** HTTP server for receiving webhooks
**Features:**
- Express server on configurable port
- Signature validation
- Event routing
- Error handling
- Retry logic

**Starting the Server:**
```bash
# Start webhook server
node .claude/webhooks/webhook-server.js

# With custom port
PORT=3001 node .claude/webhooks/webhook-server.js

# Debug mode
DEBUG=true node .claude/webhooks/webhook-server.js
```

## Webhook Event Handling

### Linear Events

#### Issue Events
```javascript
// Issue Created
onIssueCreated: (issue) => {
  // Notify EXECUTOR if assigned
  // Update local tracking
  // Start timer for SLA
}

// Issue Updated
onIssueUpdated: (issue, changes) => {
  // Sync status changes
  // Update assignments
  // Log progress
}

// Issue Completed
onIssueCompleted: (issue) => {
  // Trigger validation
  // Update metrics
  // Learn patterns
}
```

#### Comment Events
```javascript
// Comment Added
onCommentAdded: (comment) => {
  // Parse for commands (@execute, @validate)
  // Notify mentioned agents
  // Update context
}
```

## Webhook Security

### Signature Validation
All webhooks must be validated:
```javascript
function validateWebhookSignature(payload, signature) {
  const expectedSig = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}
```

### IP Whitelisting (Optional)
Configure allowed IPs in settings:
```json
{
  "webhooks": {
    "allowedIPs": ["192.168.1.0/24", "10.0.0.0/8"]
  }
}
```

## Configuration

### Environment Variables
```bash
# Required for webhooks
LINEAR_WEBHOOK_SECRET=your-webhook-secret
WEBHOOK_PORT=3000

# Optional
WEBHOOK_PATH=/webhooks
WEBHOOK_TIMEOUT=30000
```

### Linear Webhook Setup
1. Go to Linear Settings → API → Webhooks
2. Add webhook URL: `https://your-domain/webhooks/linear`
3. Select events to receive
4. Copy webhook secret to `.env`

### Settings
```json
{
  "webhooks": {
    "enabled": true,
    "port": 3000,
    "retryAttempts": 3,
    "retryDelay": 1000,
    "eventTypes": [
      "Issue.create",
      "Issue.update",
      "Comment.create"
    ]
  }
}
```

## Event-Driven Actions

### Automatic Responses

| Event | Trigger | Action |
|-------|---------|--------|
| Issue created with "bug" label | Immediate | AUDITOR scans related code |
| Issue assigned to EXECUTOR | On assignment | Start fix implementation |
| PR linked to issue | On link | VALIDATOR reviews code |
| Issue moved to "Done" | Status change | Trigger validation |
| Comment mentions @fix | On comment | EXECUTOR implements fix |

### Agent Notifications
Webhooks notify agents based on patterns:
```javascript
// Route to appropriate agent
if (issue.labels.includes('clean-code')) {
  notifyAgent('AUDITOR', issue);
} else if (issue.labels.includes('incident')) {
  notifyAgent('GUARDIAN', issue);
}
```

## Running Webhook Server

### Development
```bash
# Run with nodemon for auto-reload
npx nodemon .claude/webhooks/webhook-server.js

# With ngrok for local testing
ngrok http 3000
# Use ngrok URL in Linear webhook settings
```

### Production
```bash
# Run with PM2
pm2 start .claude/webhooks/webhook-server.js --name webhook-server

# Or as system service
systemctl start linear-webhooks
```

## Error Handling

### Retry Logic
Failed webhook processing is retried:
```javascript
async function processWithRetry(event, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await processEvent(event);
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await delay(1000 * attempt); // Exponential backoff
    }
  }
}
```

### Dead Letter Queue
Failed events are stored for manual processing:
```javascript
// Store failed events
await storeFailedEvent({
  event,
  error: error.message,
  attempts: maxAttempts,
  timestamp: Date.now()
});
```

## Testing Webhooks

### Local Testing
```bash
# Send test webhook
curl -X POST http://localhost:3000/webhooks/linear \
  -H "Content-Type: application/json" \
  -H "Linear-Signature: test-signature" \
  -d '{"action":"create","type":"Issue","data":{}}'
```

### Webhook Tester
```bash
# Use webhook testing tool
node .claude/webhooks/test-webhook.js --event issue.created
```

## Monitoring

### Health Check
```bash
# Check webhook server health
curl http://localhost:3000/health
```

### Metrics
Webhook server tracks:
- Events received
- Processing time
- Success/failure rate
- Agent notifications sent

## Important Notes

- Webhooks must respond within 30 seconds
- Failed webhooks are retried 3 times
- Signature validation is mandatory
- Events are processed asynchronously
- Duplicate events are ignored

## Quick Reference

| Webhook | Endpoint | Events |
|---------|----------|--------|
| Linear | /webhooks/linear | Issues, Comments |
| GitHub | /webhooks/github | PRs, Commits |
| Custom | /webhooks/custom | User-defined |

## Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is accessible
2. Verify signature secret matches
3. Check firewall/proxy settings
4. Review Linear webhook logs

### Processing Errors
```bash
# Check webhook logs
tail -f .claude/logs/webhooks.log

# Debug mode
DEBUG=true node .claude/webhooks/webhook-server.js
```