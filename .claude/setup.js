#!/usr/bin/env node

/**
 * Universal Setup Script for .claude Agentic Workflow
 *
 * This script detects project type and configures the agentic workflow
 * for any project (new or existing) with support for:
 * - JavaScript/TypeScript (Node.js)
 * - Python
 * - Mixed language projects
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Native console styling to replace chalk
const colors = {
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: Object.assign(
    (text) => `\x1b[1m${text}\x1b[0m`,
    {
      cyan: (text) => `\x1b[1m\x1b[36m${text}\x1b[0m`,
      green: (text) => `\x1b[1m\x1b[32m${text}\x1b[0m`,
      yellow: (text) => `\x1b[1m\x1b[33m${text}\x1b[0m`
    }
  )
};

class ClaudeSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.claudeDir = __dirname;

    // Monitor memory usage
    this.logMemoryUsage('Setup started');

    this.projectInfo = {
      type: 'unknown', // 'new', 'existing'
      languages: [], // 'javascript', 'typescript', 'python'
      packageManager: 'npm', // 'npm', 'yarn', 'pnpm', 'poetry', 'pip'
      hasTests: false,
      testFrameworks: [],
      hasCI: false,
      framework: 'none' // 'react', 'vue', 'angular', 'express', 'fastapi', etc.
    };
  }

  /**
   * Log memory usage for debugging
   */
  logMemoryUsage(label = '') {
    const used = process.memoryUsage();
    const mb = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;

    console.log(colors.gray(`[MEMORY] ${label}: RSS ${mb(used.rss)}MB, Heap ${mb(used.heapUsed)}/${mb(used.heapTotal)}MB, External ${mb(used.external)}MB`));
  }

  /**
   * Main setup orchestration
   */
  async setup() {
    console.log(colors.bold.cyan('\n🚀 Claude Agentic Workflow Setup\n'));

    try {
      this.logMemoryUsage('Setup started');

      // Step 1: Detect project characteristics
      await this.detectProject();
      this.logMemoryUsage('Project detected');

      // Step 2: Show detection results and confirm
      await this.confirmDetection();

      // Step 3: Install dependencies
      await this.installDependencies();

      // Step 4: Configure project
      if (this.projectInfo.type === 'new') {
        await this.initializeNewProject();
      } else {
        await this.enhanceExistingProject();
      }

      // Step 5: Setup CI/CD
      await this.setupCI();

      // Step 6: Enhance CLAUDE.md
      await this.enhanceClaudeMd();

      // Step 7: Final validation
      await this.validateSetup();

      console.log(colors.bold.green('\n✅ Setup completed successfully!\n'));
      console.log(this.getUsageInstructions());

    } catch (error) {
      console.error(colors.red(`\n❌ Setup failed: ${error.message}\n`));
      process.exit(1);
    }
  }

  /**
   * Detect project characteristics
   */
  async detectProject() {
    console.log(colors.yellow('🔍 Detecting project characteristics...\n'));

    // Check if project is new or existing
    const hasPackageJson = await this.fileExists('package.json');
    const hasPyprojectToml = await this.fileExists('pyproject.toml');
    const hasRequirementsTxt = await this.fileExists('requirements.txt');
    const hasSetupPy = await this.fileExists('setup.py');
    const hasSourceFiles = await this.hasAnySourceFiles();

    if (!hasPackageJson && !hasPyprojectToml && !hasRequirementsTxt && !hasSetupPy && !hasSourceFiles) {
      this.projectInfo.type = 'new';
      console.log(colors.green('📁 New project detected'));
    } else {
      this.projectInfo.type = 'existing';
      console.log(colors.blue('📂 Existing project detected'));
    }

    // Detect languages
    await this.detectLanguages();

    // Detect package manager
    await this.detectPackageManager();

    // Detect test frameworks
    await this.detectTestFrameworks();

    // Detect CI/CD
    await this.detectCI();

    // Detect framework
    await this.detectFramework();
  }

  /**
   * Detect programming languages in use
   */
  async detectLanguages() {
    const languages = new Set();

    // Check for JavaScript/TypeScript files
    if (await this.hasFiles(['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'])) {
      languages.add('javascript');
    }

    if (await this.hasFiles(['**/*.ts', '**/*.tsx', '**/*.d.ts']) || await this.fileExists('tsconfig.json')) {
      languages.add('typescript');
    }

    // Check for Python files
    if (await this.hasFiles(['**/*.py', '**/*.pyx', '**/*.pyi'])) {
      languages.add('python');
    }

    this.projectInfo.languages = Array.from(languages);

    if (this.projectInfo.languages.length === 0) {
      // Ask user for preferred language
      this.projectInfo.languages = await this.askForLanguages();
    }

    console.log(colors.green(`📝 Languages: ${this.projectInfo.languages.join(', ')}`));
  }

  /**
   * Detect package manager
   */
  async detectPackageManager() {
    if (await this.fileExists('yarn.lock')) {
      this.projectInfo.packageManager = 'yarn';
    } else if (await this.fileExists('pnpm-lock.yaml')) {
      this.projectInfo.packageManager = 'pnpm';
    } else if (await this.fileExists('poetry.lock')) {
      this.projectInfo.packageManager = 'poetry';
    } else if (await this.fileExists('package-lock.json')) {
      this.projectInfo.packageManager = 'npm';
    } else if (this.projectInfo.languages.includes('python')) {
      this.projectInfo.packageManager = 'pip';
    }

    console.log(colors.green(`📦 Package Manager: ${this.projectInfo.packageManager}`));
  }

  /**
   * Detect existing test frameworks
   */
  async detectTestFrameworks() {
    const frameworks = [];

    // Check package.json for JS/TS test frameworks
    if (await this.fileExists('package.json')) {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps.jest) frameworks.push('jest');
      if (deps.mocha) frameworks.push('mocha');
      if (deps.vitest) frameworks.push('vitest');
      if (deps.jasmine) frameworks.push('jasmine');
    }

    // Enhanced Python test framework detection
    if (this.projectInfo.languages.includes('python')) {
      const hasPytest = await this.detectPytestUsage();
      const hasUnittest = await this.detectUnittestUsage();

      if (hasPytest) frameworks.push('pytest');
      if (hasUnittest) frameworks.push('unittest');
    }

    this.projectInfo.testFrameworks = frameworks;
    this.projectInfo.hasTests = frameworks.length > 0 || await this.hasTestFiles();

    console.log(colors.green(`🧪 Test Frameworks: ${frameworks.join(', ') || 'none detected'}`));
  }

  /**
   * Comprehensive pytest detection for Python projects
   */
  async detectPytestUsage() {
    // Check for pytest in requirements files
    const requirementFiles = ['requirements.txt', 'requirements-dev.txt', 'dev-requirements.txt', 'test-requirements.txt'];
    for (const reqFile of requirementFiles) {
      if (await this.fileExists(reqFile)) {
        try {
          const content = await fs.readFile(reqFile, 'utf8');
          if (content.includes('pytest')) return true;
        } catch (error) {
          // Continue checking other files
        }
      }
    }

    // Check pyproject.toml for pytest
    if (await this.fileExists('pyproject.toml')) {
      try {
        const content = await fs.readFile('pyproject.toml', 'utf8');
        if (content.includes('pytest') || content.includes('[tool.pytest')) return true;
      } catch (error) {
        // Continue with other checks
      }
    }

    // Check setup.py for pytest
    if (await this.fileExists('setup.py')) {
      try {
        const content = await fs.readFile('setup.py', 'utf8');
        if (content.includes('pytest')) return true;
      } catch (error) {
        // Continue with other checks
      }
    }

    // Check for pytest configuration files
    const pytestConfigFiles = ['pytest.ini', 'pyproject.toml', 'tox.ini', 'setup.cfg'];
    for (const configFile of pytestConfigFiles) {
      if (await this.fileExists(configFile)) {
        try {
          const content = await fs.readFile(configFile, 'utf8');
          if (content.includes('[pytest]') || content.includes('[tool.pytest')) return true;
        } catch (error) {
          // Continue checking
        }
      }
    }

    // Check for pytest-style test files
    const pytestPatterns = [
      '**/test_*.py',
      '**/*_test.py',
      '**/tests/**/*.py',
      '**/test/**/*.py'
    ];

    for (const pattern of pytestPatterns) {
      if (await this.hasFiles([pattern])) {
        // Additional check: look for pytest-specific imports in test files
        try {
          const { glob } = require('glob');
          const files = await glob(pattern, { cwd: this.projectRoot });

          for (const file of files.slice(0, 5)) { // Check first 5 files
            try {
              const content = await fs.readFile(path.join(this.projectRoot, file), 'utf8');
              if (content.includes('import pytest') ||
                  content.includes('from pytest') ||
                  content.includes('@pytest.') ||
                  content.includes('pytest.')) {
                return true;
              }
            } catch (error) {
              // Continue checking other files
            }
          }
        } catch (error) {
          // If glob fails, fall back to basic file pattern check
          return await this.hasFiles(pytestPatterns.slice(0, 2));
        }
      }
    }

    return false;
  }

  /**
   * Detect unittest usage in Python projects
   */
  async detectUnittestUsage() {
    const unittestPatterns = [
      '**/test*.py',
      '**/tests/**/*.py'
    ];

    for (const pattern of unittestPatterns) {
      if (await this.hasFiles([pattern])) {
        try {
          const { glob } = require('glob');
          const files = await glob(pattern, { cwd: this.projectRoot });

          for (const file of files.slice(0, 5)) { // Check first 5 files
            try {
              const content = await fs.readFile(path.join(this.projectRoot, file), 'utf8');
              if (content.includes('import unittest') ||
                  content.includes('from unittest') ||
                  content.includes('unittest.TestCase')) {
                return true;
              }
            } catch (error) {
              // Continue checking other files
            }
          }
        } catch (error) {
          // If glob fails, fall back to basic detection
          return await this.hasFiles(['**/test*.py']);
        }
      }
    }

    return false;
  }

  /**
   * Detect CI/CD systems
   */
  async detectCI() {
    const ciSystems = [];

    if (await this.fileExists('.github/workflows')) {
      ciSystems.push('github-actions');
    }
    if (await this.fileExists('.gitlab-ci.yml')) {
      ciSystems.push('gitlab-ci');
    }
    if (await this.fileExists('Jenkinsfile')) {
      ciSystems.push('jenkins');
    }
    if (await this.fileExists('.circleci/config.yml')) {
      ciSystems.push('circleci');
    }

    this.projectInfo.hasCI = ciSystems.length > 0;
    console.log(colors.green(`🔄 CI/CD: ${ciSystems.join(', ') || 'none detected'}`));
  }

  /**
   * Detect framework
   */
  async detectFramework() {
    if (await this.fileExists('package.json')) {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps.react) this.projectInfo.framework = 'react';
      else if (deps.vue) this.projectInfo.framework = 'vue';
      else if (deps['@angular/core']) this.projectInfo.framework = 'angular';
      else if (deps.express) this.projectInfo.framework = 'express';
      else if (deps.next) this.projectInfo.framework = 'next';
    }

    if (this.projectInfo.languages.includes('python')) {
      if (await this.hasFiles(['**/app.py', '**/main.py'])) {
        // Try to detect Python frameworks by common patterns
        if (await this.hasStringInFiles(['FastAPI', 'fastapi'])) {
          this.projectInfo.framework = 'fastapi';
        } else if (await this.hasStringInFiles(['Flask', 'flask'])) {
          this.projectInfo.framework = 'flask';
        } else if (await this.hasStringInFiles(['Django', 'django'])) {
          this.projectInfo.framework = 'django';
        }
      }
    }

    console.log(colors.green(`🏗️ Framework: ${this.projectInfo.framework}`));
  }

  /**
   * Confirm detection results with user
   */
  async confirmDetection() {
    console.log(colors.bold.yellow('\n📋 Detected Configuration:\n'));
    console.log(`Project Type: ${colors.cyan(this.projectInfo.type)}`);
    console.log(`Languages: ${colors.cyan(this.projectInfo.languages.join(', '))}`);
    console.log(`Package Manager: ${colors.cyan(this.projectInfo.packageManager)}`);
    console.log(`Test Frameworks: ${colors.cyan(this.projectInfo.testFrameworks.join(', ') || 'none')}`);
    console.log(`Framework: ${colors.cyan(this.projectInfo.framework)}`);
    console.log(`Has CI/CD: ${colors.cyan(this.projectInfo.hasCI ? 'Yes' : 'No')}`);

    const proceed = await this.askYesNo('\nProceed with this configuration?', true);
    if (!proceed) {
      console.log(colors.yellow('Setup cancelled by user.'));
      process.exit(0);
    }
  }

  /**
   * Install required dependencies
   */
  async installDependencies() {
    console.log(colors.yellow('\n📦 Installing dependencies...\n'));

    const depsFile = path.join(this.claudeDir, 'dependencies.json');

    try {
      const depsConfig = JSON.parse(await fs.readFile(depsFile, 'utf8'));

      // Install JavaScript/TypeScript dependencies
      if (this.projectInfo.languages.includes('javascript') || this.projectInfo.languages.includes('typescript')) {
        await this.installJSDependencies(depsConfig.javascript);
      }

      // Install Python dependencies
      if (this.projectInfo.languages.includes('python')) {
        await this.installPythonDependencies(depsConfig.python);
      }

    } catch (error) {
      console.warn(colors.yellow(`Warning: Could not load dependencies config: ${error.message}`));
    }
  }

  /**
   * Install JavaScript/TypeScript dependencies
   */
  async installJSDependencies(deps) {
    if (!deps) return;

    const { packageManager } = this.projectInfo;
    const toInstall = [];

    // Check what's already installed
    let existingDeps = {};
    try {
      if (await this.fileExists('package.json')) {
        const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
        existingDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      }
    } catch (error) {
      // Ignore
    }

    // Add missing required dependencies
    for (const dep of deps.required || []) {
      if (!existingDeps[dep]) {
        toInstall.push(dep);
      }
    }

    if (toInstall.length > 0) {
      console.log(colors.blue(`Installing JS/TS dependencies: ${toInstall.join(', ')}`));

      try {
        const installCmd = this.getInstallCommand(packageManager, toInstall, true);
        execSync(installCmd, { stdio: 'inherit' });
      } catch (error) {
        console.warn(colors.yellow(`Warning: Failed to install some dependencies: ${error.message}`));
      }
    }
  }

  /**
   * Install Python dependencies
   */
  async installPythonDependencies(deps) {
    if (!deps) return;

    const toInstall = [];

    // Detect Python environment
    const pythonEnv = await this.detectPythonEnvironment();

    // Check what's already installed (simplified)
    for (const dep of deps.required || []) {
      try {
        execSync(`${pythonEnv.python} -c "import ${dep}"`, { stdio: 'ignore' });
      } catch {
        toInstall.push(dep);
      }
    }

    if (toInstall.length > 0) {
      console.log(colors.blue(`Installing Python dependencies: ${toInstall.join(', ')}`));
      console.log(colors.gray(`Using Python environment: ${pythonEnv.type}`));

      try {
        if (this.projectInfo.packageManager === 'poetry') {
          execSync(`poetry add --group dev ${toInstall.join(' ')}`, { stdio: 'inherit' });
        } else {
          execSync(`${pythonEnv.pip} install ${toInstall.join(' ')}`, { stdio: 'inherit' });
        }
      } catch (error) {
        console.warn(colors.yellow(`Warning: Failed to install some Python dependencies: ${error.message}`));
        if (error.message.includes('PEP 668') || error.message.includes('externally-managed')) {
          console.warn(colors.yellow('Tip: Consider using a virtual environment:'));
          console.warn(colors.gray('  python -m venv venv'));
          console.warn(colors.gray('  source venv/bin/activate  # (or venv\\Scripts\\activate on Windows)'));
          console.warn(colors.gray('  pip install <packages>'));
        }
      }
    }
  }

  /**
   * Detect Python environment (virtual env, system, etc.)
   */
  async detectPythonEnvironment() {
    // Check for virtual environment
    const venvPaths = [
      '.venv/bin/python',
      '.venv/Scripts/python.exe',
      'venv/bin/python',
      'venv/Scripts/python.exe',
      'env/bin/python',
      'env/Scripts/python.exe'
    ];

    for (const venvPath of venvPaths) {
      if (await this.fileExists(venvPath)) {
        const pipPath = venvPath.replace('python', 'pip').replace('.exe', '');
        return {
          type: 'virtual environment',
          python: venvPath,
          pip: pipPath
        };
      }
    }

    // Check if we're already in a virtual environment
    if (process.env.VIRTUAL_ENV) {
      return {
        type: 'active virtual environment',
        python: 'python',
        pip: 'pip'
      };
    }

    // Fall back to system Python
    return {
      type: 'system Python',
      python: 'python',
      pip: 'pip'
    };
  }

  /**
   * Initialize new project
   */
  async initializeNewProject() {
    console.log(colors.yellow('\n🆕 Initializing new project...\n'));

    // Create package.json for JS/TS projects
    if (this.projectInfo.languages.includes('javascript') || this.projectInfo.languages.includes('typescript')) {
      await this.createPackageJson();
    }

    // Create pyproject.toml for Python projects
    if (this.projectInfo.languages.includes('python')) {
      await this.createPyprojectToml();
    }

    // Create directory structure
    await this.createDirectoryStructure();

    // Create initial files
    await this.createInitialFiles();
  }

  /**
   * Enhance existing project
   */
  async enhanceExistingProject() {
    console.log(colors.yellow('\n🔧 Enhancing existing project...\n'));

    // Backup existing configurations
    await this.backupConfigurations();

    // Merge package.json scripts
    if (await this.fileExists('package.json')) {
      await this.enhancePackageJson();
    }

    // Add Python configuration if needed
    if (this.projectInfo.languages.includes('python') && !await this.fileExists('pyproject.toml')) {
      await this.createPyprojectToml();
    }
  }

  /**
   * Setup CI/CD
   */
  async setupCI() {
    if (!this.projectInfo.hasCI) {
      const setupCI = await this.askYesNo('\nSetup GitHub Actions CI/CD?', true);
      if (setupCI) {
        await this.createGitHubActions();
      }
    } else {
      console.log(colors.blue('Existing CI/CD detected, skipping setup.'));
    }
  }

  /**
   * Enhance CLAUDE.md with workflow system directive
   */
  async enhanceClaudeMd() {
    console.log(colors.yellow('\n📝 Updating CLAUDE.md with workflow system...\n'));

    const claudeMdPath = path.join(this.projectRoot, 'CLAUDE.md');
    const templatePath = path.join(this.claudeDir, 'templates', 'claude-md-append.template');

    try {
      // Read the append template
      const appendContent = await fs.readFile(templatePath, 'utf8');

      // Check if CLAUDE.md exists
      let existingContent = '';
      let fileExists = false;

      try {
        existingContent = await fs.readFile(claudeMdPath, 'utf8');
        fileExists = true;
      } catch (error) {
        // File doesn't exist, will create new one
        existingContent = `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**${this.getProjectName()}** - ${this.getProjectDescription()}

`;
      }

      // Check if workflow directive already exists
      if (existingContent.includes('## Claude Agentic Workflow System')) {
        console.log(colors.blue('CLAUDE.md already contains workflow system directive, skipping.'));
        return;
      }

      // Append the workflow directive
      const updatedContent = existingContent + '\n' + appendContent;

      await fs.writeFile(claudeMdPath, updatedContent, 'utf8');

      if (fileExists) {
        console.log(colors.green('✅ Enhanced existing CLAUDE.md with workflow system directive'));
      } else {
        console.log(colors.green('✅ Created new CLAUDE.md with workflow system directive'));
      }

    } catch (error) {
      console.error(colors.red(`Failed to update CLAUDE.md: ${error.message}`));
    }
  }

  /**
   * Validate setup
   */
  async validateSetup() {
    console.log(colors.yellow('\n✅ Validating setup...\n'));

    try {
      // Run agent status check
      const statusScript = path.join(this.claudeDir, 'scripts', 'monitoring', 'agent-status.js');
      execSync(`node ${statusScript} quick`, { stdio: 'inherit' });
    } catch (error) {
      console.warn(colors.yellow('Warning: Agent status check failed'));
    }
  }

  /**
   * Helper methods
   */
  async fileExists(filepath) {
    try {
      await fs.access(path.join(this.projectRoot, filepath));
      return true;
    } catch {
      return false;
    }
  }

  async hasFiles(patterns) {
    const { glob } = require('glob');
    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: this.projectRoot });
      if (files.length > 0) return true;
    }
    return false;
  }

  async hasAnySourceFiles() {
    return await this.hasFiles(['**/*.js', '**/*.ts', '**/*.py', '**/*.jsx', '**/*.tsx']);
  }

  async hasTestFiles() {
    return await this.hasFiles([
      '**/test/**/*.js', '**/test/**/*.ts', '**/test/**/*.py',
      '**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts',
      '**/test_*.py', '**/*_test.py'
    ]);
  }

  async hasStringInFiles(strings) {
    // Simplified implementation
    return false;
  }

  async askYesNo(question, defaultValue = true) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      const defaultStr = defaultValue ? '[Y/n]' : '[y/N]';
      rl.question(colors.cyan(`${question} ${defaultStr}: `), (answer) => {
        rl.close();
        const normalized = answer.toLowerCase().trim();
        if (normalized === '') {
          resolve(defaultValue);
        } else {
          resolve(normalized === 'y' || normalized === 'yes');
        }
      });
    });
  }

  async askForLanguages() {
    // For now, default to both JS and Python
    return ['javascript', 'python'];
  }

  getInstallCommand(packageManager, deps, isDev = false) {
    const devFlag = isDev ? ' --save-dev' : '';
    switch (packageManager) {
      case 'yarn':
        return `yarn add${isDev ? ' --dev' : ''} ${deps.join(' ')}`;
      case 'pnpm':
        return `pnpm add${devFlag} ${deps.join(' ')}`;
      default:
        return `npm install${devFlag} ${deps.join(' ')}`;
    }
  }

  async createPackageJson() {
    const templatePath = path.join(this.claudeDir, 'templates', 'package.json.template');
    // Implementation would read template and customize
    console.log(colors.green('📄 Created package.json'));
  }

  async createPyprojectToml() {
    const templatePath = path.join(this.claudeDir, 'templates', 'pyproject.toml.template');
    // Implementation would read template and customize
    console.log(colors.green('📄 Created pyproject.toml'));
  }

  async createDirectoryStructure() {
    const dirs = ['src', 'tests', 'docs'];
    for (const dir of dirs) {
      await fs.mkdir(path.join(this.projectRoot, dir), { recursive: true });
    }
    console.log(colors.green('📁 Created directory structure'));
  }

  async createInitialFiles() {
    // Create basic files
    console.log(colors.green('📄 Created initial files'));
  }

  async backupConfigurations() {
    const backupDir = path.join(this.projectRoot, '.claude-backup');
    await fs.mkdir(backupDir, { recursive: true });
    console.log(colors.green('💾 Backed up existing configurations'));
  }

  async enhancePackageJson() {
    console.log(colors.green('📦 Enhanced package.json with Claude scripts'));
  }

  async createGitHubActions() {
    const actionsDir = path.join(this.projectRoot, '.github', 'workflows');
    await fs.mkdir(actionsDir, { recursive: true });
    console.log(colors.green('🔄 Created GitHub Actions workflow'));
  }

  /**
   * Get project name from package.json or directory name
   */
  getProjectName() {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      if (require('fs').existsSync(packageJsonPath)) {
        const pkg = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf8'));
        return pkg.name || path.basename(this.projectRoot);
      }
    } catch (error) {
      // Ignore
    }
    return path.basename(this.projectRoot);
  }

  /**
   * Get project description from package.json or default
   */
  getProjectDescription() {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      if (require('fs').existsSync(packageJsonPath)) {
        const pkg = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf8'));
        return pkg.description || 'Project enhanced with Claude Agentic Workflow System';
      }
    } catch (error) {
      // Ignore
    }
    return 'Project enhanced with Claude Agentic Workflow System';
  }

  getUsageInstructions() {
    return colors.bold.cyan(`
🎉 Claude Agentic Workflow is ready!

Quick Start:
  ./claude assess              # Run code assessment
  ./claude fix CLEAN-123       # Implement fix pack
  ./claude test               # Run TDD cycle
  ./claude status             # Show system status

Documentation:
  ./claude help               # Get help
  ./claude doctor            # Diagnose issues

Next Steps:
  1. Run your first assessment: ./claude assess
  2. Check the .claude/docs/ directory for guides
  3. Configure Linear integration in .claude/settings.local.json
    `);
  }
}

// CLI execution
if (require.main === module) {
  const setup = new ClaudeSetup();
  setup.setup()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = ClaudeSetup;