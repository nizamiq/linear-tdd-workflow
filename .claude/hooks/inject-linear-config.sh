#!/bin/bash
# Configuration Injection Hook - UserPromptSubmit
# Purpose: Inject Linear configuration from .env into agent context
# Runs: Before Claude processes user prompts
# Output: Configuration context that Claude Code injects automatically

# Read environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -E '^LINEAR_' | xargs)
fi

# Output configuration as context for agents
# Claude Code will inject this into the agent's context before processing
cat <<EOF

## 📋 Linear Configuration (Auto-Injected)

The following Linear.app configuration is available for this project:

**Team Configuration:**
- **Team ID**: ${LINEAR_TEAM_ID:-Not configured}
- **Project ID**: ${LINEAR_PROJECT_ID:-Not configured}

**Usage in Linear MCP Tools:**

When using Linear MCP tools, use these configuration values:

\`\`\`javascript
// Get team details
mcp__linear-server__get_team({ query: "${LINEAR_TEAM_ID}" })

// List issues for this team
mcp__linear-server__list_issues({ team: "${LINEAR_TEAM_ID}" })

// List projects
mcp__linear-server__list_projects({ team: "${LINEAR_TEAM_ID}" })

// Create issues
mcp__linear-server__create_issue({
  team: "${LINEAR_TEAM_ID}",
  title: "Issue title",
  description: "Issue description"
})
\`\`\`

**Important:** Always use these configuration values instead of hardcoding team IDs or project IDs.

EOF
