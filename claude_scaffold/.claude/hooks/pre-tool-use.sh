#!/usr/bin/env bash
# Pre-tool use hook triggered before tool execution

# Log the command about to be executed by Claude Code.
if [ -n "$CLAUDE_COMMAND" ]; then
  echo "[WORKFLOW] Executing: $CLAUDE_COMMAND"
else
  echo "[WORKFLOW] Executing a tool"
fi
