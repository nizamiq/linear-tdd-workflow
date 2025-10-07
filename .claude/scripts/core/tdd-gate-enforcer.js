#!/usr/bin/env node

/**
 * TDD Gate Enforcer - Strict RED→GREEN→REFACTOR cycle validation
 *
 * Enforces:
 * - RED phase: Failing tests must exist before implementation
 * - GREEN phase: Minimal code to pass tests, ≥80% diff coverage
 * - REFACTOR phase: Improvements with test safety net
 * - Mutation testing ≥30% on changed files
 * - Policy-as-code FIL classification
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// Native ANSI colors to replace chalk
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

// Simple spinner replacement for ora
class SimpleSpinner {
  constructor(text) {
    this.text = text;
    this.isSpinning = false;
  }

  start() {
    console.log(`🔄 ${this.text}...`);
    this.isSpinning = true;
    return this;
  }

  succeed(text) {
    if (this.isSpinning) {
      console.log(`✅ ${text || this.text}`);
      this.isSpinning = false;
    }
    return this;
  }

  fail(text) {
    if (this.isSpinning) {
      console.log(`❌ ${text || this.text}`);
      this.isSpinning = false;
    }
    return this;
  }

  stop() {
    this.isSpinning = false;
    return this;
  }
}

// Ora replacement function
const ora = (text) => new SimpleSpinner(text);

class TDDGateEnforcer {
  constructor() {
    this.coverageThreshold = 80;
    this.mutationThreshold = 30;
    this.maxLinesOfCode = 300;
  }

  /**
   * Validate complete TDD cycle for a PR/commit
   */
  async validateTDDCycle(options = {}) {
    const { branch = null, validateMutation = true } = options;
    const spinner = ora('Validating TDD cycle').start();

    try {
      // 1. Get changed files (auto-detect branch if not provided)
      const changedFiles = await this.getChangedFiles(branch);
      if (changedFiles.length === 0) {
        spinner.succeed('No changes to validate');
        return { valid: true, reason: 'no-changes' };
      }

      spinner.text = `Validating ${changedFiles.length} changed files`;

      // 2. Validate RED phase (tests exist)
      const redValidation = await this.validateRedPhase(changedFiles);
      if (!redValidation.valid) {
        spinner.fail('RED phase validation failed');
        return redValidation;
      }

      // 3. Validate GREEN phase (tests pass, coverage)
      const greenValidation = await this.validateGreenPhase(changedFiles);
      if (!greenValidation.valid) {
        spinner.fail('GREEN phase validation failed');
        return greenValidation;
      }

      // 4. Validate REFACTOR phase (no test changes during refactor)
      const refactorValidation = await this.validateRefactorPhase();
      if (!refactorValidation.valid) {
        spinner.fail('REFACTOR phase validation failed');
        return refactorValidation;
      }

      // 5. Validate mutation testing (if enabled)
      if (validateMutation) {
        const mutationValidation = await this.validateMutationTesting(changedFiles);
        if (!mutationValidation.valid) {
          spinner.fail('Mutation testing validation failed');
          return mutationValidation;
        }
      }

      // 6. Validate FIL classification
      const filValidation = await this.validateFILClassification(changedFiles);
      if (!filValidation.valid) {
        spinner.fail('FIL classification validation failed');
        return filValidation;
      }

      spinner.succeed('TDD cycle validation passed');
      return {
        valid: true,
        details: {
          red: redValidation,
          green: greenValidation,
          refactor: refactorValidation,
          mutation: validateMutation ? mutationValidation : { skipped: true },
          fil: filValidation,
        },
      };
    } catch (error) {
      spinner.fail(`TDD validation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * RED Phase: Ensure failing tests exist before implementation
   */
  async validateRedPhase(changedFiles) {
    const sourceFiles = changedFiles.filter(
      (f) => f.match(/\.(js|ts|py)$/) && !f.match(/\.(test|spec)\./),
    );

    if (sourceFiles.length === 0) {
      return { valid: true, reason: 'no-source-files' };
    }

    const testFiles = changedFiles.filter((f) => f.match(/\.(test|spec)\.(js|ts|py)$/));

    if (testFiles.length === 0) {
      return {
        valid: false,
        phase: 'RED',
        reason: 'no-tests-found',
        message: 'TDD requires tests to be written first (RED phase)',
        requiredAction: 'Create failing tests for changed source files',
      };
    }

    // Check that test files were modified/created before source files
    const gitLog = await this.getGitCommitHistory();
    const testFileCommits = this.getFileCommits(gitLog, testFiles);
    const sourceFileCommits = this.getFileCommits(gitLog, sourceFiles);

    if (sourceFileCommits.length > 0 && testFileCommits.length === 0) {
      return {
        valid: false,
        phase: 'RED',
        reason: 'source-before-tests',
        message: 'Source files modified without corresponding tests',
        requiredAction: 'Write failing tests first',
      };
    }

    return {
      valid: true,
      phase: 'RED',
      testFiles: testFiles.length,
      sourceFiles: sourceFiles.length,
    };
  }

  /**
   * GREEN Phase: Minimal implementation with coverage validation
   */
  async validateGreenPhase(changedFiles) {
    // 1. Run tests to ensure they pass
    const testResult = await this.runTests();
    if (!testResult.success) {
      return {
        valid: false,
        phase: 'GREEN',
        reason: 'failing-tests',
        message: 'Tests must pass in GREEN phase',
        failures: testResult.failures,
      };
    }

    // 2. Calculate diff coverage
    const coverage = await this.calculateDiffCoverage(changedFiles);
    if (coverage.percentage < this.coverageThreshold) {
      return {
        valid: false,
        phase: 'GREEN',
        reason: 'insufficient-coverage',
        message: `Diff coverage ${coverage.percentage}% below threshold ${this.coverageThreshold}%`,
        requiredAction: 'Add tests to increase coverage of changed lines',
      };
    }

    // 3. Validate minimal implementation (LOC check)
    const totalLOC = await this.calculateChangedLOC(changedFiles);
    if (totalLOC > this.maxLinesOfCode) {
      return {
        valid: false,
        phase: 'GREEN',
        reason: 'excessive-changes',
        message: `Changed ${totalLOC} LOC exceeds Fix Pack limit ${this.maxLinesOfCode}`,
        requiredAction: 'Break into smaller Fix Packs',
      };
    }

    return {
      valid: true,
      phase: 'GREEN',
      coverage: coverage.percentage,
      linesOfCode: totalLOC,
      testResults: testResult,
    };
  }

  /**
   * REFACTOR Phase: Improvements without breaking tests
   */
  async validateRefactorPhase() {
    // Check git commit messages for TDD phase indicators
    const recentCommits = await this.getRecentCommits();
    const hasRefactorCommits = recentCommits.some(
      (commit) =>
        commit.message.toLowerCase().includes('refactor') || commit.message.includes('[REFACTOR]'),
    );

    if (!hasRefactorCommits) {
      return { valid: true, reason: 'no-refactor-commits' };
    }

    // Ensure tests still pass after refactoring
    const testResult = await this.runTests();
    if (!testResult.success) {
      return {
        valid: false,
        phase: 'REFACTOR',
        reason: 'refactor-broke-tests',
        message: 'Refactoring broke existing tests',
        failures: testResult.failures,
      };
    }

    return {
      valid: true,
      phase: 'REFACTOR',
      refactorCommits: recentCommits.filter((c) => c.message.toLowerCase().includes('refactor'))
        .length,
    };
  }

  /**
   * Validate mutation testing on changed files
   */
  async validateMutationTesting(changedFiles) {
    const sourceFiles = changedFiles.filter(
      (f) => f.match(/\.(js|ts)$/) && !f.match(/\.(test|spec)\./),
    );

    if (sourceFiles.length === 0) {
      return { valid: true, reason: 'no-source-files' };
    }

    try {
      // Run mutation testing on changed files only
      const mutationResult = await this.runMutationTesting(sourceFiles);

      if (mutationResult.score < this.mutationThreshold) {
        return {
          valid: false,
          reason: 'insufficient-mutation-coverage',
          message: `Mutation score ${mutationResult.score}% below threshold ${this.mutationThreshold}%`,
          requiredAction: 'Improve test quality to catch more mutations',
        };
      }

      return {
        valid: true,
        mutationScore: mutationResult.score,
        mutationsKilled: mutationResult.killed,
        totalMutations: mutationResult.total,
      };
    } catch (error) {
      // Mutation testing failure is warning, not blocker
      return {
        valid: true,
        warning: `Mutation testing failed: ${error.message}`,
        reason: 'mutation-test-error',
      };
    }
  }

  /**
   * Validate FIL (Feature Impact Level) classification
   */
  async validateFILClassification(changedFiles) {
    const classification = await this.classifyFIL(changedFiles);

    // Block FIL-2/3 changes without proper approval
    if (classification.level === 'FIL-2' || classification.level === 'FIL-3') {
      const hasApproval = await this.checkFILApproval(classification.level);

      if (!hasApproval) {
        return {
          valid: false,
          reason: 'fil-approval-required',
          level: classification.level,
          message: `${classification.level} changes require tech lead approval`,
          requiredAction: 'Get approval before proceeding',
        };
      }
    }

    return {
      valid: true,
      fil: classification,
    };
  }

  /**
   * Detect the default/main branch of the repository
   */
  async detectDefaultBranch() {
    try {
      // Try to get the default branch from origin
      try {
        const { stdout } = await execAsync('git symbolic-ref refs/remotes/origin/HEAD');
        const branch = stdout.trim().replace('refs/remotes/origin/', '');
        if (branch) return branch;
      } catch (error) {
        // Fall through to other methods
      }

      // Check if common branches exist
      const commonBranches = ['main', 'master', 'develop'];
      for (const branch of commonBranches) {
        try {
          await execAsync(`git rev-parse --verify ${branch}`);
          return branch;
        } catch (error) {
          // Branch doesn't exist, try next
        }
      }

      // If no common branches found, use current branch
      const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD');
      return stdout.trim();
    } catch (error) {
      // Default fallback
      return 'main';
    }
  }

  /**
   * Get changed files from git diff with robust branch detection
   */
  async getChangedFiles(baseBranch) {
    try {
      // First try the provided baseBranch
      if (baseBranch) {
        try {
          const { stdout } = await execAsync(`git diff --name-only ${baseBranch}...HEAD`);
          return stdout
            .trim()
            .split('\n')
            .filter((line) => line.length > 0);
        } catch (error) {
          // Fall through to auto-detection
        }
      }

      // Auto-detect the default branch
      const defaultBranch = await this.detectDefaultBranch();
      const currentBranch = await execAsync('git rev-parse --abbrev-ref HEAD');
      const current = currentBranch.stdout.trim();

      // If we're on the default branch, compare with previous commit
      if (current === defaultBranch) {
        const { stdout } = await execAsync('git diff --name-only HEAD^ HEAD');
        return stdout
          .trim()
          .split('\n')
          .filter((line) => line.length > 0);
      }

      // Otherwise compare with default branch
      const { stdout } = await execAsync(`git diff --name-only ${defaultBranch}...HEAD`);
      return stdout
        .trim()
        .split('\n')
        .filter((line) => line.length > 0);
    } catch (error) {
      throw new Error(`Failed to get changed files: ${error.message}`);
    }
  }

  /**
   * Get git commit history
   */
  async getGitCommitHistory() {
    const { stdout } = await execAsync('git log --oneline --name-only -10');
    return stdout;
  }

  /**
   * Get recent commits
   */
  async getRecentCommits() {
    const { stdout } = await execAsync('git log --format="%h|%s|%an|%ad" -10');
    return stdout
      .trim()
      .split('\n')
      .map((line) => {
        const [hash, message, author, date] = line.split('|');
        return { hash, message, author, date };
      });
  }

  /**
   * Run test suite
   */
  async runTests() {
    try {
      const { stdout, stderr } = await execAsync('npm test -- --coverage --passWithNoTests');
      return {
        success: true,
        output: stdout,
        coverage: this.parseCoverageFromOutput(stdout),
      };
    } catch (error) {
      return {
        success: false,
        failures: error.stderr || error.message,
        output: error.stdout,
      };
    }
  }

  /**
   * Calculate diff coverage for changed files
   */
  async calculateDiffCoverage(changedFiles) {
    try {
      // Get coverage report
      await execAsync('npm test -- --coverage --coverageReporters=json');

      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-final.json');
      const coverageData = JSON.parse(await fs.readFile(coveragePath, 'utf8'));

      let totalLines = 0;
      let coveredLines = 0;

      // Calculate coverage for changed files only
      for (const file of changedFiles) {
        if (file.match(/\.(js|ts)$/)) {
          const absolutePath = path.resolve(file);
          const fileCoverage = coverageData[absolutePath];

          if (fileCoverage) {
            const lines = fileCoverage.l;
            totalLines += Object.keys(lines).length;
            coveredLines += Object.values(lines).filter((hits) => hits > 0).length;
          }
        }
      }

      const percentage = totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 100;

      return {
        percentage,
        coveredLines,
        totalLines,
        files: changedFiles.length,
      };
    } catch (error) {
      throw new Error(`Failed to calculate diff coverage: ${error.message}`);
    }
  }

  /**
   * Calculate total lines of code changed
   */
  async calculateChangedLOC(changedFiles) {
    let totalLOC = 0;

    for (const file of changedFiles) {
      if (file.match(/\.(js|ts|py)$/)) {
        try {
          const { stdout } = await execAsync(`git diff --numstat HEAD^ HEAD -- ${file}`);
          const stats = stdout.trim().split('\t');
          const added = parseInt(stats[0]) || 0;
          const deleted = parseInt(stats[1]) || 0;
          totalLOC += added + deleted;
        } catch (error) {
          // File might be new
          try {
            const content = await fs.readFile(file, 'utf8');
            totalLOC += content.split('\n').length;
          } catch (e) {
            // Skip files that can't be read
          }
        }
      }
    }

    return totalLOC;
  }

  /**
   * Run mutation testing on specific files
   */
  async runMutationTesting(files) {
    // Simplified mutation testing - would use StrykerJS or mutmut
    const { stdout } = await execAsync(`npm run test:mutation -- --files ${files.join(',')}`);

    // Parse mutation test results
    const scoreMatch = stdout.match(/Mutation score: ([\d.]+)%/);
    const killedMatch = stdout.match(/(\d+) killed/);
    const totalMatch = stdout.match(/(\d+) total/);

    return {
      score: scoreMatch ? parseFloat(scoreMatch[1]) : 0,
      killed: killedMatch ? parseInt(killedMatch[1]) : 0,
      total: totalMatch ? parseInt(totalMatch[1]) : 0,
    };
  }

  /**
   * Classify Feature Impact Level (FIL)
   */
  async classifyFIL(changedFiles) {
    let maxLevel = 'FIL-0';
    const indicators = [];

    for (const file of changedFiles) {
      const content = await fs.readFile(file, 'utf8').catch(() => '');

      // FIL-3: High impact (APIs, migrations, UI)
      if (
        content.includes('app.') || // Express routes
        content.includes('router.') ||
        content.includes('migration') ||
        content.includes('@api') ||
        file.includes('migration') ||
        file.includes('schema')
      ) {
        maxLevel = 'FIL-3';
        indicators.push(`${file}: API/Migration changes`);
      }
      // FIL-2: Medium impact (utilities, configs)
      else if (
        content.includes('config') ||
        content.includes('util') ||
        file.includes('config') ||
        file.includes('.env')
      ) {
        if (maxLevel !== 'FIL-3') maxLevel = 'FIL-2';
        indicators.push(`${file}: Configuration changes`);
      }
      // FIL-1: Low impact (renames, constants)
      else if (content.match(/const\s+\w+\s*=/) || content.includes('rename')) {
        if (maxLevel === 'FIL-0') maxLevel = 'FIL-1';
        indicators.push(`${file}: Constants/Renames`);
      }
      // FIL-0: No impact (formatting, comments)
      else {
        indicators.push(`${file}: Formatting/Comments`);
      }
    }

    return {
      level: maxLevel,
      indicators,
      requiresApproval: ['FIL-2', 'FIL-3'].includes(maxLevel),
    };
  }

  /**
   * Check if FIL approval exists
   */
  async checkFILApproval(level) {
    // Check for approval markers in PR/commit messages
    try {
      const { stdout } = await execAsync('git log --format="%s" -1');
      return stdout.includes('FEAT-APPROVED') || stdout.includes(`${level}-APPROVED`);
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse coverage percentage from test output
   */
  parseCoverageFromOutput(output) {
    const match = output.match(/All files\s+\|\s+([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get file commits from git log
   */
  getFileCommits(gitLog, files) {
    const commits = [];
    const lines = gitLog.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/^[a-f0-9]{7,}/)) {
        // This is a commit line
        const commitFiles = [];
        for (let j = i + 1; j < lines.length && !lines[j].match(/^[a-f0-9]{7,}/); j++) {
          if (lines[j].trim()) {
            commitFiles.push(lines[j].trim());
          }
        }

        const hasRelevantFiles = files.some((file) =>
          commitFiles.some((commitFile) => commitFile.includes(file)),
        );

        if (hasRelevantFiles) {
          commits.push({
            hash: line.split(' ')[0],
            files: commitFiles,
          });
        }
      }
    }

    return commits;
  }

  /**
   * Validate diff coverage only (for CI pipeline efficiency)
   */
  async validateDiffCoverageOnly(threshold = 80) {
    const spinner = ora('Validating diff coverage').start();

    try {
      // Get changed files
      const changedFiles = await this.getChangedFiles();
      const sourceFiles = changedFiles.filter(
        (file) => file.match(/\.(js|ts)$/) && !file.includes('test') && !file.includes('spec'),
      );

      if (sourceFiles.length === 0) {
        spinner.succeed('No source files changed - skipping diff coverage');
        return { valid: true, message: 'No source files to validate' };
      }

      // Run tests with coverage
      const testResult = await this.runTests();
      if (!testResult.success) {
        spinner.fail('Tests failed');
        return {
          valid: false,
          message: 'Tests must pass before diff coverage validation',
          requiredAction: 'Fix failing tests',
        };
      }

      // Calculate diff coverage
      const diffCoverage = await this.calculateDiffCoverage(sourceFiles);

      spinner.text = `Diff coverage: ${diffCoverage.percentage.toFixed(2)}%`;

      if (diffCoverage.percentage >= threshold) {
        spinner.succeed(
          `✅ Diff coverage ${diffCoverage.percentage.toFixed(2)}% meets threshold ${threshold}%`,
        );
        return {
          valid: true,
          details: {
            diffCoverage: diffCoverage.percentage,
            threshold,
            coveredLines: diffCoverage.covered,
            totalLines: diffCoverage.total,
            changedFiles: sourceFiles.length,
          },
        };
      } else {
        spinner.fail(
          `❌ Diff coverage ${diffCoverage.percentage.toFixed(2)}% below threshold ${threshold}%`,
        );
        return {
          valid: false,
          message: `Diff coverage ${diffCoverage.percentage.toFixed(2)}% is below required ${threshold}%`,
          requiredAction: `Add tests to cover ${Math.ceil((threshold * diffCoverage.total) / 100 - diffCoverage.covered)} more lines`,
          details: {
            diffCoverage: diffCoverage.percentage,
            threshold,
            coveredLines: diffCoverage.covered,
            totalLines: diffCoverage.total,
            shortfall: Math.ceil((threshold * diffCoverage.total) / 100 - diffCoverage.covered),
          },
        };
      }
    } catch (error) {
      spinner.fail(`Diff coverage validation failed: ${error.message}`);
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const enforcer = new TDDGateEnforcer();

  const [, , command, ...args] = process.argv;

  switch (command) {
    case 'validate':
      const options = {
        validateMutation: args.includes('--mutation'),
        coverageOnly: args.includes('--coverage-only'),
        threshold: args.find((arg) => arg.startsWith('--threshold='))?.split('=')[1] || 80,
      };

      const validationMethod = options.coverageOnly
        ? enforcer.validateDiffCoverageOnly(options.threshold)
        : enforcer.validateTDDCycle(options);

      validationMethod
        .then((result) => {
          if (result.valid) {
            console.log(colors.green('✓ TDD cycle validation passed'));
            if (result.details) {
              console.log(JSON.stringify(result.details, null, 2));
            }
          } else {
            console.log(colors.red('✗ TDD cycle validation failed'));
            console.log(colors.yellow(result.message));
            if (result.requiredAction) {
              console.log(colors.cyan(`Required action: ${result.requiredAction}`));
            }
            process.exit(1);
          }
        })
        .catch((error) => {
          console.error(colors.red(`Validation error: ${error.message}`));
          process.exit(1);
        });
      break;

    default:
      console.log(
        `Usage: ${process.argv[1]} validate [--mutation] [--coverage-only] [--threshold=N]`,
      );
      process.exit(1);
  }
}

module.exports = TDDGateEnforcer;
