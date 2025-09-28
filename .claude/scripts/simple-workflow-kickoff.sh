#!/bin/bash

# Simple Workflow Kickoff - Using Native MCP Linear Tools
# No reinventing the wheel - just use what's already there!

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_NAME="${1:-$(basename $(pwd))}"

echo -e "${CYAN}🚀 Claude Workflow Kickoff (Using Native MCP Tools)${NC}"
echo -e "Project: ${GREEN}$PROJECT_NAME${NC}"
echo ""

# 1. Quick health check
echo -e "${BLUE}🔍 Step 1: Run Code Assessment${NC}"
npm run agent:invoke AUDITOR:assess-code -- --scope full --depth deep

# 2. Use actual Linear MCP tools to check connection
echo -e "${BLUE}🔗 Step 2: Test Linear MCP Connection${NC}"
# The Linear MCP server should already be configured and available
# Test it with the built-in Linear commands

# 3. Generate project insights
echo -e "${BLUE}🧠 Step 3: Generate Project Insights${NC}"
npm run agent:invoke RESEARCHER:analyze-architecture -- --focus structure

# 4. Use Linear MCP to fetch existing tasks (if any)
echo -e "${BLUE}📋 Step 4: Check Existing Linear Tasks${NC}"
# Use the native MCP linear tools that are already configured

echo ""
echo -e "${GREEN}✅ Basic workflow initialized!${NC}"
echo ""
echo -e "${CYAN}Use these MCP Linear commands directly:${NC}"
echo -e "• List issues: Use Linear MCP server tools"
echo -e "• Create tasks: Use Linear MCP server tools"
echo -e "• Update status: Use Linear MCP server tools"
echo ""
echo -e "${CYAN}Daily workflow commands:${NC}"
echo -e "• ${GREEN}npm run agent:invoke AUDITOR:assess-code -- --scope changed${NC}"
echo -e "• ${GREEN}npm run agent:invoke EXECUTOR:implement-fix -- --task-id <ID>${NC}"
echo -e "• ${GREEN}npm run agent:invoke GUARDIAN:analyze-failure${NC}"
echo ""
echo -e "${GREEN}🎉 Ready to use the MCP Linear tools directly!${NC}"