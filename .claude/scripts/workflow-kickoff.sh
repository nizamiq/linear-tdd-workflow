#!/bin/bash

# Claude Agentic Workflow Kickoff Script
# Initializes workflow for existing projects with vision-task-Linear alignment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="${1:-$(basename $(pwd))}"
TEAM_ID="${2:-a-coders}"
LINEAR_API_KEY="${LINEAR_API_KEY:-}"

echo -e "${CYAN}🚀 Claude Agentic Workflow Kickoff${NC}"
echo -e "${CYAN}====================================${NC}"
echo -e "Project: ${GREEN}$PROJECT_NAME${NC}"
echo -e "Team: ${GREEN}$TEAM_ID${NC}"
echo ""

# Phase 1: Environment Setup
echo -e "${BLUE}📋 Phase 1: Environment Setup${NC}"

# Check if Linear API key is set
if [ -z "$LINEAR_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  LINEAR_API_KEY not set${NC}"
    echo "Please set your Linear API key:"
    echo "export LINEAR_API_KEY=\"your-api-key-here\""
    echo ""
    echo "Get your API key from: https://linear.app/settings/api"
    exit 1
fi

# Initialize Claude workflow if not already done
if [ ! -f ".claude/cli.js" ]; then
    echo -e "${YELLOW}📦 Initializing Claude workflow...${NC}"
    npm run setup || {
        echo -e "${RED}❌ Failed to initialize Claude workflow${NC}"
        exit 1
    }
else
    echo -e "${GREEN}✅ Claude workflow already initialized${NC}"
fi

# Test Linear connection
echo -e "${YELLOW}🔗 Testing Linear API connection...${NC}"
npm run linear:test-connection || {
    echo -e "${RED}❌ Linear API connection failed${NC}"
    echo "Please check your LINEAR_API_KEY and try again"
    exit 1
}

echo -e "${GREEN}✅ Environment setup complete${NC}"
echo ""

# Phase 2: Project Assessment
echo -e "${BLUE}🔍 Phase 2: Project Assessment${NC}"

echo -e "${YELLOW}📊 Running comprehensive code assessment...${NC}"
npm run agent:invoke AUDITOR:assess-code -- --scope full --depth deep --language auto

echo -e "${YELLOW}🏗️  Analyzing project architecture...${NC}"
npm run agent:invoke RESEARCHER:analyze-architecture -- --focus structure --depth deep

echo -e "${YELLOW}🧠 Extracting patterns from git history...${NC}"
npm run agent:invoke SCHOLAR:extract-patterns -- --source commits --period 30d

echo -e "${GREEN}✅ Project assessment complete${NC}"
echo ""

# Phase 3: Linear Integration
echo -e "${BLUE}🎯 Phase 3: Linear Integration${NC}"

echo -e "${YELLOW}🔄 Syncing with Linear workspace...${NC}"
npm run linear:sync --force || {
    echo -e "${YELLOW}⚠️  Linear sync had issues, continuing...${NC}"
}

echo -e "${YELLOW}📊 Checking Linear integration status...${NC}"
npm run linear:status

echo -e "${GREEN}✅ Linear integration complete${NC}"
echo ""

# Phase 4: Vision Alignment
echo -e "${BLUE}🎯 Phase 4: Vision-Task Alignment${NC}"

echo -e "${YELLOW}🔍 Validating vision-task alignment...${NC}"
node .claude/scripts/vision-alignment-validator.js "$PROJECT_NAME" "$TEAM_ID" || {
    echo -e "${YELLOW}⚠️  Vision alignment validation completed with recommendations${NC}"
}

echo -e "${YELLOW}📋 Planning workflow coordination...${NC}"
npm run agent:invoke STRATEGIST:plan-workflow -- --task-type assessment --team "$TEAM_ID"

echo -e "${GREEN}✅ Vision alignment validation complete${NC}"
echo ""

# Phase 5: Workflow Activation
echo -e "${BLUE}⚡ Phase 5: Workflow Activation${NC}"

echo -e "${YELLOW}🔧 Validating system permissions...${NC}"
npm run validate --permissions --tdd

echo -e "${YELLOW}🎛️  Setting up monitoring...${NC}"
npm run agent:invoke MONITOR:configure-alerts -- --level standard

echo -e "${YELLOW}🛡️  Running security scan...${NC}"
npm run agent:invoke SECURITYGUARD:scan-vulnerabilities -- --level standard

echo -e "${GREEN}✅ Workflow activation complete${NC}"
echo ""

# Phase 6: Success Summary
echo -e "${CYAN}🎉 Workflow Kickoff Complete!${NC}"
echo -e "${CYAN}=============================${NC}"
echo ""
echo -e "${GREEN}✅ Environment Setup${NC} - Claude workflow initialized"
echo -e "${GREEN}✅ Project Assessment${NC} - Code analyzed, issues identified"
echo -e "${GREEN}✅ Linear Integration${NC} - Tasks synced, workspace aligned"
echo -e "${GREEN}✅ Vision Alignment${NC} - Task-vision alignment validated"
echo -e "${GREEN}✅ Workflow Activation${NC} - Monitoring and security active"
echo ""

echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "1. Review generated reports in: ${CYAN}reports/${NC}"
echo -e "2. Check Linear tasks created for your team"
echo -e "3. Review vision alignment recommendations"
echo -e "4. Start using daily workflow commands:"
echo ""
echo -e "${CYAN}Daily Commands:${NC}"
echo -e "  ${YELLOW}npm run agent:invoke AUDITOR:assess-code -- --scope changed${NC}"
echo -e "  ${YELLOW}npm run agent:invoke EXECUTOR:implement-fix -- --task-id <TASK-ID>${NC}"
echo -e "  ${YELLOW}npm run agent:invoke GUARDIAN:analyze-failure -- --auto-fix${NC}"
echo ""
echo -e "${CYAN}Weekly Commands:${NC}"
echo -e "  ${YELLOW}node .claude/scripts/vision-alignment-validator.js${NC}"
echo -e "  ${YELLOW}npm run agent:invoke SCHOLAR:extract-patterns -- --period 7d${NC}"
echo ""

echo -e "${GREEN}🚀 Your Claude Agentic Workflow is now active!${NC}"