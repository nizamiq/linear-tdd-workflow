#!/bin/bash
#
# create-tasks-from-assessment.sh
#
# Helper script to create Linear tasks from AUDITOR assessment results.
# This is called by hooks or STRATEGIST to convert assessment JSON into Linear issues.
#
# Usage:
#   ./create-tasks-from-assessment.sh <assessment-json-file>
#   ./create-tasks-from-assessment.sh proposals/issues-2025-10-01.json
#
# Environment Variables:
#   LINEAR_API_KEY - Linear API token (required)
#   LINEAR_TEAM_ID - Linear team ID (required)
#   LINEAR_PROJECT_ID - Linear project ID (optional)
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ASSESSMENT_FILE="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Validate environment
if [ -z "${LINEAR_API_KEY:-}" ]; then
  echo -e "${RED}ERROR: LINEAR_API_KEY environment variable not set${NC}" >&2
  exit 1
fi

if [ -z "${LINEAR_TEAM_ID:-}" ]; then
  echo -e "${RED}ERROR: LINEAR_TEAM_ID environment variable not set${NC}" >&2
  exit 1
fi

if [ -z "$ASSESSMENT_FILE" ]; then
  echo -e "${RED}ERROR: Assessment file path required${NC}" >&2
  echo "Usage: $0 <assessment-json-file>" >&2
  exit 1
fi

if [ ! -f "$ASSESSMENT_FILE" ]; then
  echo -e "${RED}ERROR: Assessment file not found: $ASSESSMENT_FILE${NC}" >&2
  exit 1
fi

# Validate jq is installed
if ! command -v jq &> /dev/null; then
  echo -e "${RED}ERROR: jq is required but not installed${NC}" >&2
  exit 1
fi

echo -e "${BLUE}Creating Linear tasks from assessment results...${NC}"
echo "Assessment file: $ASSESSMENT_FILE"
echo ""

# Extract linear_tasks array from assessment
TASKS_JSON=$(jq -r '.linear_tasks // []' "$ASSESSMENT_FILE")
TASK_COUNT=$(echo "$TASKS_JSON" | jq 'length')

if [ "$TASK_COUNT" -eq 0 ]; then
  echo -e "${YELLOW}No Linear tasks found in assessment${NC}"
  exit 0
fi

echo -e "${GREEN}Found $TASK_COUNT tasks to create${NC}"
echo ""

# Create each task via Linear API
CREATED_TASKS=()
FAILED_TASKS=()

for i in $(seq 0 $((TASK_COUNT - 1))); do
  TASK=$(echo "$TASKS_JSON" | jq -r ".[$i]")

  TITLE=$(echo "$TASK" | jq -r '.title')
  DESCRIPTION=$(echo "$TASK" | jq -r '.description')
  PRIORITY=$(echo "$TASK" | jq -r '.priority // 2')
  LABELS=$(echo "$TASK" | jq -r '.labels // [] | join(",")')

  echo -e "${BLUE}Creating task $((i + 1))/$TASK_COUNT: $TITLE${NC}"

  # Build GraphQL mutation
  # Note: In a real implementation with Claude Code, this would use the MCP tool.
  # For now, we'll use Linear's REST API as a fallback.

  RESPONSE=$(curl -s -X POST https://api.linear.app/graphql \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "Content-Type: application/json" \
    -d @- <<EOF
{
  "query": "mutation IssueCreate(\$input: IssueCreateInput!) { issueCreate(input: \$input) { success issue { id identifier title } } }",
  "variables": {
    "input": {
      "teamId": "$LINEAR_TEAM_ID",
      "title": $(echo "$TITLE" | jq -Rs .),
      "description": $(echo "$DESCRIPTION" | jq -Rs .),
      "priority": $PRIORITY
    }
  }
}
EOF
  )

  # Check response
  SUCCESS=$(echo "$RESPONSE" | jq -r '.data.issueCreate.success // false')

  if [ "$SUCCESS" = "true" ]; then
    ISSUE_ID=$(echo "$RESPONSE" | jq -r '.data.issueCreate.issue.identifier')
    echo -e "${GREEN}✓ Created: $ISSUE_ID - $TITLE${NC}"
    CREATED_TASKS+=("$ISSUE_ID")
  else
    ERROR=$(echo "$RESPONSE" | jq -r '.errors[0].message // "Unknown error"')
    echo -e "${RED}✗ Failed: $TITLE${NC}"
    echo -e "${RED}  Error: $ERROR${NC}"
    FAILED_TASKS+=("$TITLE")
  fi

  # Rate limiting: wait 200ms between requests
  sleep 0.2
done

echo ""
echo -e "${BLUE}─────────────────────────────────────${NC}"
echo -e "${GREEN}✓ Created: ${#CREATED_TASKS[@]} tasks${NC}"
if [ ${#FAILED_TASKS[@]} -gt 0 ]; then
  echo -e "${RED}✗ Failed: ${#FAILED_TASKS[@]} tasks${NC}"
fi
echo -e "${BLUE}─────────────────────────────────────${NC}"

# Output created task IDs for use by calling script
if [ ${#CREATED_TASKS[@]} -gt 0 ]; then
  echo ""
  echo "Created task IDs:"
  printf '%s\n' "${CREATED_TASKS[@]}"
fi

# Exit with error if any tasks failed
if [ ${#FAILED_TASKS[@]} -gt 0 ]; then
  exit 1
fi
