# Agent Permissions

This document summarizes the permissions matrix for each agent across the configured MCP servers and outlines the high‑level responsibilities of every agent.  Use this as a reference when reviewing or modifying agent capabilities.

## MCP Server Permissions Matrix

| MCP Server | AUDITOR | EXECUTOR | GUARDIAN | STRATEGIST | SCHOLAR |
|-----------|------|--------|--------|-----------|--------|
| **Linear**     | ✅ R/W | ✅ R/W   | ✅ R/W    | ✅ R/W      | ✅ R    |
| **GitHub**     | ❌    | ✅ R/W   | ✅ R/W    | ✅ R/W      | ❌    |
| **Memory**     | ✅ R/W | ❌      | ❌       | ✅ R/W      | ✅ R/W |
| **Filesystem** | ✅ R    | ✅ R/W  | ✅ R     | ✅ R        | ✅ R    |
| **Sentry**     | ❌    | ❌      | ✅ R     | ✅ R        | ❌    |

**Legend:** ✅ **R/W** = read and write access; ✅ **R** = read only; ❌ = no access.

The above matrix is derived from the MCP server configurations in `.claude/.mcp.json`.  Agents should adhere to these permissions when interacting with servers.

## Agent Roles Summary

### AUDITOR
- Performs continuous code quality scans
- Generates prioritized Linear tasks for improvement
- Uses filesystem and memory servers for code analysis and pattern storage

### EXECUTOR
- Executes tasks with atomic commits and comprehensive tests
- Integrates with GitHub for version control operations
- Updates task statuses in Linear

### GUARDIAN
- Monitors CI/CD pipelines and remediates failures
- Reads pipeline configurations from the repository
- Uses Sentry for error monitoring and Linear for reporting

### STRATEGIST
- Orchestrates all agent activities and manages the project board
- Writes reports and documentation
- Coordinates with Linear, GitHub, and memory servers

### SCHOLAR
- Learns from completed tasks and extracts patterns
- Stores knowledge in memory and patterns directories
- Generates insights for continuous improvement

Refer to the individual agent definition files under `.claude/agents/` for detailed responsibilities and checklists.
