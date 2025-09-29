# ⚠️ ADVANCED: Webhook Integration

## IMPORTANT: Infrastructure Required

**This webhook system requires external infrastructure that is NOT available in standard Claude Code sessions.**

### Why This is Advanced/Optional

Claude Code provides **better alternatives** that work immediately:
- **Linear MCP Server** - Direct API access to Linear without webhooks
- **GitHub CLI (`gh`)** - Direct GitHub operations without webhooks
- **No infrastructure needed** - Works in ephemeral Claude Code sessions

### Infrastructure Requirements

To use webhooks, you need:

1. **Persistent Server Infrastructure**
   - Dedicated server or cloud function
   - Node.js runtime environment
   - Process manager (PM2, systemd, etc.)
   - 24/7 uptime monitoring

2. **Public HTTPS Endpoint**
   - Domain name with SSL certificate
   - Public IP address or cloud provider
   - Firewall configuration for webhook ports
   - Reverse proxy (nginx, Caddy, etc.)

3. **Security Configuration**
   - Webhook secret management
   - IP whitelisting (optional)
   - Rate limiting
   - DDoS protection

4. **Development Tools**
   - ngrok or similar for local testing
   - Webhook debugging tools
   - Log aggregation system

### When to Use Webhooks

Only consider webhooks if you:
- Have dedicated DevOps resources
- Need millisecond-level event response times
- Have compliance requirements for audit trails
- Run a persistent production environment

### Recommended Approach for Claude Code

Use the built-in MCP and CLI tools instead:

```javascript
// Instead of webhooks, use Linear MCP directly:
await mcp__linear-server__list_issues({
  assignee: "me",
  state: "In Progress"
});

// Instead of GitHub webhooks, use gh CLI:
execSync('gh pr list --state open');
```

### Setup Instructions (If You Must)

#### 1. Deploy Webhook Server

```bash
# On your server (not in Claude Code)
npm install
npm install -g pm2
pm2 start .claude/advanced/webhooks/webhook-server.js
```

#### 2. Configure Linear Webhook

1. Go to Linear Settings → API → Webhooks
2. Add webhook URL: `https://your-domain.com/webhooks/linear`
3. Copy webhook secret to server environment

#### 3. Set Environment Variables

```bash
# On your server
export LINEAR_WEBHOOK_SECRET="your-secret-here"
export WEBHOOK_PORT=3000
export NODE_ENV=production
```

#### 4. Configure Reverse Proxy

```nginx
# nginx example
server {
    listen 443 ssl;
    server_name your-domain.com;

    location /webhooks {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

### Local Development Testing

For local testing only:

```bash
# Terminal 1: Start webhook server
node .claude/advanced/webhooks/webhook-server.js

# Terminal 2: Create tunnel
ngrok http 3000

# Use ngrok URL in Linear webhook settings
```

### Migration Path

To migrate from webhooks to MCP:

1. **Webhook Event** → **MCP Equivalent**
   - `Issue.create` → `mcp__linear-server__create_issue`
   - `Issue.update` → `mcp__linear-server__update_issue`
   - `Comment.create` → `mcp__linear-server__create_comment`

2. **Replace Event Handlers**
   ```javascript
   // Old: Webhook handler
   onIssueCreated: (issue) => { /* ... */ }

   // New: Direct MCP call
   await mcp__linear-server__get_issue({ id: issueId });
   ```

### Support

Webhook support is limited as this is an advanced feature. For standard workflows, use the MCP and CLI tools documented in the main guide.

### Files in This Directory

- `webhook-server.js` - Express server for receiving webhooks
- `linear-webhook-handler.js` - Linear event processing logic
- `CLAUDE.md` - Original webhook documentation

---

**Remember:** For 99% of use cases, the Linear MCP Server and GitHub CLI provide a simpler, more reliable solution that works immediately in Claude Code.