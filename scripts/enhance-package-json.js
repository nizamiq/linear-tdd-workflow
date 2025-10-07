#!/usr/bin/env node

/**
 * Claude Agentic Workflow System - package.json Enhancement Script
 * Intelligently merges workflow scripts into existing package.json files
 */

const fs = require('fs');
const path = require('path');

// Workflow scripts to add/merge
const WORKFLOW_SCRIPTS = {
  // Core system commands
  assess: 'node .claude/cli.js assess',
  status: 'node .claude/cli.js status',
  validate: 'node .claude/cli.js validate',
  doctor: 'node .claude/cli.js doctor',
  setup: 'node .claude/cli.js setup',

  // Agent operations
  'agent:invoke': 'node .claude/cli.js agent:invoke',
  'execute:fixpack': 'node .claude/cli.js execute:fixpack',
  'agents:status': 'node .claude/cli.js agents:status',

  // Linear integration
  'linear:sync': 'node .claude/cli.js linear:sync',
  'linear:test-connection': 'node .claude/cli.js linear:test-connection',

  // Quality checks
  precommit: 'npm run lint && npm run format && npm run typecheck && npm test',
  'validate:tdd': 'node .claude/cli.js validate:tdd',
  'validate:coverage-gate': 'node .claude/cli.js validate:coverage-gate',

  // Testing (enhanced versions, preserve existing if they exist)
  'test:watch': 'jest --watch',
  'test:coverage': 'jest --coverage',
  'test:mutation': 'stryker run',
  'test:unit': 'jest --testPathPattern=unit',
  'test:integration': 'jest --testPathPattern=integration',
  'test:e2e': 'jest --testPathPattern=e2e',

  // Code quality
  lint: 'eslint . --ext .js,.ts,.jsx,.tsx --fix',
  'lint:check': 'eslint . --ext .js,.ts,.jsx,.tsx',
  format: 'prettier --write "**/*.{js,ts,jsx,tsx,json,md}"',
  'format:check': 'prettier --check "**/*.{js,ts,jsx,tsx,json,md}"',
  typecheck: 'tsc --noEmit',

  // Build and development
  build: 'tsc',
  dev: 'node --watch',

  // Maintenance
  clean: 'node .claude/cli.js clean',
  reset: 'node .claude/cli.js reset',
  'logs:view': 'node .claude/cli.js logs:view',
};

// Dependencies that should be added if missing
const WORKFLOW_DEPENDENCIES = {
  devDependencies: {
    '@types/jest': '^29.5.12',
    '@types/node': '^20.11.0',
    '@typescript-eslint/eslint-plugin': '^6.19.0',
    '@typescript-eslint/parser': '^6.19.0',
    eslint: '^8.56.0',
    'eslint-config-prettier': '^9.1.0',
    'eslint-plugin-jest': '^27.6.3',
    jest: '^29.7.0',
    prettier: '^3.2.4',
    'ts-jest': '^29.1.1',
    typescript: '^5.3.0',
  },
  optionalDependencies: {
    '@stryker-mutator/core': '^8.0.0',
    '@stryker-mutator/jest-runner': '^8.0.0',
    '@stryker-mutator/typescript-checker': '^8.0.0',
    'jest-watch-typeahead': '^2.2.2',
  },
};

function log(level, message) {
  const colors = {
    info: '\x1b[34m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
  };

  console.log(`${colors[level]}[${level.toUpperCase()}]${colors.reset} ${message}`);
}

function loadPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log('error', `Failed to load package.json: ${error.message}`);
    process.exit(1);
  }
}

function savePackageJson(filePath, packageData) {
  try {
    const content = JSON.stringify(packageData, null, 2) + '\n';
    fs.writeFileSync(filePath, content, 'utf8');
    log('success', `Updated package.json saved to ${filePath}`);
  } catch (error) {
    log('error', `Failed to save package.json: ${error.message}`);
    process.exit(1);
  }
}

function mergeScripts(existingScripts, workflowScripts) {
  const merged = { ...existingScripts };
  let addedCount = 0;
  let skippedCount = 0;

  for (const [scriptName, scriptCommand] of Object.entries(workflowScripts)) {
    if (merged[scriptName]) {
      // Check if it's already a workflow script
      if (merged[scriptName].includes('.claude/cli.js') || merged[scriptName] === scriptCommand) {
        log('info', `Script '${scriptName}' already exists with workflow command, skipping`);
        skippedCount++;
      } else {
        // Preserve existing script, add workflow version with suffix
        const workflowScriptName = `${scriptName}:claude`;
        merged[workflowScriptName] = scriptCommand;
        log('warning', `Script '${scriptName}' exists, added as '${workflowScriptName}'`);
        addedCount++;
      }
    } else {
      merged[scriptName] = scriptCommand;
      addedCount++;
    }
  }

  log('info', `Scripts processed: ${addedCount} added, ${skippedCount} skipped`);
  return merged;
}

function mergeDependencies(existingDeps = {}, workflowDeps = {}) {
  const merged = { ...existingDeps };
  let addedCount = 0;

  for (const [depName, depVersion] of Object.entries(workflowDeps)) {
    if (!merged[depName]) {
      merged[depName] = depVersion;
      addedCount++;
    }
  }

  return { merged, addedCount };
}

function detectProjectType(packageData) {
  const dependencies = { ...packageData.dependencies, ...packageData.devDependencies };
  const hasTypeScript =
    dependencies.typescript || fs.existsSync(path.join(process.cwd(), 'tsconfig.json'));
  const hasReact = dependencies.react;
  const hasNext = dependencies.next;
  const hasExpress = dependencies.express;

  return {
    hasTypeScript,
    hasReact,
    hasNext,
    hasExpress,
    isLibrary: packageData.main && !packageData.scripts?.start,
  };
}

function enhanceScriptsBasedOnProject(scripts, projectType) {
  const enhanced = { ...scripts };

  // TypeScript-specific enhancements
  if (projectType.hasTypeScript) {
    if (!enhanced.build) {
      enhanced.build = 'tsc';
    }
    if (!enhanced.typecheck) {
      enhanced.typecheck = 'tsc --noEmit';
    }
  }

  // React-specific enhancements
  if (projectType.hasReact) {
    if (!enhanced['test:watch']) {
      enhanced['test:watch'] = 'jest --watch';
    }
  }

  // Next.js-specific enhancements
  if (projectType.hasNext) {
    if (!enhanced.dev) {
      enhanced.dev = 'next dev';
    }
    if (!enhanced.build) {
      enhanced.build = 'next build';
    }
  }

  // Express-specific enhancements
  if (projectType.hasExpress) {
    if (!enhanced.dev && !projectType.hasNext) {
      enhanced.dev = 'node --watch server.js';
    }
  }

  return enhanced;
}

function addWorkflowMetadata(packageData) {
  // Add workflow metadata
  packageData.claude = {
    version: '1.0.0',
    enhanced: new Date().toISOString(),
    features: {
      'tdd-enforcement': true,
      'multi-agent-system': true,
      'linear-integration': true,
      'ci-cd-protection': true,
    },
  };

  // Enhance package metadata if minimal
  if (!packageData.description || packageData.description === '') {
    packageData.description =
      'Enhanced with Claude Agentic Workflow System for autonomous code quality management';
  }

  if (!packageData.keywords) {
    packageData.keywords = [];
  }

  const workflowKeywords = ['claude', 'tdd', 'quality', 'autonomous', 'workflow'];
  workflowKeywords.forEach((keyword) => {
    if (!packageData.keywords.includes(keyword)) {
      packageData.keywords.push(keyword);
    }
  });

  return packageData;
}

function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    log('error', 'Usage: node enhance-package-json.js <path-to-package.json>');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    log('error', `File not found: ${filePath}`);
    process.exit(1);
  }

  log('info', `Enhancing package.json: ${filePath}`);

  // Load existing package.json
  let packageData = loadPackageJson(filePath);
  const projectType = detectProjectType(packageData);

  log(
    'info',
    `Project type detected: TypeScript=${projectType.hasTypeScript}, React=${projectType.hasReact}, Next=${projectType.hasNext}, Express=${projectType.hasExpress}`,
  );

  // Initialize scripts if they don't exist
  if (!packageData.scripts) {
    packageData.scripts = {};
  }

  // Merge workflow scripts
  packageData.scripts = mergeScripts(packageData.scripts, WORKFLOW_SCRIPTS);

  // Enhance scripts based on project type
  packageData.scripts = enhanceScriptsBasedOnProject(packageData.scripts, projectType);

  // Merge dependencies
  const devDepsResult = mergeDependencies(
    packageData.devDependencies,
    WORKFLOW_DEPENDENCIES.devDependencies,
  );
  packageData.devDependencies = devDepsResult.merged;

  if (devDepsResult.addedCount > 0) {
    log('info', `Added ${devDepsResult.addedCount} development dependencies`);
  }

  // Add optional dependencies if requested
  if (process.argv.includes('--with-optional')) {
    const optionalResult = mergeDependencies(
      packageData.devDependencies,
      WORKFLOW_DEPENDENCIES.optionalDependencies,
    );
    packageData.devDependencies = optionalResult.merged;

    if (optionalResult.addedCount > 0) {
      log('info', `Added ${optionalResult.addedCount} optional dependencies`);
    }
  }

  // Add workflow metadata
  packageData = addWorkflowMetadata(packageData);

  // Save enhanced package.json
  savePackageJson(filePath, packageData);

  log('success', 'package.json enhancement completed successfully! 🚀');

  // Show next steps
  console.log('\n📋 Next steps:');
  console.log('   1. Run: npm install');
  console.log('   2. Run: npm run validate');
  console.log('   3. Run: npm run status');
}

if (require.main === module) {
  main();
}

module.exports = {
  mergeScripts,
  mergeDependencies,
  detectProjectType,
  enhanceScriptsBasedOnProject,
  addWorkflowMetadata,
};
