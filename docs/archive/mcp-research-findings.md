# MCP Research Findings

## Key Configuration Concepts

### MCP Server Scopes
Claude Code supports three scopes for MCP server configuration:
- **Local scope**: Project-specific, highest precedence
- **Project scope**: Shared across project team
- **User scope**: Personal configuration, lowest precedence

### Configuration Commands
```bash
# Add MCP servers with different scopes
claude mcp add --scope local /path/to/server
claude mcp add --scope project /path/to/server  
claude mcp add --scope user /path/to/server

# Management commands
claude mcp list
claude mcp get <server-name>
claude mcp remove <server-name>
```

### Environment Variable Support
Claude Code supports environment variable expansion in `.mcp.json` files:
- `${VAR}` - Expands to environment variable value
- `${VAR:-default}` - Uses default if VAR not set

Expansion works in:
- `command` - Server executable path
- `args` - Command-line arguments  
- `env` - Environment variables
- `url` - For SSE/HTTP servers
- `headers` - For authentication

### Popular MCP Servers Found
- **Linear**: `claude mcp add --transport sse linear https://mcp.linear.app/sse`
- **Sentry**: `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp`
- **Socket**: `claude mcp add --transport http socket https://mcp.socket.dev/`
- **Notion**: `claude mcp add --transport http notion https://mcp.notion.com/mcp`
- **Asana**: `claude mcp add --transport sse asana https://mcp.asana.com/sse`

### Security Considerations
- Third-party MCP servers pose security risks
- Anthropic has not verified correctness/security of all servers
- Be careful with untrusted content and prompt injection risks

## Settings Configuration Structure

### Settings File Hierarchy
1. **User settings**: `~/.claude/settings.json` - applies to all projects
2. **Project settings**: `.claude/settings.json` - checked into source control, shared with team
3. **Local settings**: `.claude/settings.local.json` - not checked in, personal preferences
4. **Enterprise managed**: System-level policies that override user/project settings

### Key Settings for Agentic Workflow

#### Permissions Configuration
```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Read(./.zshrc)"
    ],
    "deny": [
      "Bash(curl:*)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

#### MCP Server Management
```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpJsonServers": ["memory", "github"],
  "disabledMcpJsonServers": ["filesystem"]
}
```

#### Environment Variables
```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp"
  }
}
```

#### Hooks Configuration
```json
{
  "hooks": {
    "PreToolUse": {
      "Bash": "echo 'Running command...'"
    }
  }
}
```

### Important Settings for Subagents
- `model`: Override default model for specific contexts
- `outputStyle`: Configure system prompt behavior
- `forceLoginMethod`: Restrict to specific authentication methods
- `cleanupPeriodDays`: How long to retain chat transcripts (default: 30 days)

## Practical .claude Directory Structure

### Basic Structure from Medium Article
```
.claude/
├── rules.md         # Coding standards and guardrails
├── context.md       # Project description and conventions
├── prompts.md       # Reusable prompt snippets
└── settings.json    # Optional structured preferences
```

### Example Content Templates

#### rules.md Template
```markdown
# Coding Rules
- Follow the project formatter. Do not change file style.
- Use logging instead of print. Include error context.
- Add type hints and docstrings for public functions.
- Keep functions small; prefer composition over long scripts.
- Write safe defaults. Handle timeouts and retries where external calls exist.

# Tests
- Provide a minimal test when adding new modules.
- Use fakes or fixtures; do not call real services.

# Security
- Never include secrets in code or examples.
- Use environment variables or placeholders like <API_KEY>.
```

#### context.md Template
```markdown
# Project Context
This is a service that ingests data from an external source, stores it, and exposes a simple API.

Main parts:
- Ingestion module (scheduled)
- Storage layer (database + object storage)
- API service
- Lightweight UI

Conventions:
- Config via environment variables
- Error handling with structured logs
- CI runs tests and lint on every PR

Dependencies:
- Runtime: Python 3.11
- Package: requests, pydantic
- Tools: Docker, Makefile for common tasks
```

#### prompts.md Template
```markdown
# Add a module
Create a new module that does X. Include:
- A clear, typed interface
- Error handling and logging
- A small unit test with a fake

# Improve performance
Review this function for bottlenecks. Propose changes.
Explain trade-offs in 3-5 bullet points.

# Write docs
Draft README instructions for running the project locally:
- Prereqs
- Setup
- Common commands
- How to run tests
```

## Subagent Configuration Structure

### Subagent File Template (YAML frontmatter + Markdown)
```yaml
---
name: subagent-name
description: Brief description of capabilities
tools: List of MCP tools used
---

Role definition and expertise...

## MCP Tool Integration
Tool descriptions and usage patterns...

## Communication Protocol
Inter-agent communication specifications...

## Implementation Workflow
Structured development phases...
```

### Key Subagent Characteristics
- **Production-ready**: Tested in real-world scenarios
- **Best practices compliant**: Following industry standards and patterns
- **MCP Tool integrated**: Leveraging Model Context Protocol tools
- **Continuously maintained**: Regular updates with new capabilities
- **Community-driven**: Open to contributions and improvements

### Quick Start Process
1. Browse categories to find the subagent you need
2. Copy the subagent definition
3. Use with Claude Code or integrate into your workflow
4. Customize based on your project requirements

### Subagent Storage Location
- Place subagent files in `.claude/agents/` within your project
- Claude Code automatically detects and loads the subagents
- Invoke them using the `/agents` command or direct references
