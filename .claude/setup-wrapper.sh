#!/usr/bin/env bash

# Setup wrapper script with optimized memory settings
# This prevents out-of-memory errors when running in large projects

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Claude Agentic Workflow Setup (with memory optimization)${NC}"
echo ""

# Detect available memory
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    TOTAL_MEM=$(sysctl -n hw.memsize)
    TOTAL_MEM_MB=$((TOTAL_MEM / 1024 / 1024))
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    TOTAL_MEM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    TOTAL_MEM_MB=$((TOTAL_MEM_KB / 1024))
else
    # Default for unknown systems
    TOTAL_MEM_MB=8192
fi

# Calculate recommended memory allocation (50% of available, max 4GB)
RECOMMENDED_MEM=$((TOTAL_MEM_MB / 2))
if [ $RECOMMENDED_MEM -gt 4096 ]; then
    RECOMMENDED_MEM=4096
fi
if [ $RECOMMENDED_MEM -lt 512 ]; then
    RECOMMENDED_MEM=512
fi

echo -e "${BLUE}System Memory: ${TOTAL_MEM_MB}MB${NC}"
echo -e "${BLUE}Allocated Memory: ${RECOMMENDED_MEM}MB${NC}"
echo ""

# Check if running in a large project (indicators)
LARGE_PROJECT=false
if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sm node_modules 2>/dev/null | cut -f1 || echo "0")
    if [ "$NODE_MODULES_SIZE" -gt 100 ]; then
        LARGE_PROJECT=true
        echo -e "${YELLOW}⚠️  Large node_modules detected (${NODE_MODULES_SIZE}MB)${NC}"
    fi
fi

if [ -d ".git" ]; then
    GIT_SIZE=$(du -sm .git 2>/dev/null | cut -f1 || echo "0")
    if [ "$GIT_SIZE" -gt 100 ]; then
        LARGE_PROJECT=true
        echo -e "${YELLOW}⚠️  Large git repository detected (${GIT_SIZE}MB)${NC}"
    fi
fi

if [ "$LARGE_PROJECT" = true ]; then
    echo -e "${YELLOW}Using optimized settings for large project${NC}"
    echo ""
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if setup.js exists
if [ ! -f "$SCRIPT_DIR/setup.js" ]; then
    echo -e "${RED}❌ Error: setup.js not found in $SCRIPT_DIR${NC}"
    exit 1
fi

# Run setup with optimized memory settings
echo -e "${GREEN}Running setup with optimized memory settings...${NC}"
echo ""

# Execute with increased memory limit
node --max-old-space-size=$RECOMMENDED_MEM "$SCRIPT_DIR/setup.js" "$@"

SETUP_EXIT_CODE=$?

if [ $SETUP_EXIT_CODE -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Setup completed successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Setup failed with exit code $SETUP_EXIT_CODE${NC}"

    if [ "$LARGE_PROJECT" = true ]; then
        echo ""
        echo -e "${YELLOW}Troubleshooting tips for large projects:${NC}"
        echo "1. Try running with even more memory:"
        echo -e "   ${CYAN}node --max-old-space-size=8192 $SCRIPT_DIR/setup.js${NC}"
        echo ""
        echo "2. Clean up unnecessary files first:"
        echo -e "   ${CYAN}rm -rf node_modules package-lock.json${NC}"
        echo -e "   ${CYAN}npm install${NC}"
        echo ""
        echo "3. Use a .gitignore file to exclude large directories"
    fi

    exit $SETUP_EXIT_CODE
fi