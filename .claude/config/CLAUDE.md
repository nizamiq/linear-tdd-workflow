# ⚙️ Config Directory - Claude Code Guide

## Purpose

This directory contains configuration files that control the behavior of the Linear TDD Workflow System. These files define environments, feature flags, and system behavior across different contexts.

## Available Configurations

### Environments Configuration (`environments.js`)
**Purpose:** Defines environment-specific settings
**Environments:**
- Development
- Staging
- Production
- Testing

**Structure:**
```javascript
module.exports = {
  development: {
    apiUrl: 'http://localhost:3000',
    debug: true,
    mockMode: false,
    coverage: {
      threshold: 80,
      enforced: true
    }
  },
  production: {
    apiUrl: 'https://api.production.com',
    debug: false,
    mockMode: false,
    coverage: {
      threshold: 90,
      enforced: true
    }
  }
};
```

## Environment Detection

The system automatically detects the environment:
```javascript
// Priority order:
1. NODE_ENV environment variable
2. .env file setting
3. Git branch (main = production, develop = staging)
4. Default to development
```

## Configuration Hierarchy

Settings are merged in this order:
1. Default configuration (base)
2. Environment-specific overrides
3. Local settings (.claude/settings.json)
4. Environment variables
5. Runtime flags

## Common Configurations

### Development Environment
```javascript
{
  "environment": "development",
  "features": {
    "autoFix": true,
    "dryRun": false,
    "verboseLogging": true,
    "mockLinear": true
  },
  "thresholds": {
    "coverage": 80,
    "mutation": 30,
    "complexity": 10
  },
  "agents": {
    "maxConcurrent": 5,
    "timeout": 30000
  }
}
```

### Production Environment
```javascript
{
  "environment": "production",
  "features": {
    "autoFix": false,
    "dryRun": true,
    "verboseLogging": false,
    "mockLinear": false
  },
  "thresholds": {
    "coverage": 90,
    "mutation": 50,
    "complexity": 5
  },
  "agents": {
    "maxConcurrent": 3,
    "timeout": 60000
  }
}
```

## Feature Flags

Control system features dynamically:
```javascript
{
  "featureFlags": {
    "enableAutoFix": {
      "enabled": true,
      "environments": ["development", "staging"],
      "rolloutPercentage": 100
    },
    "enableMutationTesting": {
      "enabled": false,
      "environments": ["production"],
      "rolloutPercentage": 50
    },
    "enableParallelExecution": {
      "enabled": true,
      "environments": ["all"],
      "maxParallel": 5
    }
  }
}
```

## Configuration Validation

Configurations are validated on load:
```javascript
// Validation rules
{
  "coverage": {
    "type": "number",
    "min": 0,
    "max": 100,
    "required": true
  },
  "environment": {
    "type": "string",
    "enum": ["development", "staging", "production", "test"],
    "required": true
  },
  "apiUrl": {
    "type": "string",
    "pattern": "^https?://",
    "required": true
  }
}
```

## Loading Configuration

### Automatic Loading
Configuration is loaded automatically when:
- System starts
- Agents initialize
- Journeys execute

### Manual Loading
```javascript
const config = require('./.claude/config/environments');
const env = process.env.NODE_ENV || 'development';
const settings = config[env];
```

## Override Mechanisms

### Environment Variables
```bash
# Override any setting with env vars
LINEAR_API_KEY=xxx
TDD_COVERAGE_THRESHOLD=85
ENABLE_AUTO_FIX=false
```

### Command Line Flags
```bash
# Override at runtime
node script.js --coverage-threshold 85 --dry-run
```

### Local Overrides
Create `.claude/settings.local.json` (gitignored):
```json
{
  "overrides": {
    "debug": true,
    "mockMode": true
  }
}
```

## Configuration Profiles

### Strict Mode
For maximum quality enforcement:
```javascript
{
  "profile": "strict",
  "coverage": 95,
  "mutation": 60,
  "complexity": 3,
  "autoFix": false,
  "requireApproval": true
}
```

### Fast Mode
For rapid development:
```javascript
{
  "profile": "fast",
  "coverage": 70,
  "mutation": 20,
  "complexity": 15,
  "autoFix": true,
  "requireApproval": false
}
```

### CI/CD Mode
For pipeline execution:
```javascript
{
  "profile": "ci",
  "coverage": 80,
  "mutation": 30,
  "complexity": 10,
  "parallel": true,
  "failFast": true
}
```

## Secrets Management

Never store secrets in config files:
```javascript
// ❌ Wrong
{
  "apiKey": "lin_api_xxxxx"  // Never do this
}

// ✅ Correct
{
  "apiKey": process.env.LINEAR_API_KEY  // From environment
}
```

## Dynamic Configuration

Some settings can be changed at runtime:
```javascript
// Update configuration dynamically
await updateConfig({
  'features.autoFix': false,
  'thresholds.coverage': 85
});

// Changes take effect immediately
```

## Configuration Debugging

### View Current Configuration
```bash
# Show active configuration
node -e "console.log(require('./.claude/config/environments')[process.env.NODE_ENV || 'development'])"

# Or use CLI
npm run config:show
```

### Validate Configuration
```bash
# Check configuration validity
node .claude/scripts/validate-config.js

# Test specific environment
NODE_ENV=production node .claude/scripts/validate-config.js
```

## Important Notes

- Production config is immutable
- Secrets use environment variables only
- Local overrides are gitignored
- Validation runs on every load
- Changes logged for audit

## Quick Reference

| Setting | Dev | Staging | Prod |
|---------|-----|---------|------|
| Coverage | 80% | 85% | 90% |
| Auto-fix | ✅ | ✅ | ❌ |
| Dry-run | ❌ | ✅ | ✅ |
| Debug | ✅ | ✅ | ❌ |
| Parallel | 5 | 3 | 2 |

## Troubleshooting

### Configuration Not Loading
```bash
# Check environment
echo $NODE_ENV

# Validate config file
node -c .claude/config/environments.js

# Check for syntax errors
npm run config:validate
```

### Wrong Environment Detected
```bash
# Force environment
NODE_ENV=production npm run command

# Check detection
node -e "console.log(process.env.NODE_ENV)"
```