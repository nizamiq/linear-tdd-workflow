#!/bin/bash
# .claude/hooks/on-stop.sh
# Triggered when main Claude Code agent stops/completes
# Purpose: Summary reporting and workflow cleanup
#
# Environment variables provided by Claude Code:
# - CLAUDE_SESSION_ID: Unique session identifier
# - CLAUDE_SESSION_DURATION: Total session time in seconds
# - CLAUDE_EXIT_REASON: normal, timeout, error, user_interrupt

SESSION_ID="${CLAUDE_SESSION_ID:-unknown}"
DURATION="${CLAUDE_SESSION_DURATION:-0}"
EXIT_REASON="${CLAUDE_EXIT_REASON:-normal}"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${CYAN}         Linear TDD Workflow System - Session End${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Display session summary
echo -e "${BLUE}Session Summary:${NC}"
echo "  Session ID: $SESSION_ID"
echo "  Duration: ${DURATION}s ($(($DURATION / 60))m $(($DURATION % 60))s)"
echo "  Exit Reason: $EXIT_REASON"
echo ""

# Check for pending Linear tasks
if command -v gh &> /dev/null; then
  echo -e "${BLUE}Quick Status Check:${NC}"

  # Check for open PRs (requires gh CLI)
  PR_COUNT=$(gh pr list --json number --jq 'length' 2>/dev/null || echo "0")
  echo "  Open PRs: $PR_COUNT"

  # Check git status
  if [ -d .git ]; then
    UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
    if [ "$UNCOMMITTED" -gt 0 ]; then
      echo -e "  ${YELLOW}⚠ Uncommitted changes: $UNCOMMITTED files${NC}"
    else
      echo -e "  ${GREEN}✓ Working directory clean${NC}"
    fi

    CURRENT_BRANCH=$(git branch --show-current)
    echo "  Current branch: $CURRENT_BRANCH"
  fi
  echo ""
fi

# Check for pending tasks in enhancement queue
QUEUE_FILE=".claude/queue/enhancements.json"
if [ -f "$QUEUE_FILE" ] && command -v jq &> /dev/null; then
  PENDING_COUNT=$(jq '[.enhancements[] | select(.status != "DONE")] | length' "$QUEUE_FILE" 2>/dev/null || echo "0")
  if [ "$PENDING_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}Enhancement Queue:${NC}"
    echo "  Pending enhancements: $PENDING_COUNT"

    # List pending enhancements
    jq -r '.enhancements[] | select(.status != "DONE") | "  - [\(.status)] \(.slug) → Next: \(.next_agent // "TBD")"' "$QUEUE_FILE" 2>/dev/null
    echo ""
  fi
fi

# Provide next steps based on exit reason
case "$EXIT_REASON" in
  "normal")
    echo -e "${GREEN}✓ Session completed successfully${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  • Review completed work in Linear"
    echo "  • Check CI/CD pipeline status"
    echo "  • Continue with next task or feature"
    ;;

  "timeout")
    echo -e "${YELLOW}⚠ Session timed out${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  • Resume interrupted workflow"
    echo "  • Check for partial completions"
    echo "  • Review any uncommitted changes"
    ;;

  "error")
    echo -e "${RED}✗ Session ended with error${NC}"
    echo ""
    echo -e "${BLUE}Recovery steps:${NC}"
    echo "  • Review error logs above"
    echo "  • Check for failed agents or tasks"
    echo "  • Consider running: /recover"
    ;;

  "user_interrupt")
    echo -e "${YELLOW}⚠ Session interrupted by user${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  • Resume work when ready"
    echo "  • Check for any interrupted operations"
    ;;
esac

# Quick command reference
echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${CYAN}Quick Command Reference:${NC}"
echo "  /assess         - Run code quality assessment"
echo "  /fix TASK-ID    - Implement fix with TDD"
echo "  /status         - Check workflow and Linear status"
echo "  /cycle plan     - Plan next sprint"
echo "  /recover        - Auto-fix broken CI/CD pipeline"
echo "  /docs           - Validate and generate documentation"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Cleanup temporary files (optional)
# rm -f .claude/tmp/*.tmp 2>/dev/null

exit 0
