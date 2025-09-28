#!/bin/bash

# Script to fix all chalk dependencies in the .claude directory
# This replaces chalk with native ANSI console styling

set -euo pipefail

echo "🔧 Fixing chalk dependencies in .claude directory..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Find all JS files with chalk dependencies
FILES=$(find .claude -name "*.js" -exec grep -l "chalk" {} \; 2>/dev/null || true)

if [ -z "$FILES" ]; then
    echo -e "${GREEN}✅ No chalk dependencies found!${NC}"
    exit 0
fi

echo -e "${YELLOW}Found chalk dependencies in:${NC}"
echo "$FILES"

# Colors object to replace chalk
COLORS_OBJECT='// Native console styling to replace chalk
const colors = {
  gray: (text) => `\\x1b[90m${text}\\x1b[0m`,
  red: (text) => `\\x1b[31m${text}\\x1b[0m`,
  green: (text) => `\\x1b[32m${text}\\x1b[0m`,
  yellow: (text) => `\\x1b[33m${text}\\x1b[0m`,
  blue: (text) => `\\x1b[34m${text}\\x1b[0m`,
  cyan: (text) => `\\x1b[36m${text}\\x1b[0m`,
  magenta: (text) => `\\x1b[35m${text}\\x1b[0m`,
  bold: Object.assign(
    (text) => `\\x1b[1m${text}\\x1b[0m`,
    {
      cyan: (text) => `\\x1b[1m\\x1b[36m${text}\\x1b[0m`,
      green: (text) => `\\x1b[1m\\x1b[32m${text}\\x1b[0m`,
      yellow: (text) => `\\x1b[1m\\x1b[33m${text}\\x1b[0m`,
      blue: (text) => `\\x1b[1m\\x1b[34m${text}\\x1b[0m`,
      red: (text) => `\\x1b[1m\\x1b[31m${text}\\x1b[0m`,
      magenta: (text) => `\\x1b[1m\\x1b[35m${text}\\x1b[0m`
    }
  )
};'

# Process each file
for file in $FILES; do
    echo -e "${YELLOW}Processing: $file${NC}"

    # Create backup
    cp "$file" "$file.backup"

    # Remove chalk require line and add colors object
    if grep -q "const chalk = require('chalk');" "$file"; then
        # Replace chalk require with colors object
        sed -i.tmp "s/const chalk = require('chalk');/$COLORS_OBJECT/" "$file"
    elif grep -q "require('chalk')" "$file"; then
        # Add colors object after last require
        sed -i.tmp "/require.*$/a\\
$COLORS_OBJECT" "$file"
    fi

    # Replace all chalk. with colors.
    sed -i.tmp 's/chalk\./colors\./g' "$file"

    # Clean up temporary files
    rm -f "$file.tmp"

    echo -e "${GREEN}✅ Fixed: $file${NC}"
done

echo -e "${GREEN}🎉 All chalk dependencies fixed!${NC}"
echo -e "${YELLOW}💾 Backup files created with .backup extension${NC}"
echo ""
echo "To test the fixes:"
echo "  npm run status"
echo "  npm run validate"
echo "  node .claude/setup.js --help"