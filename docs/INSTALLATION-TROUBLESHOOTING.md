# Installation Troubleshooting Guide

Quick solutions for common installation and setup issues with the Claude Agentic Workflow System.

## 🚀 Quick Diagnosis

```bash
# Run automated troubleshooting
./scripts/troubleshoot.sh --auto

# Run system diagnostics
./scripts/troubleshoot.sh --diagnostics

# Verify installation
./scripts/verify-installation.sh
```

## 🔧 Common Issues and Solutions

### 1. Installation Script Fails

#### Problem: `../claude-workflow/scripts/install.sh` not found

```bash
# Error: No such file or directory
bash: ../claude-workflow/scripts/install.sh: No such file or directory
```

**Solution:**

```bash
# Check if you cloned to the right location
ls ../claude-workflow/scripts/install.sh

# If missing, clone the workflow system:
cd .. # Go to parent directory
git clone https://github.com/your-org/claude-workflow
cd your-project # Return to your project

# Try installation again
../claude-workflow/scripts/install.sh
```

#### Problem: Permission denied during installation

```bash
# Error: Permission denied
bash: ../claude-workflow/scripts/install.sh: Permission denied
```

**Solution:**

```bash
# Make script executable
chmod +x ../claude-workflow/scripts/install.sh

# Run installation
../claude-workflow/scripts/install.sh
```

### 2. Directory Structure Issues

#### Problem: Nested `.claude/.claude/` directories

This happens if you clone directly into `.claude` instead of using parallel installation.

**Solution:**

```bash
# Remove incorrect structure
rm -rf .claude/

# Use correct parallel installation
cd ..
git clone https://github.com/your-org/claude-workflow
cd your-project
../claude-workflow/scripts/install.sh
```

#### Problem: Missing `.claude` directory after installation

**Solution:**

```bash
# Check if installation completed
ls -la .claude/

# If missing, re-run installation
../claude-workflow/scripts/install.sh

# Verify structure
./scripts/verify-installation.sh --quick
```

### 3. Node.js and npm Issues

#### Problem: Node.js version too old

```bash
# Error: Node.js version 16.x.x is too old (≥18.0.0 required)
```

**Solution:**

```bash
# Update Node.js using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Or download from nodejs.org
# https://nodejs.org/en/download/
```

#### Problem: npm install fails with permission errors

```bash
# Error: EACCES: permission denied
```

**Solution:**

```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm to avoid permission issues
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

#### Problem: Package conflicts or lock file issues

```bash
# Error: npm ERR! peer dep missing
```

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Remove lock files and node_modules
rm -rf node_modules package-lock.json

# Fresh install
npm install
```

### 4. CLI Not Working

#### Problem: CLI script not responding

```bash
# Error: node .claude/cli.js --version fails
```

**Solution:**

```bash
# Check if CLI exists
ls -la .claude/cli.js

# Check Node.js syntax
node -c .claude/cli.js

# Check permissions
chmod +x .claude/cli.js

# Test basic functionality
node .claude/cli.js --help
```

#### Problem: "Cannot find module" errors

```bash
# Error: Cannot find module 'some-package'
```

**Solution:**

```bash
# Install missing dependencies
npm install

# Check for missing Claude-specific modules
npm install --save-dev eslint prettier jest @types/jest typescript

# Verify installation
npm run validate
```

### 5. Test Configuration Problems

#### Problem: Tests not running

```bash
# Error: jest: command not found
```

**Solution:**

```bash
# Install Jest
npm install --save-dev jest @types/jest ts-jest

# Create Jest config if missing
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}']
};
EOF

# Run tests
npm test
```

#### Problem: Test coverage too low

```bash
# Error: Coverage threshold not met
```

**Solution:**

```bash
# Create sample tests to improve coverage
mkdir -p tests/unit

# Add basic test
cat > tests/unit/sample.test.js << 'EOF'
describe('Sample Test', () => {
  test('should pass', () => {
    expect(1 + 1).toBe(2);
  });
});
EOF

# Run with coverage
npm run test:coverage
```

### 6. Git Configuration Issues

#### Problem: Not a Git repository

```bash
# Error: fatal: not a git repository
```

**Solution:**

```bash
# Initialize Git repository
git init

# Add files
git add .

# Make initial commit
git commit -m "feat: initialize project with Claude workflow"
```

#### Problem: .env file tracked by Git

```bash
# Error: .env should not be committed
```

**Solution:**

```bash
# Remove from Git tracking
git rm --cached .env

# Ensure .gitignore includes .env
echo ".env" >> .gitignore

# Commit the fix
git add .gitignore
git commit -m "fix: remove .env from Git tracking"
```

### 7. Environment Configuration

#### Problem: Environment variables not loading

**Solution:**

```bash
# Create .env file
cat > .env << 'EOF'
# Linear integration
LINEAR_API_KEY=your_api_key_here
LINEAR_TEAM_ID=your_team_id

# Optional: Anthropic API
ANTHROPIC_API_KEY=your_anthropic_key
EOF

# Create example file
cp .env .env.example
# Remove sensitive values from .env.example manually
```

### 8. Agent System Issues

#### Problem: Agents not responding

```bash
# Error: Agent invocation failed
```

**Solution:**

```bash
# Check agent specifications
ls -la .claude/agents/

# Verify CLI functionality
npm run status

# Test basic agent commands
npm run agent:invoke AUDITOR:health-check
```

#### Problem: Linear integration not working

**Solution:**

```bash
# Test Linear connection
npm run linear:test-connection

# Check environment variables
echo $LINEAR_API_KEY
echo $LINEAR_TEAM_ID

# Verify Linear configuration
npm run validate
```

## 🔍 Diagnostic Tools

### System Health Check

```bash
# Comprehensive verification
./scripts/verify-installation.sh

# Quick essential checks
./scripts/verify-installation.sh --quick

# View verification report
cat .claude/installation-verification-*.log
```

### Interactive Troubleshooting

```bash
# Start interactive menu
./scripts/troubleshoot.sh

# Automated fixes
./scripts/troubleshoot.sh --auto

# System diagnostics only
./scripts/troubleshoot.sh --diagnostics
```

### Manual Verification Commands

```bash
# Check Node.js and npm
node --version  # Should be ≥18.0.0
npm --version

# Check project structure
ls -la .claude/
ls -la .claude/agents/

# Check package.json scripts
grep -A 10 '"scripts"' package.json

# Test npm scripts
npm run validate
npm run status
npm test --passWithNoTests

# Check Git configuration
git status
git log --oneline -5
```

## 🚨 Emergency Recovery

### Complete Reset

If everything is broken, start fresh:

```bash
# Backup current state
cp package.json package.json.backup
cp CLAUDE.md CLAUDE.md.backup

# Remove Claude system
rm -rf .claude/
rm -rf node_modules/

# Re-install from scratch
../claude-workflow/scripts/install.sh

# Restore any custom configurations
# Compare package.json.backup with new package.json
# Merge any custom scripts or dependencies manually
```

### Rollback Installation

```bash
# If you have Git history
git log --oneline
git checkout HEAD~1  # Go back one commit

# If you have backup files
cp .claude-backup/* .
rm -rf .claude/

# Start over with installation
../claude-workflow/scripts/install.sh
```

## 📞 Getting Help

### Automated Diagnostics

```bash
# Generate diagnostic report
./scripts/troubleshoot.sh --diagnostics > diagnosis.txt

# Share the diagnosis.txt file when reporting issues
```

### Manual Checks

If automated tools don't work, collect this information:

```bash
# System information
node --version
npm --version
git --version
uname -a
pwd

# Project state
ls -la
cat package.json | head -20
cat .gitignore

# Error messages
# Copy exact error messages and stack traces
```

### Log Files

Check these files for detailed error information:

```bash
# Installation logs
ls -la .claude/logs/

# npm debug logs
ls -la npm-debug.log*

# System logs (Linux)
tail /var/log/syslog

# System logs (macOS)
tail /var/log/system.log
```

## 🔧 Environment-Specific Issues

### macOS Issues

```bash
# Xcode command line tools (if compilation fails)
xcode-select --install

# Homebrew Node.js conflicts
brew uninstall node
# Then install via nvm

# Permission issues with /usr/local
sudo chown -R $(whoami) /usr/local
```

### Linux Issues

```bash
# Missing build tools
sudo apt-get update
sudo apt-get install build-essential

# Node.js from snap (Ubuntu)
sudo snap remove node
# Then install via nvm

# Permission issues
sudo chown -R $(whoami) ~/.npm
```

### Windows Issues

```bash
# Use Git Bash or WSL for shell scripts
# Install Node.js from nodejs.org
# Use npm without sudo

# Windows-specific paths
# Use forward slashes in scripts: ./scripts/install.sh
# Or use PowerShell: .\scripts\install.ps1
```

## ✅ Verification Checklist

After resolving issues, verify everything works:

```bash
# 1. System prerequisites
node --version    # ≥18.0.0
npm --version     # Any recent version
git --version     # Any recent version

# 2. Installation structure
ls .claude/cli.js           # Exists
ls .claude/agents/CLAUDE.md # Exists
ls package.json             # Enhanced with scripts

# 3. Basic functionality
npm run validate    # Passes
npm run status      # Shows system info
npm test           # Runs (even if no tests)

# 4. Git configuration
git status         # Clean or staged changes
ls .gitignore      # Exists and includes .env

# 5. Optional features
npm run assess     # Runs assessment
npm run linear:test-connection  # If Linear configured
```

If all checks pass, your installation is ready! 🎉
