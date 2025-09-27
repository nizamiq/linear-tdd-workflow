# MCP Tools

This document describes the MCP (Model Context Protocol) servers configured for this project and how to connect to them.  The MCP configuration is stored in `.claude/.mcp.json`.  Each server facilitates communication between the agents and external services.

## MCP Servers

### Linear
- **Type:** SSE (Server‑Sent Events) server
- **URL:** `${LINEAR_MCP_URL:-https://mcp.linear.app/sse}`
- **Authentication:** `Authorization: Bearer ${LINEAR_API_KEY}`
- **Allowed Agents:** strategist, auditor
- **Permissions:** read, write, create, update

The Linear server enables agents to create and update tasks, track progress, and receive task events in real‑time.

### GitHub
- **Type:** HTTP server
- **URL:** `${GITHUB_MCP_URL:-https://mcp.github.com/api}`
- **Authentication:** `Authorization: token ${GITHUB_TOKEN}`
- **Allowed Agents:** executor, guardian, strategist
- **Permissions:** read, write, update; cannot create new resources

This server provides access to version control operations and CI/CD status via GitHub.

### Memory
- **Type:** Local (persistent)
- **Command:** `manus-mcp-cli memory --persist`
- **Allowed Agents:** scholar, strategist
- **Permissions:** read, write, create, update

The memory server stores patterns, knowledge, and other data used for learning and coordination.

### Filesystem
- **Type:** Local (safe mode)
- **Command:** `manus-mcp-cli filesystem --safe-mode`
- **Allowed Agents:** executor, auditor
- **Permissions:** read, write, create; update disabled for safety

This server allows agents to perform safe file operations within the repository.

### Sentry
- **Type:** HTTP
- **URL:** `${SENTRY_MCP_URL:-https://mcp.sentry.dev/mcp}`
- **Authentication:** `Authorization: Bearer ${SENTRY_AUTH_TOKEN}`
- **Allowed Agents:** guardian
- **Permissions:** read only

The Sentry server provides error monitoring and alerting for CI/CD and runtime issues.

## Environment Variables

The configuration uses environment variable expansion.  For example, `${LINEAR_MCP_URL:-https://mcp.linear.app/sse}` means that if the environment variable `LINEAR_MCP_URL` is set, it will be used; otherwise the default URL is used.  Ensure the following variables are set in your environment or `.env` file before running agents:

- `LINEAR_API_KEY`
- `GITHUB_TOKEN`
- `SENTRY_AUTH_TOKEN`
- Optional: `LINEAR_MCP_URL`, `GITHUB_MCP_URL`, `SENTRY_MCP_URL`

You can test MCP server connectivity using the CLI:

```
# List configured servers
claude mcp list

# Test a specific server
claude mcp get linear
```
