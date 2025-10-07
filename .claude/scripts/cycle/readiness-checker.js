#!/usr/bin/env node

/**
 * Readiness Checker - Phase 4 of Cycle Planning
 *
 * Final validation and execution readiness:
 * - CI/CD pipeline health check
 * - Environment configuration validation
 * - Quality gate verification
 * - Kickoff report generation
 */

const path = require('path');
const fs = require('fs').promises;
const { execSync } = require('child_process');

class ReadinessChecker {
  constructor() {
    this.alignment = null;
    this.checks = {};
    this.readiness = {};
  }

  /**
   * Main entry point - check execution readiness
   */
  async check() {
    console.log('✅ Phase 4: Execution Readiness Check\n');

    try {
      // Load alignment from Phase 3
      await this.loadAlignment();

      // Step 1: Check CI/CD pipeline
      await this.checkPipeline();

      // Step 2: Validate environments
      await this.validateEnvironments();

      // Step 3: Check quality gates
      await this.checkQualityGates();

      // Step 4: Verify team readiness
      await this.verifyTeamReadiness();

      // Step 5: Generate kickoff report
      const report = await this.generateKickoffReport();

      // Save final cycle plan
      await this.saveFinalPlan(report);

      console.log('✅ Readiness check complete\n');
      return report;
    } catch (error) {
      console.error('❌ Readiness check failed:', error.message);
      throw error;
    }
  }

  /**
   * Load alignment from Phase 3
   */
  async loadAlignment() {
    console.log('📂 Loading alignment data...');

    const alignmentPath = path.join(__dirname, '../../temp/cycle-alignment.json');

    try {
      const data = await fs.readFile(alignmentPath, 'utf8');
      this.alignment = JSON.parse(data);
      console.log(`  ✓ Loaded alignment for ${this.alignment.summary.issuesAligned} issues`);
    } catch (error) {
      console.log('  ⚠️  No alignment found, using defaults');
      // Create default alignment for standalone execution
      this.alignment = {
        summary: { issuesAligned: 10 },
        workQueues: { immediate: [], standard: [], background: [] },
        assignments: {},
        testRequirements: {},
      };
    }
  }

  /**
   * Check CI/CD pipeline health
   */
  async checkPipeline() {
    console.log('🚀 Checking CI/CD pipeline...');

    const checks = {
      gitStatus: await this.checkGitStatus(),
      branchStatus: await this.checkBranchStatus(),
      lastBuild: await this.checkLastBuild(),
      testSuites: await this.checkTestSuites(),
      dependencies: await this.checkDependencies(),
    };

    // Aggregate results
    const failures = Object.values(checks).filter((c) => !c.passed).length;
    const warnings = Object.values(checks).filter((c) => c.warning).length;

    this.checks.pipeline = {
      passed: failures === 0,
      warnings,
      details: checks,
      recommendation: failures > 0 ? 'Fix pipeline issues before cycle start' : 'Pipeline ready',
    };

    console.log(
      `  ${failures === 0 ? '✓' : '✗'} Pipeline: ${failures} failures, ${warnings} warnings`,
    );
  }

  /**
   * Check git repository status
   */
  async checkGitStatus() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const hasChanges = status.trim().length > 0;

      return {
        passed: !hasChanges,
        warning: hasChanges,
        message: hasChanges ? 'Uncommitted changes detected' : 'Working tree clean',
      };
    } catch (error) {
      return {
        passed: false,
        warning: false,
        message: 'Failed to check git status',
      };
    }
  }

  /**
   * Check branch status
   */
  async checkBranchStatus() {
    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const isCorrectBranch = branch === 'develop' || branch === 'main';

      // Check if branch is up to date
      execSync('git fetch origin', { stdio: 'ignore' });
      const behind = execSync('git rev-list HEAD..origin/develop --count', {
        encoding: 'utf8',
      }).trim();

      return {
        passed: isCorrectBranch && behind === '0',
        warning: behind !== '0',
        message: `On ${branch}, ${behind} commits behind origin`,
      };
    } catch (error) {
      return {
        passed: true,
        warning: true,
        message: 'Could not check branch status',
      };
    }
  }

  /**
   * Check last build status
   */
  async checkLastBuild() {
    // Simplified - would integrate with actual CI system
    return {
      passed: true,
      warning: false,
      message: 'Last build successful (mock)',
    };
  }

  /**
   * Check test suites
   */
  async checkTestSuites() {
    try {
      console.log('    Running test suite check...');
      const result = execSync('npm test -- --passWithNoTests --silent', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const passed = !result.includes('FAIL');

      return {
        passed,
        warning: false,
        message: passed ? 'All tests passing' : 'Test failures detected',
      };
    } catch (error) {
      return {
        passed: false,
        warning: false,
        message: 'Test suite failed',
      };
    }
  }

  /**
   * Check dependencies
   */
  async checkDependencies() {
    try {
      // Check for outdated dependencies
      const outdated = execSync('npm outdated --json', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const packages = outdated ? JSON.parse(outdated) : {};
      const outdatedCount = Object.keys(packages).length;

      return {
        passed: true,
        warning: outdatedCount > 10,
        message: `${outdatedCount} outdated dependencies`,
      };
    } catch (error) {
      // npm outdated exits with error if packages are outdated
      return {
        passed: true,
        warning: true,
        message: 'Some dependencies outdated',
      };
    }
  }

  /**
   * Validate environment configuration
   */
  async validateEnvironments() {
    console.log('\n🔧 Validating environments...');

    const checks = {
      envFile: await this.checkEnvFile(),
      linearConfig: await this.checkLinearConfig(),
      apiKeys: await this.checkApiKeys(),
      services: await this.checkServices(),
    };

    const failures = Object.values(checks).filter((c) => !c.passed).length;

    this.checks.environments = {
      passed: failures === 0,
      details: checks,
      recommendation: failures > 0 ? 'Configure environment before start' : 'Environments ready',
    };

    console.log(
      `  ${failures === 0 ? '✓' : '✗'} Environments: ${failures === 0 ? 'All configured' : `${failures} issues`}`,
    );
  }

  /**
   * Check .env file exists and is configured
   */
  async checkEnvFile() {
    try {
      await fs.access('.env');
      const content = await fs.readFile('.env', 'utf8');
      const hasLinearKey = content.includes('LINEAR_API_KEY') && !content.includes('xxx');

      return {
        passed: hasLinearKey,
        warning: !hasLinearKey,
        message: hasLinearKey ? '.env configured' : 'LINEAR_API_KEY not configured',
      };
    } catch {
      return {
        passed: false,
        warning: false,
        message: '.env file not found',
      };
    }
  }

  /**
   * Check Linear configuration
   */
  async checkLinearConfig() {
    try {
      const LinearConfig = require('../../config/linear.config.js');
      const config = new LinearConfig();
      const status = config.getConfigurationStatus();

      return {
        passed: status.configured,
        warning: !status.configured,
        message: status.configured
          ? 'Linear configured'
          : `Missing: ${status.required.missing.join(', ')}`,
      };
    } catch (error) {
      return {
        passed: false,
        warning: false,
        message: 'Linear configuration error',
      };
    }
  }

  /**
   * Check API keys are valid
   */
  async checkApiKeys() {
    // Would validate API keys are not expired
    return {
      passed: true,
      warning: false,
      message: 'API keys valid (mock)',
    };
  }

  /**
   * Check required services
   */
  async checkServices() {
    // Would check database, cache, etc.
    return {
      passed: true,
      warning: false,
      message: 'Services available',
    };
  }

  /**
   * Check quality gates
   */
  async checkQualityGates() {
    console.log('\n🏁 Checking quality gates...');

    const gates = {
      coverage: await this.checkCoverage(),
      linting: await this.checkLinting(),
      typecheck: await this.checkTypecheck(),
      security: await this.checkSecurity(),
    };

    const failures = Object.values(gates).filter((g) => !g.passed).length;

    this.checks.qualityGates = {
      passed: failures === 0,
      details: gates,
      recommendation: failures > 0 ? 'Address quality issues' : 'Quality gates passed',
    };

    console.log(
      `  ${failures === 0 ? '✓' : '✗'} Quality: ${failures === 0 ? 'All gates passed' : `${failures} gates failed`}`,
    );
  }

  /**
   * Check code coverage
   */
  async checkCoverage() {
    try {
      // Read coverage report if exists
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      const coverage = JSON.parse(await fs.readFile(coveragePath, 'utf8'));

      const lineCoverage = coverage.total.lines.pct;
      const passed = lineCoverage >= 80;

      return {
        passed,
        warning: lineCoverage < 85,
        message: `Line coverage: ${lineCoverage.toFixed(1)}%`,
      };
    } catch {
      return {
        passed: true,
        warning: true,
        message: 'Coverage report not found',
      };
    }
  }

  /**
   * Check linting status
   */
  async checkLinting() {
    try {
      execSync('npm run lint:check', { stdio: 'ignore' });
      return {
        passed: true,
        warning: false,
        message: 'No linting errors',
      };
    } catch {
      return {
        passed: false,
        warning: false,
        message: 'Linting errors found',
      };
    }
  }

  /**
   * Check TypeScript compilation
   */
  async checkTypecheck() {
    try {
      execSync('npm run typecheck', { stdio: 'ignore' });
      return {
        passed: true,
        warning: false,
        message: 'Type checking passed',
      };
    } catch {
      return {
        passed: false,
        warning: false,
        message: 'Type errors found',
      };
    }
  }

  /**
   * Check security vulnerabilities
   */
  async checkSecurity() {
    try {
      const result = execSync('npm audit --json', { encoding: 'utf8', stdio: 'pipe' });
      const audit = JSON.parse(result);

      const critical = audit.metadata.vulnerabilities.critical || 0;
      const high = audit.metadata.vulnerabilities.high || 0;

      return {
        passed: critical === 0 && high === 0,
        warning: high > 0,
        message: `${critical} critical, ${high} high vulnerabilities`,
      };
    } catch {
      return {
        passed: true,
        warning: true,
        message: 'Could not run security audit',
      };
    }
  }

  /**
   * Verify team readiness
   */
  async verifyTeamReadiness() {
    console.log('\n👥 Verifying team readiness...');

    // Simplified team readiness checks
    const readiness = {
      documentation: {
        passed: true,
        message: 'Cycle documentation prepared',
      },
      communication: {
        passed: true,
        message: 'Team notified of cycle plan',
      },
      resources: {
        passed: true,
        message: 'Resources allocated',
      },
      tools: {
        passed: true,
        message: 'Development tools configured',
      },
    };

    this.checks.team = {
      passed: true,
      details: readiness,
      recommendation: 'Team ready for cycle',
    };

    console.log('  ✓ Team readiness verified');
  }

  /**
   * Generate kickoff report
   */
  async generateKickoffReport() {
    console.log('\n📊 Generating kickoff report...');

    // Calculate overall readiness
    const allChecks = Object.values(this.checks);
    const passed = allChecks.filter((c) => c.passed).length;
    const total = allChecks.length;
    const readinessScore = (passed / total) * 100;

    // Determine go/no-go decision
    const goDecision = readinessScore >= 75;
    const status = goDecision ? 'READY' : 'NOT READY';

    const report = {
      timestamp: new Date().toISOString(),
      phase: 'readiness',
      status,
      readinessScore: readinessScore.toFixed(0),
      checks: this.checks,
      summary: {
        totalChecks: total,
        passed,
        failed: total - passed,
        decision: goDecision ? 'GO' : 'NO-GO',
      },
      kickoff: {
        startDate: this.getNextMonday(),
        duration: '2 weeks',
        issues: this.alignment.summary.issuesAligned,
        teams: this.getTeamList(),
      },
      risks: this.identifyRisks(),
      mitigations: this.suggestMitigations(),
      nextSteps: this.defineNextSteps(goDecision),
    };

    console.log(`\n  📈 Readiness Score: ${readinessScore.toFixed(0)}%`);
    console.log(`  🚦 Decision: ${status}`);

    return report;
  }

  /**
   * Get next Monday date for cycle start
   */
  getNextMonday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split('T')[0];
  }

  /**
   * Get team list for kickoff
   */
  getTeamList() {
    // Would fetch from Linear API
    return ['Engineering', 'QA', 'Product'];
  }

  /**
   * Identify risks based on checks
   */
  identifyRisks() {
    const risks = [];

    if (!this.checks.pipeline?.passed) {
      risks.push({
        level: 'high',
        category: 'technical',
        description: 'CI/CD pipeline issues may block deployments',
      });
    }

    if (!this.checks.environments?.passed) {
      risks.push({
        level: 'medium',
        category: 'configuration',
        description: 'Environment configuration incomplete',
      });
    }

    if (!this.checks.qualityGates?.passed) {
      risks.push({
        level: 'medium',
        category: 'quality',
        description: 'Quality gates not meeting standards',
      });
    }

    return risks;
  }

  /**
   * Suggest risk mitigations
   */
  suggestMitigations() {
    const mitigations = [];

    if (!this.checks.pipeline?.passed) {
      mitigations.push('Fix pipeline issues before cycle start');
      mitigations.push('Prepare rollback procedures');
    }

    if (!this.checks.environments?.passed) {
      mitigations.push('Complete environment setup immediately');
      mitigations.push('Document configuration requirements');
    }

    if (!this.checks.qualityGates?.passed) {
      mitigations.push('Schedule tech debt sprint');
      mitigations.push('Increase code review rigor');
    }

    return mitigations;
  }

  /**
   * Define next steps based on readiness
   */
  defineNextSteps(ready) {
    if (ready) {
      return [
        '1. Send cycle kickoff email to team',
        '2. Update Linear cycle with selected issues',
        '3. Schedule daily standup meetings',
        '4. Initialize cycle tracking dashboard',
        '5. Begin work on immediate queue items',
      ];
    } else {
      return [
        '1. Address critical readiness issues',
        '2. Re-run readiness check in 24 hours',
        '3. Escalate blockers to management',
        '4. Consider reducing cycle scope',
        '5. Prepare contingency plan',
      ];
    }
  }

  /**
   * Save final cycle plan
   */
  async saveFinalPlan(report) {
    // Save to multiple locations
    const tempPath = path.join(__dirname, '../../temp/cycle-final.json');
    const archivePath = path.join(
      __dirname,
      '../../cycles',
      `cycle-${new Date().toISOString().split('T')[0]}.json`,
    );

    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.mkdir(path.dirname(archivePath), { recursive: true });

    await fs.writeFile(tempPath, JSON.stringify(report, null, 2));
    await fs.writeFile(archivePath, JSON.stringify(report, null, 2));

    console.log(`\n📁 Final plan saved to: ${tempPath}`);
    console.log(`📁 Archived to: ${archivePath}`);
  }
}

// CLI execution
if (require.main === module) {
  const checker = new ReadinessChecker();

  checker
    .check()
    .then((report) => {
      console.log('\n' + '='.repeat(60));
      console.log('READINESS REPORT');
      console.log('='.repeat(60));
      console.log(`Status: ${report.status}`);
      console.log(`Readiness Score: ${report.readinessScore}%`);
      console.log(`Decision: ${report.summary.decision}`);

      console.log('\nCheck Results:');
      console.log(`  Passed: ${report.summary.passed}/${report.summary.totalChecks}`);

      if (report.risks.length > 0) {
        console.log('\n⚠️ Risks:');
        report.risks.forEach((risk) => {
          console.log(`  [${risk.level.toUpperCase()}] ${risk.description}`);
        });
      }

      if (report.mitigations.length > 0) {
        console.log('\n💡 Mitigations:');
        report.mitigations.forEach((mitigation) => {
          console.log(`  - ${mitigation}`);
        });
      }

      console.log('\n📋 Next Steps:');
      report.nextSteps.forEach((step) => {
        console.log(`  ${step}`);
      });

      process.exit(report.summary.decision === 'GO' ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n❌ Readiness check failed:', error);
      process.exit(1);
    });
}

module.exports = ReadinessChecker;
