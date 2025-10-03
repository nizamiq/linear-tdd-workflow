#!/bin/bash
# .claude/hooks/on-executor-start.sh
# Triggered when EXECUTOR agent starts
# Purpose: Display TDD reminder before fix implementation begins

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get task ID from arguments if provided
TASK_ID="${1:-TASK-ID}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${RED}⚠️  MANDATORY: Test-Driven Development Protocol${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}EXECUTOR agent will implement: $TASK_ID${NC}"
echo ""
echo -e "${RED}NON-NEGOTIABLE TDD CYCLE:${NC}"
echo ""
echo "  1️⃣  [RED] - Write FAILING test FIRST"
echo "     └─ Test defines what code should do"
echo "     └─ Verify test fails for expected reason"
echo "     └─ NO production code yet"
echo ""
echo "  2️⃣  [GREEN] - Write MINIMAL code to pass"
echo "     └─ Simplest possible implementation"
echo "     └─ Make the test pass"
echo "     └─ Don't add extra features"
echo ""
echo "  3️⃣  [REFACTOR] - Improve design safely"
echo "     └─ Enhance code quality"
echo "     └─ Keep all tests passing"
echo "     └─ Extract, rename, optimize"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${RED}QUALITY GATES (BLOCKING):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✓ ≥80% diff coverage (CI blocks if not met)"
echo "  ✓ ≥30% mutation score (tests validate behavior)"
echo "  ✓ NO production code without failing test first"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show quick TDD example
echo -e "${BLUE}Quick TDD Example:${NC}"
echo ""
echo -e "${YELLOW}// [RED] Write failing test${NC}"
echo "test('calculates tax for high income', () => {"
echo "  expect(calculateTax(100000)).toBe(25000);"
echo "});"
echo -e "${RED}// ❌ FAILS - calculateTax doesn't exist${NC}"
echo ""
echo -e "${YELLOW}// [GREEN] Minimal code to pass${NC}"
echo "function calculateTax(income) {"
echo "  return income * 0.25;"
echo "}"
echo -e "${GREEN}// ✅ PASSES${NC}"
echo ""
echo -e "${YELLOW}// [REFACTOR] Improve design${NC}"
echo "const TAX_RATE = 0.25;"
echo "function calculateTax(income) {"
echo "  validateIncome(income);"
echo "  return income * TAX_RATE;"
echo "}"
echo -e "${GREEN}// ✅ STILL PASSES${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Reminder about enforcement
echo -e "${YELLOW}EXECUTOR Enforcement:${NC}"
echo "  • Will refuse to write production code before tests"
echo "  • Will verify each TDD phase (RED → GREEN → REFACTOR)"
echo "  • Will check coverage gates before allowing commit"
echo "  • Will label commits with TDD phases"
echo ""

# Link to resources
echo -e "${BLUE}Resources:${NC}"
echo "  📖 Complete guide: .claude/docs/TDD-REMINDER.md"
echo "  📖 EXECUTOR agent: .claude/agents/executor.md"
echo "  📖 TDD workflow: docs/WORKFLOW-TDD-PROTOCOL.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ TDD Protocol Acknowledged${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}EXECUTOR agent starting implementation...${NC}"
echo ""
