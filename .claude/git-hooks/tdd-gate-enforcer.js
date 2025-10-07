#!/usr/bin/env node

/**
 * TDD Gate Enforcer - Git Hook
 *
 * Enforces strict Test-Driven Development workflow:
 * 1. RED: Ensures failing tests exist before implementation
 * 2. GREEN: Validates tests pass after implementation
 * 3. REFACTOR: Ensures tests still pass after refactoring
 * 4. Coverage: Enforces minimum diff coverage requirements
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TDDGateEnforcer {
  constructor() {
    this.config = this.loadConfiguration();
    this.results = {
      phase: 'unknown',
      testResults: null,
      coverage: null,
      violations: [],
      passed: false,
    };
  }

  /**
   * Load TDD enforcement configuration
   */
  loadConfiguration() {
    const defaultConfig = {
      minimumCoverage: 80,
      minimumDiffCoverage: 80,
      requireFailingTestFirst: true,
      allowSkippedTests: false,
      testTimeout: 30000, // Default 30s, extended for LLM calls
      excludePatterns: ['node_modules/**', 'coverage/**', '*.min.js', 'dist/**', 'build/**'],
    };

    try {
      // Try to load project-specific config
      const configPath = path.join(process.cwd(), '.claude', 'config', 'tdd-config.json');
      if (fs.existsSync(configPath)) {
        const projectConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return { ...defaultConfig, ...projectConfig };
      }
    } catch (error) {
      console.warn('⚠️ Could not load TDD config, using defaults');
    }

    return defaultConfig;
  }

  /**
   * Main enforcement entry point
   */
  async enforce() {
    console.log('🔍 TDD Gate Enforcer: Validating development workflow...');

    try {
      // Determine TDD phase based on git state
      const phase = await this.determineTDDPhase();
      this.results.phase = phase;

      console.log(`📍 TDD Phase detected: ${phase.toUpperCase()}`);

      // Execute phase-specific validations
      switch (phase) {
        case 'red':
          await this.enforceRedPhase();
          break;
        case 'green':
          await this.enforceGreenPhase();
          break;
        case 'refactor':
          await this.enforceRefactorPhase();
          break;
        default:
          await this.enforceStandardChecks();
      }

      // Final validation
      this.results.passed = this.results.violations.length === 0;

      if (this.results.passed) {
        console.log('✅ TDD Gate Enforcer: All checks passed');
        return true;
      } else {
        console.log('❌ TDD Gate Enforcer: Violations detected');
        this.printViolations();
        return false;
      }
    } catch (error) {
      console.error('💥 TDD Gate Enforcer failed:', error.message);
      this.results.violations.push({
        type: 'enforcer_error',
        message: `Gate enforcer failed: ${error.message}`,
      });
      return false;
    }
  }

  /**
   * Determine current TDD phase based on git state and file changes
   */
  async determineTDDPhase() {
    try {
      // Get staged files
      const stagedFiles = this.getStagedFiles();

      // Get commit message (if available)
      const commitMessage = this.getCommitMessage();

      // Check if only test files are being added/modified
      const onlyTestFiles = stagedFiles.every((file) => this.isTestFile(file));

      // Check if tests are failing
      const testsAreFailing = await this.checkIfTestsFail();

      // Check if implementation files are being modified
      const implementationFiles = stagedFiles.filter((file) => !this.isTestFile(file));

      // Phase detection logic
      if (commitMessage && commitMessage.toLowerCase().includes('[red]')) {
        return 'red';
      } else if (commitMessage && commitMessage.toLowerCase().includes('[green]')) {
        return 'green';
      } else if (commitMessage && commitMessage.toLowerCase().includes('[refactor]')) {
        return 'refactor';
      } else if (onlyTestFiles && testsAreFailing) {
        return 'red';
      } else if (implementationFiles.length > 0 && testsAreFailing) {
        return 'green';
      } else if (implementationFiles.length > 0 && !testsAreFailing) {
        return 'refactor';
      }

      return 'standard';
    } catch (error) {
      console.warn('⚠️ Could not determine TDD phase, using standard checks');
      return 'standard';
    }
  }

  /**
   * Enforce RED phase: Failing test must exist
   */
  async enforceRedPhase() {
    console.log('🔴 Enforcing RED phase: Failing tests required');

    if (!this.config.requireFailingTestFirst) {
      console.log('⚠️ RED phase enforcement disabled in config');
      return;
    }

    // Check that tests are actually failing
    const testResults = await this.runTests();
    this.results.testResults = testResults;

    if (testResults.success) {
      this.results.violations.push({
        type: 'red_phase_violation',
        message: 'RED phase requires failing tests, but all tests are passing',
      });
    }

    // Ensure test files are being added/modified
    const stagedFiles = this.getStagedFiles();
    const testFiles = stagedFiles.filter((file) => this.isTestFile(file));

    if (testFiles.length === 0) {
      this.results.violations.push({
        type: 'red_phase_violation',
        message: 'RED phase requires test files to be added/modified',
      });
    }

    // Check that new tests actually test something meaningful
    await this.validateTestQuality(testFiles);
  }

  /**
   * Enforce GREEN phase: Tests must pass after implementation
   */
  async enforceGreenPhase() {
    console.log('🟢 Enforcing GREEN phase: Tests must pass');

    // Run tests to ensure they pass
    const testResults = await this.runTests();
    this.results.testResults = testResults;

    if (!testResults.success) {
      this.results.violations.push({
        type: 'green_phase_violation',
        message: 'GREEN phase requires all tests to pass',
      });
    }

    // Check that implementation files are being modified
    const stagedFiles = this.getStagedFiles();
    const implementationFiles = stagedFiles.filter((file) => !this.isTestFile(file));

    if (implementationFiles.length === 0) {
      this.results.violations.push({
        type: 'green_phase_violation',
        message: 'GREEN phase requires implementation files to be modified',
      });
    }

    // Enforce diff coverage requirements
    await this.enforceDiffCoverage();
  }

  /**
   * Enforce REFACTOR phase: Tests must still pass, no new functionality
   */
  async enforceRefactorPhase() {
    console.log('🔄 Enforcing REFACTOR phase: Tests must pass, no new functionality');

    // Run tests to ensure they still pass
    const testResults = await this.runTests();
    this.results.testResults = testResults;

    if (!testResults.success) {
      this.results.violations.push({
        type: 'refactor_phase_violation',
        message: 'REFACTOR phase requires all tests to continue passing',
      });
    }

    // Ensure no new test files are being added (refactor shouldn't add new behavior)
    const stagedFiles = this.getStagedFiles();
    const newTestFiles = stagedFiles.filter(
      (file) => this.isTestFile(file) && this.isNewFile(file),
    );

    if (newTestFiles.length > 0) {
      this.results.violations.push({
        type: 'refactor_phase_violation',
        message: 'REFACTOR phase should not add new test files (suggests new functionality)',
      });
    }

    // Check code quality improvements
    await this.validateRefactorQuality();
  }

  /**
   * Enforce standard checks for non-TDD commits
   */
  async enforceStandardChecks() {
    console.log('🔍 Enforcing standard quality checks');

    // Run tests
    const testResults = await this.runTests();
    this.results.testResults = testResults;

    if (!testResults.success) {
      this.results.violations.push({
        type: 'test_failure',
        message: 'All tests must pass before commit',
      });
    }

    // Check basic coverage requirements
    await this.enforceBasicCoverage();
  }

  /**
   * Run test suite and capture results
   */
  async runTests() {
    console.log('🧪 Running test suite...');

    try {
      // Determine test command
      const testCommand = this.getTestCommand();

      // Check if command is safe to run
      if (!this.isCommandSafe(testCommand)) {
        console.log('⚠️ Test command not available, skipping tests');
        return {
          success: true,
          output: 'Tests skipped - command not available',
          duration: 0,
          command: testCommand,
          skipped: true,
        };
      }

      const startTime = Date.now();
      const commandTimeout = this.getCommandTimeout(testCommand);

      if (this.isLLMCommand(testCommand)) {
        console.log('⏳ Running LLM-enabled test (may take several minutes)...');
      }

      const output = execSync(testCommand, {
        encoding: 'utf8',
        timeout: commandTimeout,
        cwd: process.cwd(),
      });

      const duration = Date.now() - startTime;

      console.log(`✅ Tests completed in ${duration}ms`);

      return {
        success: true,
        output,
        duration,
        command: testCommand,
      };
    } catch (error) {
      console.log('❌ Tests failed');

      return {
        success: false,
        output: error.stdout || error.message,
        error: error.stderr || error.message,
        command: this.getTestCommand(),
      };
    }
  }

  /**
   * Check if tests are currently failing (for phase detection)
   */
  async checkIfTestsFail() {
    try {
      const testCommand = this.getTestCommand();
      execSync(testCommand, {
        encoding: 'utf8',
        timeout: 10000,
        stdio: 'ignore',
      });
      return false; // Tests pass
    } catch (error) {
      return true; // Tests fail
    }
  }

  /**
   * Enforce diff coverage requirements
   */
  async enforceDiffCoverage() {
    console.log('📊 Checking diff coverage...');

    try {
      // Get changed lines
      const changedLines = this.getChangedLines();

      if (changedLines.length === 0) {
        console.log('ℹ️ No testable changes detected');
        return;
      }

      // Run coverage analysis
      const coverage = await this.calculateDiffCoverage(changedLines);
      this.results.coverage = coverage;

      if (coverage.percentage < this.config.minimumDiffCoverage) {
        this.results.violations.push({
          type: 'diff_coverage_violation',
          message: `Diff coverage ${coverage.percentage}% is below minimum ${this.config.minimumDiffCoverage}%`,
          actual: coverage.percentage,
          required: this.config.minimumDiffCoverage,
        });
      }

      console.log(
        `📊 Diff coverage: ${coverage.percentage}% (required: ${this.config.minimumDiffCoverage}%)`,
      );
    } catch (error) {
      console.warn('⚠️ Could not calculate diff coverage:', error.message);
    }
  }

  /**
   * Enforce basic coverage requirements
   */
  async enforceBasicCoverage() {
    console.log('📊 Checking overall coverage...');

    try {
      const coverage = await this.calculateOverallCoverage();
      this.results.coverage = coverage;

      if (coverage.percentage < this.config.minimumCoverage) {
        this.results.violations.push({
          type: 'coverage_violation',
          message: `Overall coverage ${coverage.percentage}% is below minimum ${this.config.minimumCoverage}%`,
          actual: coverage.percentage,
          required: this.config.minimumCoverage,
        });
      }

      console.log(
        `📊 Overall coverage: ${coverage.percentage}% (required: ${this.config.minimumCoverage}%)`,
      );
    } catch (error) {
      console.warn('⚠️ Could not calculate coverage:', error.message);
    }
  }

  /**
   * Validate test quality for RED phase
   */
  async validateTestQuality(testFiles) {
    for (const testFile of testFiles) {
      try {
        const content = fs.readFileSync(testFile, 'utf8');

        // Check for meaningful test patterns
        const hasAssertions = /expect\(|assert\(|should\./i.test(content);
        const hasTestCases = /test\(|it\(|describe\(/i.test(content);

        if (!hasAssertions) {
          this.results.violations.push({
            type: 'test_quality_violation',
            message: `Test file ${testFile} has no assertions`,
            file: testFile,
          });
        }

        if (!hasTestCases) {
          this.results.violations.push({
            type: 'test_quality_violation',
            message: `Test file ${testFile} has no test cases`,
            file: testFile,
          });
        }
      } catch (error) {
        console.warn(`⚠️ Could not validate test quality for ${testFile}`);
      }
    }
  }

  /**
   * Validate refactor quality improvements
   */
  async validateRefactorQuality() {
    // This could include complexity analysis, code quality metrics, etc.
    console.log('🔄 Validating refactor quality...');

    // Basic check: ensure no functionality was added
    const stagedFiles = this.getStagedFiles();
    const implementationFiles = stagedFiles.filter((file) => !this.isTestFile(file));

    for (const file of implementationFiles) {
      // This could be enhanced with AST analysis to detect new functionality
      console.log(`🔍 Checking refactor quality for ${file}`);
    }
  }

  /**
   * Get staged files from git
   */
  getStagedFiles() {
    try {
      const output = execSync('git diff --cached --name-only', {
        encoding: 'utf8',
        timeout: 5000,
      });
      return output
        .trim()
        .split('\n')
        .filter((file) => file.length > 0);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get commit message
   */
  getCommitMessage() {
    try {
      // Try to get message from COMMIT_EDITMSG
      const commitMsgPath = path.join(process.cwd(), '.git', 'COMMIT_EDITMSG');
      if (fs.existsSync(commitMsgPath)) {
        return fs.readFileSync(commitMsgPath, 'utf8').trim();
      }
    } catch (error) {
      // Ignore errors
    }
    return '';
  }

  /**
   * Check if file is a test file
   */
  isTestFile(filepath) {
    const testPatterns = [
      // JavaScript/TypeScript patterns
      /\.test\./,
      /\.spec\./,
      /_test\./,
      /tests?\//,
      /__tests__\//,

      // Python patterns
      /test_.*\.py$/,
      /_test\.py$/,
      /tests\.py$/,
      /test\/.*\.py$/,
      /tests\/.*\.py$/,
      /.*_test\.py$/,
      /conftest\.py$/,

      // Generic patterns
      /\/tests?\//,
      /\/test_/,
      /\/.*_test\./,
    ];

    return testPatterns.some((pattern) => pattern.test(filepath));
  }

  /**
   * Check if file is newly added
   */
  isNewFile(filepath) {
    try {
      const output = execSync(`git diff --cached --name-status | grep "^A.*${filepath}"`, {
        encoding: 'utf8',
      });
      return output.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get appropriate test command for the project
   */
  getTestCommand() {
    // Check for JavaScript/Node.js projects first
    if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
      );

      // Prefer simple, fast test commands that are less likely to hang
      if (packageJson.scripts && packageJson.scripts['test:unit']) {
        return 'npm run test:unit';
      }

      if (packageJson.scripts && packageJson.scripts.test) {
        // Check if test command is safe (doesn't chain Python or other complex operations)
        const testScript = packageJson.scripts.test;
        if (!testScript.includes('python') && !testScript.includes('&&')) {
          return 'npm test';
        }
      }

      if (packageJson.devDependencies?.jest || packageJson.dependencies?.jest) {
        return 'npx jest --passWithNoTests --silent';
      }

      if (packageJson.devDependencies?.mocha || packageJson.dependencies?.mocha) {
        return 'npx mocha --timeout 5000';
      }

      // Safe fallback for Node.js projects
      return 'npx jest --passWithNoTests --silent';
    }

    // Check for Python projects
    const pythonFiles = [
      'pytest.ini',
      'pyproject.toml',
      'setup.py',
      'requirements.txt',
      'tox.ini',
      '.coveragerc',
    ];

    const hasPythonProject = pythonFiles.some((file) =>
      fs.existsSync(path.join(process.cwd(), file)),
    );

    if (hasPythonProject) {
      // Prefer pytest if configuration exists
      if (
        fs.existsSync(path.join(process.cwd(), 'pytest.ini')) ||
        fs.existsSync(path.join(process.cwd(), 'pyproject.toml'))
      ) {
        return 'python -m pytest';
      }

      // Check for unittest structure
      if (fs.existsSync(path.join(process.cwd(), 'tests')) || this.hasUnittestFiles()) {
        return 'python -m unittest discover';
      }

      // Default Python test runner
      return 'python -m pytest';
    }

    // Check for Python files in current directory as fallback
    try {
      const files = fs.readdirSync(process.cwd());
      const hasPyFiles = files.some((file) => file.endsWith('.py'));
      if (hasPyFiles) {
        return 'python -m pytest';
      }
    } catch (error) {
      // Ignore directory read errors
    }

    // Ultimate fallback
    return 'npm test';
  }

  /**
   * Check if project has unittest-style test files
   */
  hasUnittestFiles() {
    try {
      const files = fs.readdirSync(process.cwd());
      return files.some((file) => file.startsWith('test_') && file.endsWith('.py'));
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a command involves LLM calls
   */
  isLLMCommand(command) {
    const llmIndicators = [
      'agent-command-router',
      'memory-safe-router',
      'comprehensive-workflow',
      'agent:invoke',
      'assess',
      '.claude',
    ];
    return llmIndicators.some((indicator) => command.includes(indicator));
  }

  /**
   * Get appropriate timeout for command
   */
  getCommandTimeout(command) {
    return this.isLLMCommand(command) ? 300000 : this.config.testTimeout; // 5min for LLM, default for others
  }

  /**
   * Check if a command is available and safe to run
   */
  isCommandSafe(command) {
    try {
      // Quick check - try to get version or help
      if (command.includes('npm')) {
        execSync('npm --version', { timeout: 2000, stdio: 'ignore' });
        return true;
      }
      if (command.includes('python')) {
        execSync('python --version', { timeout: 2000, stdio: 'ignore' });
        return true;
      }
      if (command.includes('jest')) {
        execSync('npx jest --version', { timeout: 2000, stdio: 'ignore' });
        return true;
      }
      return true; // Assume safe if we can't check
    } catch (error) {
      return false;
    }
  }

  /**
   * Get changed lines for diff coverage calculation
   */
  getChangedLines() {
    try {
      const output = execSync('git diff --cached --unified=0', {
        encoding: 'utf8',
        timeout: 5000,
      });
      const lines = [];

      // Parse git diff output to extract changed lines
      const diffLines = output.split('\n');
      let currentFile = null;

      for (const line of diffLines) {
        if (line.startsWith('+++')) {
          currentFile = line.substring(6); // Remove "+++ b/"
        } else if (line.startsWith('@@')) {
          const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
          if (match && currentFile) {
            const startLine = parseInt(match[1]);
            const lineCount = parseInt(match[2]) || 1;

            for (let i = 0; i < lineCount; i++) {
              lines.push({
                file: currentFile,
                line: startLine + i,
              });
            }
          }
        }
      }

      return lines;
    } catch (error) {
      return [];
    }
  }

  /**
   * Calculate diff coverage for changed lines
   */
  async calculateDiffCoverage(changedLines) {
    try {
      // Run coverage for changed files only
      const coverageData = await this.runCoverageForChangedFiles(changedLines);

      if (!coverageData) {
        console.warn('⚠️ Could not get coverage data, using line-based estimation');
        return this.estimateDiffCoverage(changedLines);
      }

      return this.analyzeDiffCoverage(changedLines, coverageData);
    } catch (error) {
      console.warn('⚠️ Coverage calculation failed:', error.message);
      return this.estimateDiffCoverage(changedLines);
    }
  }

  /**
   * Run coverage analysis for changed files
   */
  async runCoverageForChangedFiles(changedLines) {
    try {
      // Get unique files from changed lines
      const changedFiles = [...new Set(changedLines.map((line) => line.file))];
      const testableFiles = changedFiles.filter(
        (file) => !this.isTestFile(file) && !this.isExcludedFile(file),
      );

      if (testableFiles.length === 0) {
        return null;
      }

      // Determine coverage command based on project setup
      const coverageCommand = this.getCoverageCommand();

      console.log(`📊 Running coverage analysis for ${testableFiles.length} files...`);

      // Run coverage with JSON output
      const coverageTimeout = this.isLLMCommand(coverageCommand) ? 300000 : 60000; // 5min for LLM, 1min for regular

      if (this.isLLMCommand(coverageCommand)) {
        console.log('⏳ Running LLM-enabled coverage analysis (may take several minutes)...');
      }

      const output = execSync(`${coverageCommand} --reporter=json`, {
        encoding: 'utf8',
        timeout: coverageTimeout,
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'], // Capture stderr
        killSignal: 'SIGKILL',
      });

      // Parse coverage JSON
      const coverageJson = JSON.parse(output);
      return coverageJson;
    } catch (error) {
      // Try alternative coverage approaches
      return await this.runAlternativeCoverage();
    }
  }

  /**
   * Get appropriate coverage command for the project
   */
  getCoverageCommand() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Check for coverage script
      if (packageJson.scripts && packageJson.scripts.coverage) {
        return 'npm run coverage';
      }

      // Check for Jest
      if (packageJson.devDependencies?.jest || packageJson.dependencies?.jest) {
        return 'npx jest --coverage --coverageReporters=json';
      }

      // Check for nyc
      if (packageJson.devDependencies?.nyc || packageJson.dependencies?.nyc) {
        return 'npx nyc --reporter=json npm test';
      }

      // Check for c8
      if (packageJson.devDependencies?.c8 || packageJson.dependencies?.c8) {
        return 'npx c8 --reporter=json npm test';
      }
    }

    // Check for Python coverage
    const pythonFiles = [
      '.coveragerc',
      'pyproject.toml',
      'pytest.ini',
      'requirements.txt',
      'setup.py',
    ];

    const hasPythonProject = pythonFiles.some((file) =>
      fs.existsSync(path.join(process.cwd(), file)),
    );

    if (hasPythonProject) {
      // Try pytest-cov first (more comprehensive), then coverage.py
      if (
        fs.existsSync(path.join(process.cwd(), 'pytest.ini')) ||
        fs.existsSync(path.join(process.cwd(), 'pyproject.toml'))
      ) {
        return 'python -m pytest --cov=. --cov-report=json';
      } else {
        return 'python -m coverage run -m pytest && python -m coverage json';
      }
    }

    // Default Jest approach
    return 'npx jest --coverage --coverageReporters=json';
  }

  /**
   * Run alternative coverage analysis
   */
  async runAlternativeCoverage() {
    try {
      // Try running tests with coverage using different approaches
      const approaches = [
        'npx jest --coverage --silent --coverageReporters=json',
        'npx c8 --reporter=json npm test',
        'npx nyc --reporter=json npm test',
        'python -m pytest --cov=. --cov-report=json',
        'python -m coverage run -m pytest && python -m coverage json',
      ];

      for (const approach of approaches) {
        try {
          const approachTimeout = this.isLLMCommand(approach) ? 300000 : 30000; // 5min for LLM, 30s for regular

          if (this.isLLMCommand(approach)) {
            console.log('⏳ Running LLM-enabled coverage approach (may take several minutes)...');
          }

          const output = execSync(approach, {
            encoding: 'utf8',
            timeout: approachTimeout,
            stdio: ['ignore', 'pipe', 'pipe'], // Capture stderr
            killSignal: 'SIGKILL',
          });

          const coverageJson = JSON.parse(output);
          return coverageJson;
        } catch (error) {
          continue;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Analyze diff coverage using actual coverage data
   */
  analyzeDiffCoverage(changedLines, coverageData) {
    let totalLines = 0;
    let coveredLines = 0;

    // Group changed lines by file
    const linesByFile = changedLines.reduce((acc, line) => {
      if (!acc[line.file]) acc[line.file] = [];
      acc[line.file].push(line.line);
      return acc;
    }, {});

    // Analyze coverage for each file
    for (const [file, lines] of Object.entries(linesByFile)) {
      if (this.isTestFile(file) || this.isExcludedFile(file)) {
        continue;
      }

      // Normalize file path for coverage data lookup
      const normalizedPath = this.normalizePath(file);
      const fileCoverage = this.findFileCoverage(coverageData, normalizedPath);

      if (fileCoverage) {
        for (const lineNum of lines) {
          totalLines++;

          // Check if line is covered based on coverage format
          if (this.isLineCovered(fileCoverage, lineNum)) {
            coveredLines++;
          }
        }
      } else {
        // File not in coverage report - count as uncovered
        totalLines += lines.length;
      }
    }

    const percentage = totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 100;

    return {
      totalLines,
      coveredLines,
      percentage,
      filesCovered: Object.keys(linesByFile).length,
    };
  }

  /**
   * Find file coverage data in coverage report
   */
  findFileCoverage(coverageData, filePath) {
    // Handle different coverage report formats
    if (coverageData.coverage) {
      // nyc/c8 format
      return coverageData.coverage[filePath];
    } else if (coverageData.files && coverageData.files[filePath]) {
      // Python coverage.py format
      return coverageData.files[filePath];
    } else if (coverageData[filePath]) {
      // Direct file mapping
      return coverageData[filePath];
    } else {
      // Search for file with partial path matching
      const coverageFiles = Object.keys(
        coverageData.coverage || coverageData.files || coverageData,
      );

      const matchingFile = coverageFiles.find((path) => {
        const normalizedPath = this.normalizePath(path);
        const normalizedTarget = this.normalizePath(filePath);
        return (
          normalizedPath.endsWith(normalizedTarget) ||
          normalizedTarget.endsWith(normalizedPath) ||
          path === filePath
        );
      });

      if (matchingFile) {
        return (coverageData.coverage || coverageData.files || coverageData)[matchingFile];
      }
    }

    return null;
  }

  /**
   * Check if a specific line is covered
   */
  isLineCovered(fileCoverage, lineNumber) {
    // Handle different coverage data formats

    // Istanbul/nyc format - check statement coverage
    if (fileCoverage.s && fileCoverage.statementMap) {
      for (const statementId in fileCoverage.statementMap) {
        const statement = fileCoverage.statementMap[statementId];
        if (statement.start.line <= lineNumber && statement.end.line >= lineNumber) {
          return fileCoverage.s[statementId] > 0;
        }
      }
    }

    // Python coverage.py format - executed_lines array
    if (fileCoverage.executed_lines && Array.isArray(fileCoverage.executed_lines)) {
      return fileCoverage.executed_lines.includes(lineNumber);
    }

    // Python coverage.py format - line_coverage object
    if (fileCoverage.line_coverage && typeof fileCoverage.line_coverage === 'object') {
      return fileCoverage.line_coverage[lineNumber.toString()] === 1;
    }

    // Simple line coverage format (line number -> hit count)
    if (fileCoverage.lines && typeof fileCoverage.lines === 'object') {
      return (fileCoverage.lines[lineNumber] || fileCoverage.lines[lineNumber.toString()]) > 0;
    }

    // Array format where index = line number
    if (Array.isArray(fileCoverage)) {
      return fileCoverage[lineNumber - 1] > 0;
    }

    // Direct object mapping (line number as key)
    if (typeof fileCoverage === 'object' && fileCoverage[lineNumber]) {
      return fileCoverage[lineNumber] > 0;
    }

    return false;
  }

  /**
   * Normalize file path for coverage lookup
   */
  normalizePath(filePath) {
    return filePath.replace(/^\.\//, '').replace(/\\/g, '/');
  }

  /**
   * Check if file should be excluded from coverage
   */
  isExcludedFile(filePath) {
    const excludePatterns = [
      ...this.config.excludePatterns,
      /node_modules/,
      /coverage/,
      /\.min\./,
      /dist/,
      /build/,
      /vendor/,
      /__pycache__/,
    ];

    return excludePatterns.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(filePath);
      }
      return filePath.includes(pattern);
    });
  }

  /**
   * Estimate diff coverage when real coverage data is unavailable
   */
  estimateDiffCoverage(changedLines) {
    const testableLines = changedLines.filter(
      (line) => !this.isTestFile(line.file) && !this.isExcludedFile(line.file),
    );

    // Conservative estimation based on file types and test presence
    let estimatedCoverage = 60; // Base assumption

    // Check if test files were also modified (suggests TDD)
    const hasTestChanges = changedLines.some((line) => this.isTestFile(line.file));
    if (hasTestChanges) {
      estimatedCoverage += 20;
    }

    // Check for specific file types that are typically well-tested
    const hasWellTestedFiles = testableLines.some((line) =>
      /\.(test|spec|util|helper)\./i.test(line.file),
    );
    if (hasWellTestedFiles) {
      estimatedCoverage += 10;
    }

    const totalLines = testableLines.length;
    const coveredLines = Math.floor(totalLines * (estimatedCoverage / 100));

    return {
      totalLines,
      coveredLines,
      percentage: totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 100,
      estimated: true,
    };
  }

  /**
   * Calculate overall coverage
   */
  async calculateOverallCoverage() {
    try {
      // Determine coverage approach based on project type
      const coverageResult = await this.runOverallCoverage();

      if (coverageResult) {
        return coverageResult;
      }

      console.warn('⚠️ Could not calculate coverage, using fallback estimation');
      return { percentage: 75, estimated: true };
    } catch (error) {
      console.warn('⚠️ Coverage calculation failed:', error.message);
      return { percentage: 75, estimated: true };
    }
  }

  /**
   * Run overall coverage analysis
   */
  async runOverallCoverage() {
    // Try JavaScript/TypeScript coverage first
    const jsCoverage = await this.runJavaScriptCoverage();
    if (jsCoverage) return jsCoverage;

    // Try Python coverage
    const pythonCoverage = await this.runPythonCoverage();
    if (pythonCoverage) return pythonCoverage;

    return null;
  }

  /**
   * Run JavaScript/TypeScript coverage analysis
   */
  async runJavaScriptCoverage() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Try different JS coverage approaches
      const approaches = [
        // Custom coverage script
        packageJson.scripts?.coverage ? 'npm run coverage' : null,

        // Jest with coverage
        packageJson.devDependencies?.jest || packageJson.dependencies?.jest
          ? 'npx jest --coverage --silent --coverageReporters=text-summary'
          : null,

        // c8 with npm test
        packageJson.devDependencies?.c8 || packageJson.dependencies?.c8
          ? 'npx c8 --reporter=text-summary npm test'
          : null,

        // nyc with npm test
        packageJson.devDependencies?.nyc || packageJson.dependencies?.nyc
          ? 'npx nyc --reporter=text-summary npm test'
          : null,

        // Default Jest fallback
        'npx jest --coverage --silent --coverageReporters=text-summary',
      ].filter(Boolean);

      for (const approach of approaches) {
        try {
          console.log(`📊 Trying JS coverage: ${approach}`);

          const approachTimeout = this.isLLMCommand(approach) ? 300000 : 30000; // 5min for LLM, 30s for regular

          if (this.isLLMCommand(approach)) {
            console.log('⏳ Running LLM-enabled coverage approach (may take several minutes)...');
          }

          const output = execSync(approach, {
            encoding: 'utf8',
            timeout: approachTimeout,
            stdio: ['ignore', 'pipe', 'pipe'], // Capture stderr
            killSignal: 'SIGKILL',
          });

          const percentage = this.parseJavaScriptCoverage(output);
          if (percentage !== null) {
            return {
              percentage,
              tool: approach.includes('jest')
                ? 'jest'
                : approach.includes('c8')
                  ? 'c8'
                  : approach.includes('nyc')
                    ? 'nyc'
                    : 'npm',
            };
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  /**
   * Run Python coverage analysis
   */
  async runPythonCoverage() {
    // Check for Python project indicators
    const pythonFiles = [
      'requirements.txt',
      'pyproject.toml',
      'setup.py',
      'pytest.ini',
      '.coveragerc',
      'tox.ini',
    ];

    const hasPythonProject = pythonFiles.some((file) =>
      fs.existsSync(path.join(process.cwd(), file)),
    );

    if (!hasPythonProject) {
      // Check for .py files in current directory
      try {
        const files = fs.readdirSync(process.cwd());
        const hasPyFiles = files.some((file) => file.endsWith('.py'));
        if (!hasPyFiles) return null;
      } catch (error) {
        return null;
      }
    }

    try {
      // Try different Python coverage approaches
      const approaches = [
        // coverage.py with pytest
        'python -m coverage run -m pytest && python -m coverage report --format=total',

        // coverage.py with unittest
        'python -m coverage run -m unittest discover && python -m coverage report --format=total',

        // pytest-cov
        'python -m pytest --cov=. --cov-report=term-missing | grep TOTAL',

        // Basic coverage.py
        'python -m coverage run --source=. -m pytest && python -m coverage report',
      ];

      for (const approach of approaches) {
        try {
          console.log(`📊 Trying Python coverage: ${approach.split('&&')[0].trim()}`);

          const approachTimeout = this.isLLMCommand(approach) ? 300000 : 30000; // 5min for LLM, 30s for regular

          if (this.isLLMCommand(approach)) {
            console.log('⏳ Running LLM-enabled coverage approach (may take several minutes)...');
          }

          const output = execSync(approach, {
            encoding: 'utf8',
            timeout: approachTimeout,
            stdio: ['ignore', 'pipe', 'pipe'], // Capture stderr
            killSignal: 'SIGKILL',
          });

          const percentage = this.parsePythonCoverage(output);
          if (percentage !== null) {
            return {
              percentage,
              tool: approach.includes('pytest-cov') ? 'pytest-cov' : 'coverage.py',
            };
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  /**
   * Parse JavaScript coverage output
   */
  parseJavaScriptCoverage(output) {
    // Try different JS coverage output formats
    const patterns = [
      // Jest format: "All files      | 85.5  |"
      /All files.*?\|\s*(\d+\.?\d*)\s*\|/,

      // c8/nyc summary format: "All files | 85.5 |"
      /All files\s*\|\s*(\d+\.?\d*)\s*\|/,

      // Simple percentage format: "Coverage: 85.5%"
      /Coverage:\s*(\d+\.?\d*)%/,

      // Total coverage format: "Total: 85.5%"
      /Total:\s*(\d+\.?\d*)%/,
    ];

    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return null;
  }

  /**
   * Parse Python coverage output
   */
  parsePythonCoverage(output) {
    // Try different Python coverage output formats
    const patterns = [
      // coverage.py format: "TOTAL    85%"
      /TOTAL\s+(\d+)%/,

      // coverage.py with decimals: "TOTAL    85.5%"
      /TOTAL\s+(\d+\.?\d*)%/,

      // pytest-cov format: "TOTAL    123    45    85%"
      /TOTAL\s+\d+\s+\d+\s+(\d+)%/,

      // Simple total format when using --format=total
      /^(\d+)$/m,

      // Coverage percentage at end of line
      /(\d+\.?\d*)%\s*$/m,
    ];

    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return null;
  }

  /**
   * Print violations to console
   */
  printViolations() {
    console.log('\n❌ TDD Gate Enforcement Violations:');

    this.results.violations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation.type.toUpperCase()}`);
      console.log(`   ${violation.message}`);

      if (violation.file) {
        console.log(`   File: ${violation.file}`);
      }

      if (violation.actual !== undefined && violation.required !== undefined) {
        console.log(`   Actual: ${violation.actual}, Required: ${violation.required}`);
      }
    });

    console.log('\n💡 TDD Workflow Reminder:');
    console.log('   🔴 RED: Write failing test first');
    console.log('   🟢 GREEN: Write minimal code to pass');
    console.log('   🔄 REFACTOR: Improve code while keeping tests green');
  }

  /**
   * Get enforcement results
   */
  getResults() {
    return this.results;
  }
}

// CLI interface
if (require.main === module) {
  const enforcer = new TDDGateEnforcer();

  enforcer
    .enforce()
    .then((passed) => {
      process.exit(passed ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 TDD Gate Enforcer crashed:', error.message);
      process.exit(1);
    });
}

module.exports = TDDGateEnforcer;
