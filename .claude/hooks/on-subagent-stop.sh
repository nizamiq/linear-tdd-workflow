#!/bin/bash
# .claude/hooks/on-subagent-stop.sh
# Triggered when a subagent completes execution
# Purpose: Suggest next workflow step for automation
#
# Claude Code provides these environment variables:
# - CLAUDE_AGENT_NAME: Name of the completed agent
# - CLAUDE_AGENT_STATUS: success, failure, timeout, error
# - CLAUDE_AGENT_DURATION: Execution time in seconds
# - CLAUDE_AGENT_OUTPUT: Summary of agent output (truncated)

AGENT_NAME="${CLAUDE_AGENT_NAME:-$1}"
STATUS="${CLAUDE_AGENT_STATUS:-$2}"
DURATION="${CLAUDE_AGENT_DURATION:-0}"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to update enhancement queue
update_queue() {
  local slug="$1"
  local new_status="$2"
  local agent="$3"

  QUEUE_FILE=".claude/queue/enhancements.json"

  if [ -f "$QUEUE_FILE" ]; then
    # Update queue using jq if available
    if command -v jq &> /dev/null; then
      jq --arg slug "$slug" --arg status "$new_status" --arg agent "$agent" \
         '.enhancements[$slug].status = $status | .enhancements[$slug].agent_history += [$agent]' \
         "$QUEUE_FILE" > "$QUEUE_FILE.tmp" && mv "$QUEUE_FILE.tmp" "$QUEUE_FILE"
    fi
  fi
}

# Function to suggest Linear task creation via STRATEGIST
# This echoes instructions for the user - actual creation happens when user invokes STRATEGIST
suggest_linear_tasks() {
  local assessment_file="$1"

  if [ ! -f "$assessment_file" ]; then
    return
  fi

  # Count tasks to be created
  TASK_COUNT=$(jq -r '.linear_tasks | length' "$assessment_file" 2>/dev/null || echo "0")

  if [ "$TASK_COUNT" -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}📋 Linear Integration:${NC}"
    echo "  Found $TASK_COUNT tasks to create in Linear"
    echo ""
    echo -e "${BLUE}Quick command:${NC}"
    echo "  /linear"
    echo ""
    echo -e "${BLUE}Or with file:${NC}"
    echo "  /linear $assessment_file"
  fi
}

# Main workflow suggestion logic
case "$AGENT_NAME" in
  "AUDITOR")
    if [ "$STATUS" = "success" ]; then
      echo -e "${GREEN}✓ Assessment complete${NC} (${DURATION}s)"
      echo ""

      # Find latest assessment file
      LATEST_ASSESSMENT=$(find proposals -name "issues-*.json" -type f 2>/dev/null | sort -r | head -1)

      if [ -n "$LATEST_ASSESSMENT" ]; then
        echo -e "${BLUE}Assessment report: $LATEST_ASSESSMENT${NC}"

        # Suggest Linear task creation
        suggest_linear_tasks "$LATEST_ASSESSMENT"
      fi

      echo ""
      echo -e "${RED}⚠️  TDD REQUIREMENT (NON-NEGOTIABLE):${NC}"
      echo "  When implementing fixes, you MUST follow strict TDD:"
      echo "    ${GREEN}1. [RED]${NC} Write failing test FIRST"
      echo "    ${GREEN}2. [GREEN]${NC} Minimal code to pass"
      echo "    ${GREEN}3. [REFACTOR]${NC} Improve design"
      echo ""
      echo "  Coverage gates: ≥80% diff, ≥30% mutation"
      echo "  The /fix command enforces this automatically"
      echo ""
      echo -e "${BLUE}Next steps:${NC}"
      echo "  1. Create Linear tasks: /linear"
      echo "  2. Implement with TDD: /fix CLEAN-XXX"
      echo ""
      echo -e "${YELLOW}Quick start:${NC}"
      echo "  /linear          # Create tasks"
      echo "  /fix CLEAN-123   # Implement with TDD enforcement"
    elif [ "$STATUS" = "failure" ]; then
      echo -e "${RED}✗ Assessment failed${NC}"
      echo "  Check logs and retry with reduced scope"
    fi
    ;;

  "EXECUTOR")
    if [ "$STATUS" = "success" ]; then
      echo -e "${GREEN}✓ Fix implemented${NC} (${DURATION}s)"
      echo ""
      echo -e "${BLUE}Next steps:${NC}"
      echo "  1. Review PR created by EXECUTOR"
      echo "  2. Run code review: /invoke CODE-REVIEWER:review PR-XXX"
      echo "  3. Or validate quality: /invoke VALIDATOR:check"
      echo ""
      echo -e "${YELLOW}Suggested command:${NC}"
      echo "  /invoke CODE-REVIEWER:review <PR-URL>"

      # Update queue status
      update_queue "current-fix" "READY_FOR_REVIEW" "EXECUTOR"
    elif [ "$STATUS" = "failure" ]; then
      echo -e "${RED}✗ Fix implementation failed${NC}"
      echo "  Check test results and retry with TDD cycle"
    fi
    ;;

  "CODE-REVIEWER")
    if [ "$STATUS" = "success" ]; then
      echo -e "${GREEN}✓ Code review complete${NC} (${DURATION}s)"
      echo ""
      echo -e "${BLUE}Next steps:${NC}"
      echo "  1. Address review comments if any"
      echo "  2. Run final validation: /invoke VALIDATOR:check"
      echo "  3. Or merge PR if approved"
      echo ""
      echo -e "${YELLOW}Suggested command:${NC}"
      echo "  gh pr merge <PR-NUMBER> --squash"

      update_queue "current-fix" "READY_FOR_MERGE" "CODE-REVIEWER"
    fi
    ;;

  "GUARDIAN")
    if [ "$STATUS" = "success" ]; then
      echo -e "${GREEN}✓ Pipeline recovered${NC} (${DURATION}s)"
      echo ""
      echo -e "${BLUE}Next steps:${NC}"
      echo "  1. Verify CI/CD pipeline is green"
      echo "  2. Check INCIDENT-XXX task in Linear"
      echo "  3. Resume normal development workflow"
    elif [ "$STATUS" = "failure" ]; then
      echo -e "${RED}✗ Pipeline recovery failed${NC}"
      echo -e "${YELLOW}Manual intervention required${NC}"
      echo "  Check INCIDENT-XXX task for details"
    fi
    ;;

  "PLANNER")
    if [ "$STATUS" = "success" ]; then
      echo -e "${GREEN}✓ Sprint planning complete${NC} (${DURATION}s)"
      echo ""
      echo -e "${BLUE}Next steps:${NC}"
      echo "  1. Review sprint plan in Linear"
      echo "  2. Start with highest priority tasks"
      echo "  3. Run assessment: /assess"
      echo ""
      echo -e "${YELLOW}Suggested command:${NC}"
      echo "  /assess"
    fi
    ;;

  "SCHOLAR")
    if [ "$STATUS" = "success" ]; then
      echo -e "${GREEN}✓ Pattern learning complete${NC} (${DURATION}s)"
      echo ""
      echo -e "${BLUE}Next steps:${NC}"
      echo "  1. Review learned patterns in .claude/patterns/"
      echo "  2. Apply patterns to current codebase"
      echo "  3. Update team documentation"
    fi
    ;;

  "STRATEGIST")
    if [ "$STATUS" = "success" ]; then
      echo -e "${GREEN}✓ Workflow orchestration complete${NC} (${DURATION}s)"
      echo ""
      echo -e "${BLUE}Workflow status:${NC}"
      echo "  Check Linear board for task updates"
      echo "  Review orchestration results above"
    fi
    ;;

  "DOC-KEEPER")
    if [ "$STATUS" = "success" ]; then
      echo -e "${GREEN}✓ Documentation validation complete${NC} (${DURATION}s)"
      echo ""
      echo -e "${BLUE}Next steps:${NC}"
      echo "  1. Review DOC-XXX tasks in Linear"
      echo "  2. Fix documentation issues"
      echo "  3. Run validation again to verify"
    fi
    ;;

  *)
    # Generic handler for other agents
    if [ "$STATUS" = "success" ]; then
      echo -e "${GREEN}✓ ${AGENT_NAME} completed successfully${NC} (${DURATION}s)"
    else
      echo -e "${RED}✗ ${AGENT_NAME} failed${NC}"
    fi
    ;;
esac

# Always print separator for readability
echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

exit 0
