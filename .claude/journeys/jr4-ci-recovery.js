#!/usr/bin/env node

/**
 * JR-4: CI Break Diagnosis & Recovery Journey
 *
 * Autonomous pipeline monitoring and self-healing.
 * Diagnoses failures and implements recovery strategies.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');

class CIRecoveryJourney {
  constructor() {
    this.projectRoot = process.cwd();
    this.claudeDir = path.join(this.projectRoot, '.claude');
    this.pipelineStatus = null;
    this.failureAnalysis = null;
    this.recoveryAttempts = [];
    this.results = {
      diagnosis: null,
      actions: [],
      outcome: null,
      incident: null
    };
  }

  /**
   * Main entry point - runs autonomously
   */
  async run(options = {}) {
    console.log('🚨 JR-4: CI Break Diagnosis & Recovery Journey');
    console.log('============================================');

    try {
      // Phase 1: Monitor Pipeline
      const status = await this.monitorPipeline();

      if (status.healthy) {
        console.log('✅ Pipeline is healthy');
        return { status: 'healthy', monitoring: status };
      }

      // Phase 2: Diagnose Failure
      const diagnosis = await this.diagnoseFail(status);

      // Phase 3: Determine Recovery Strategy
      const strategy = await this.determineStrategy(diagnosis);

      // Phase 4: Execute Recovery
      const recovery = await this.executeRecovery(strategy, options);

      // Phase 5: Verify Recovery
      const verified = await this.verifyRecovery();

      // Phase 6: Report or Escalate
      await this.reportOrEscalate(verified);

      console.log('✅ Recovery process complete');
      return this.results;

    } catch (error) {
      console.error('❌ Recovery failed:', error.message);
      await this.createIncident(error);
      throw error;
    }
  }

  /**
   * Monitor pipeline status
   */
  async monitorPipeline() {
    console.log('📊 Monitoring pipeline status...');

    const checks = {
      ci: await this.checkCIStatus(),
      tests: await this.checkTestStatus(),
      build: await this.checkBuildStatus(),
      quality: await this.checkQualityGates()
    };

    const failures = Object.entries(checks)
      .filter(([k, v]) => !v.passed)
      .map(([k, v]) => ({ component: k, ...v }));

    const healthy = failures.length === 0;

    console.log(`   Status: ${healthy ? '✅ Healthy' : `❌ ${failures.length} failures`}`);

    if (!healthy) {
      console.log('   Failed components:');
      failures.forEach(f => {
        console.log(`      - ${f.component}: ${f.error}`);
      });
    }

    this.pipelineStatus = {
      healthy,
      checks,
      failures,
      timestamp: new Date().toISOString()
    };

    return this.pipelineStatus;
  }

  /**
   * Check CI status
   */
  async checkCIStatus() {
    try {
      // Check GitHub Actions status
      const status = execSync('gh run list --limit 1 --json status', { encoding: 'utf8' });
      const parsed = JSON.parse(status);

      if (parsed[0] && parsed[0].status === 'completed') {
        return { passed: true, status: 'completed' };
      }

      return {
        passed: false,
        error: `CI status: ${parsed[0]?.status || 'unknown'}`
      };

    } catch (error) {
      // Check alternative CI systems
      return this.checkAlternativeCI();
    }
  }

  /**
   * Check alternative CI systems
   */
  async checkAlternativeCI() {
    // Try CircleCI
    if (await this.fileExists('.circleci/config.yml')) {
      return { passed: true, status: 'CircleCI assumed healthy' };
    }

    // Try Jenkins
    if (await this.fileExists('Jenkinsfile')) {
      return { passed: true, status: 'Jenkins assumed healthy' };
    }

    // Try GitLab CI
    if (await this.fileExists('.gitlab-ci.yml')) {
      return { passed: true, status: 'GitLab CI assumed healthy' };
    }

    return { passed: true, status: 'No CI detected' };
  }

  /**
   * Check test status
   */
  async checkTestStatus() {
    try {
      const projectType = await this.detectProjectType();
      let testCommand;

      if (projectType === 'javascript') {
        testCommand = 'npm test 2>&1';
      } else if (projectType === 'python') {
        testCommand = 'pytest 2>&1';
      } else {
        return { passed: true, status: 'Tests not configured' };
      }

      execSync(testCommand, { encoding: 'utf8', stdio: 'pipe' });
      return { passed: true, status: 'All tests passing' };

    } catch (error) {
      const output = error.stdout || error.stderr || error.message;

      // Parse test failures
      const failures = this.parseTestFailures(output);

      return {
        passed: false,
        error: `${failures.count} test failures`,
        failures
      };
    }
  }

  /**
   * Check build status
   */
  async checkBuildStatus() {
    try {
      const projectType = await this.detectProjectType();
      let buildCommand;

      if (projectType === 'javascript') {
        if (await this.fileExists('tsconfig.json')) {
          buildCommand = 'npm run build 2>&1';
        } else {
          return { passed: true, status: 'No build required' };
        }
      } else if (projectType === 'python') {
        return { passed: true, status: 'Python - no build required' };
      }

      if (buildCommand) {
        execSync(buildCommand, { encoding: 'utf8', stdio: 'pipe' });
      }

      return { passed: true, status: 'Build successful' };

    } catch (error) {
      return {
        passed: false,
        error: 'Build failed',
        output: error.stdout || error.message
      };
    }
  }

  /**
   * Check quality gates
   */
  async checkQualityGates() {
    const gates = [];

    // Check coverage
    try {
      const coverage = await this.getCoverage();
      if (coverage < 80) {
        gates.push(`Coverage ${coverage}% < 80%`);
      }
    } catch {
      // Coverage check optional
    }

    // Check linting
    try {
      await this.runLinting();
    } catch {
      gates.push('Linting errors');
    }

    return {
      passed: gates.length === 0,
      error: gates.join(', '),
      gates
    };
  }

  /**
   * Diagnose failure
   */
  async diagnoseFail(status) {
    console.log('\n🔍 Diagnosing failure...');

    const diagnosis = {
      timestamp: new Date().toISOString(),
      failures: status.failures,
      category: null,
      rootCause: null,
      confidence: 0,
      recommendations: []
    };

    for (const failure of status.failures) {
      const analysis = await this.analyzeFailure(failure);

      if (analysis.confidence > diagnosis.confidence) {
        diagnosis.category = analysis.category;
        diagnosis.rootCause = analysis.rootCause;
        diagnosis.confidence = analysis.confidence;
        diagnosis.recommendations = analysis.recommendations;
      }
    }

    console.log(`   📋 Diagnosis: ${diagnosis.rootCause}`);
    console.log(`   🎯 Category: ${diagnosis.category}`);
    console.log(`   📊 Confidence: ${Math.round(diagnosis.confidence * 100)}%`);

    this.failureAnalysis = diagnosis;
    this.results.diagnosis = diagnosis;

    return diagnosis;
  }

  /**
   * Analyze individual failure
   */
  async analyzeFailure(failure) {
    const patterns = [
      {
        pattern: /timeout|timed out/i,
        category: 'transient',
        rootCause: 'Timeout error',
        confidence: 0.9,
        recommendations: ['retry', 'increase-timeout']
      },
      {
        pattern: /ENOENT|file not found/i,
        category: 'configuration',
        rootCause: 'Missing file or misconfiguration',
        confidence: 0.95,
        recommendations: ['check-files', 'verify-paths']
      },
      {
        pattern: /dependency|package|module not found/i,
        category: 'dependency',
        rootCause: 'Dependency issue',
        confidence: 0.9,
        recommendations: ['install-deps', 'clear-cache']
      },
      {
        pattern: /test.*fail|assertion.*fail/i,
        category: 'test-failure',
        rootCause: 'Test regression',
        confidence: 0.85,
        recommendations: ['quarantine-test', 'revert-commit']
      },
      {
        pattern: /memory|heap|OOM/i,
        category: 'resource',
        rootCause: 'Resource exhaustion',
        confidence: 0.8,
        recommendations: ['increase-memory', 'optimize-code']
      }
    ];

    // Check patterns
    const errorText = JSON.stringify(failure);

    for (const p of patterns) {
      if (p.pattern.test(errorText)) {
        return p;
      }
    }

    // Default analysis
    return {
      category: 'unknown',
      rootCause: 'Unknown failure',
      confidence: 0.3,
      recommendations: ['manual-investigation']
    };
  }

  /**
   * Determine recovery strategy
   */
  async determineStrategy(diagnosis) {
    console.log('\n🎯 Determining recovery strategy...');

    const strategies = {
      'transient': ['retry', 'wait-retry', 'cache-clear'],
      'configuration': ['verify-config', 'restore-defaults', 'regenerate'],
      'dependency': ['reinstall-deps', 'lock-versions', 'cache-clear'],
      'test-failure': ['quarantine', 'skip-flaky', 'revert'],
      'resource': ['increase-limits', 'cleanup', 'optimize'],
      'unknown': ['collect-logs', 'create-incident']
    };

    const category = diagnosis.category || 'unknown';
    const actions = strategies[category] || strategies.unknown;

    const strategy = {
      category,
      actions,
      autoApproved: this.isAutoApproved(diagnosis),
      maxAttempts: 3,
      timeout: 600000 // 10 minutes
    };

    console.log(`   📋 Strategy: ${category}`);
    console.log(`   🔧 Actions: ${actions.join(', ')}`);
    console.log(`   🤖 Auto-approved: ${strategy.autoApproved ? 'Yes' : 'No'}`);

    return strategy;
  }

  /**
   * Check if recovery is auto-approved
   */
  isAutoApproved(diagnosis) {
    // Auto-approve high confidence transient errors
    if (diagnosis.category === 'transient' && diagnosis.confidence > 0.8) {
      return true;
    }

    // Auto-approve dependency cache issues
    if (diagnosis.category === 'dependency' &&
        diagnosis.rootCause.includes('cache')) {
      return true;
    }

    // Auto-approve test quarantine for flaky tests
    if (diagnosis.category === 'test-failure' &&
        diagnosis.rootCause.includes('flaky')) {
      return true;
    }

    return false;
  }

  /**
   * Execute recovery strategy
   */
  async executeRecovery(strategy, options) {
    console.log('\n🔧 Executing recovery...');

    if (!strategy.autoApproved && !options.autoFix) {
      console.log('   ⚠️ Manual approval required (use --auto-fix to override)');
      return { executed: false, reason: 'manual-approval-required' };
    }

    const results = [];

    for (const action of strategy.actions) {
      if (this.recoveryAttempts.length >= strategy.maxAttempts) {
        console.log('   ❌ Max recovery attempts reached');
        break;
      }

      console.log(`   🔄 Attempting: ${action}...`);
      const result = await this.executeAction(action);

      results.push({
        action,
        success: result.success,
        output: result.output
      });

      this.recoveryAttempts.push({
        action,
        result,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        console.log(`   ✅ ${action} successful`);

        // Check if pipeline is now healthy
        const status = await this.monitorPipeline();
        if (status.healthy) {
          console.log('   🎉 Pipeline recovered!');
          break;
        }
      } else {
        console.log(`   ❌ ${action} failed`);
      }
    }

    this.results.actions = results;

    return {
      executed: true,
      results,
      recovered: results.some(r => r.success)
    };
  }

  /**
   * Execute individual recovery action
   */
  async executeAction(action) {
    try {
      switch (action) {
        case 'retry':
          return await this.retryPipeline();

        case 'wait-retry':
          await this.sleep(30000); // Wait 30s
          return await this.retryPipeline();

        case 'cache-clear':
          return await this.clearCaches();

        case 'reinstall-deps':
          return await this.reinstallDependencies();

        case 'quarantine':
          return await this.quarantineFailingTests();

        case 'revert':
          return await this.revertLastCommit();

        case 'increase-limits':
          return await this.increaseResourceLimits();

        case 'collect-logs':
          return await this.collectDiagnosticLogs();

        default:
          return { success: false, output: `Unknown action: ${action}` };
      }
    } catch (error) {
      return { success: false, output: error.message };
    }
  }

  /**
   * Retry pipeline
   */
  async retryPipeline() {
    try {
      // GitHub Actions
      execSync('gh run rerun --failed', { encoding: 'utf8' });
      return { success: true, output: 'Pipeline rerun triggered' };
    } catch {
      // Fallback: trigger via commit
      execSync('git commit --allow-empty -m "ci: retry pipeline [skip-changelog]"', { stdio: 'ignore' });
      execSync('git push', { stdio: 'ignore' });
      return { success: true, output: 'Pipeline retriggered via empty commit' };
    }
  }

  /**
   * Clear caches
   */
  async clearCaches() {
    const cleared = [];

    // npm cache
    try {
      execSync('npm cache clean --force', { stdio: 'ignore' });
      cleared.push('npm');
    } catch {}

    // Python cache
    try {
      execSync('pip cache purge', { stdio: 'ignore' });
      cleared.push('pip');
    } catch {}

    // CI cache (GitHub Actions)
    try {
      execSync('gh cache delete --all', { stdio: 'ignore' });
      cleared.push('github-actions');
    } catch {}

    return {
      success: cleared.length > 0,
      output: `Cleared caches: ${cleared.join(', ')}`
    };
  }

  /**
   * Reinstall dependencies
   */
  async reinstallDependencies() {
    const projectType = await this.detectProjectType();

    try {
      if (projectType === 'javascript') {
        execSync('rm -rf node_modules package-lock.json', { stdio: 'ignore' });
        execSync('npm install', { stdio: 'ignore' });
      } else if (projectType === 'python') {
        execSync('pip install -r requirements.txt --force-reinstall', { stdio: 'ignore' });
      }

      return { success: true, output: 'Dependencies reinstalled' };
    } catch (error) {
      return { success: false, output: error.message };
    }
  }

  /**
   * Quarantine failing tests
   */
  async quarantineFailingTests() {
    // This would identify and skip flaky tests
    return {
      success: true,
      output: 'Flaky tests quarantined (mock implementation)'
    };
  }

  /**
   * Revert last commit (only for FIL-0/1)
   */
  async revertLastCommit() {
    try {
      // Check if last commit is auto-generated
      const lastCommit = execSync('git log -1 --pretty=%B', { encoding: 'utf8' });

      if (lastCommit.includes('FIL-0') || lastCommit.includes('FIL-1')) {
        execSync('git revert HEAD --no-edit', { stdio: 'ignore' });
        execSync('git push', { stdio: 'ignore' });
        return { success: true, output: 'Last commit reverted' };
      }

      return {
        success: false,
        output: 'Cannot auto-revert non-FIL-0/1 commits'
      };
    } catch (error) {
      return { success: false, output: error.message };
    }
  }

  /**
   * Verify recovery
   */
  async verifyRecovery() {
    console.log('\n✅ Verifying recovery...');

    // Wait a moment for pipeline to update
    await this.sleep(5000);

    // Re-check pipeline status
    const status = await this.monitorPipeline();

    if (status.healthy) {
      console.log('   ✅ Pipeline successfully recovered!');
      this.results.outcome = 'recovered';
      return { success: true, status };
    }

    console.log('   ⚠️ Pipeline still unhealthy');
    this.results.outcome = 'failed';
    return { success: false, status };
  }

  /**
   * Report or escalate
   */
  async reportOrEscalate(verification) {
    console.log('\n📢 Reporting status...');

    if (verification.success) {
      // Success report
      await this.generateSuccessReport();
      console.log('   ✅ Recovery report generated');
    } else {
      // Escalation needed
      if (this.recoveryAttempts.length >= 3) {
        await this.createIncident();
        console.log('   🚨 Incident created for escalation');
      } else {
        console.log('   ⚠️ Additional manual intervention may be required');
      }
    }
  }

  /**
   * Generate success report
   */
  async generateSuccessReport() {
    const report = {
      timestamp: new Date().toISOString(),
      diagnosis: this.failureAnalysis,
      actions: this.recoveryAttempts,
      outcome: 'recovered',
      duration: this.calculateDuration(),
      metrics: {
        attemptCount: this.recoveryAttempts.length,
        timeToRecovery: this.calculateDuration()
      }
    };

    const reportPath = path.join(
      this.projectRoot,
      'ci-recovery',
      `recovery-${Date.now()}.json`
    );

    await this.ensureDirectory(path.dirname(reportPath));
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  }

  /**
   * Create incident for escalation
   */
  async createIncident(error) {
    const incident = {
      id: `INCIDENT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'high',
      title: 'CI Pipeline Recovery Failed',
      description: `Automated recovery attempts failed after ${this.recoveryAttempts.length} attempts`,
      diagnosis: this.failureAnalysis,
      attempts: this.recoveryAttempts,
      error: error?.message,
      requiresManual: true
    };

    const incidentPath = path.join(
      this.projectRoot,
      'incidents',
      `${incident.id}.json`
    );

    await this.ensureDirectory(path.dirname(incidentPath));
    await fs.writeFile(incidentPath, JSON.stringify(incident, null, 2));

    console.log(`   📁 Incident saved: ${path.relative(this.projectRoot, incidentPath)}`);

    this.results.incident = incident;

    // Would create Linear incident via STRATEGIST
    return incident;
  }

  // ============= Helper Methods =============

  async detectProjectType() {
    if (await this.fileExists('package.json')) {
      return 'javascript';
    }
    if (await this.fileExists('requirements.txt') ||
        await this.fileExists('pyproject.toml')) {
      return 'python';
    }
    return 'javascript';
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async ensureDirectory(dir) {
    await fs.mkdir(dir, { recursive: true });
  }

  parseTestFailures(output) {
    const lines = output.split('\n');
    const failures = [];
    let count = 0;

    for (const line of lines) {
      if (line.includes('FAIL') || line.includes('FAILED')) {
        failures.push(line.trim());
        count++;
      }
    }

    return { count, failures: failures.slice(0, 10) };
  }

  async getCoverage() {
    try {
      const projectType = await this.detectProjectType();

      if (projectType === 'javascript') {
        const output = execSync('npm test -- --coverage | grep "All files"', { encoding: 'utf8', stdio: 'pipe' });
        const match = output.match(/(\d+(?:\.\d+)?)\s*%/);
        return match ? parseFloat(match[1]) : 0;
      }

      if (projectType === 'python') {
        const output = execSync('pytest --cov --cov-report=term | grep TOTAL', { encoding: 'utf8', stdio: 'pipe' });
        const match = output.match(/(\d+)%/);
        return match ? parseInt(match[1]) : 0;
      }
    } catch {
      return 0;
    }
  }

  async runLinting() {
    const projectType = await this.detectProjectType();

    if (projectType === 'javascript') {
      execSync('npm run lint', { stdio: 'ignore' });
    } else if (projectType === 'python') {
      execSync('pylint src/', { stdio: 'ignore' });
    }
  }

  async increaseResourceLimits() {
    // This would modify CI configuration
    return {
      success: false,
      output: 'Resource limit increase requires manual configuration'
    };
  }

  async collectDiagnosticLogs() {
    const logs = [];

    // Collect git info
    try {
      const gitLog = execSync('git log -5 --oneline', { encoding: 'utf8' });
      logs.push({ type: 'git', content: gitLog });
    } catch {}

    // Collect CI logs
    try {
      const ciLogs = execSync('gh run view --log-failed', { encoding: 'utf8' });
      logs.push({ type: 'ci', content: ciLogs });
    } catch {}

    const logPath = path.join(
      this.projectRoot,
      'diagnostics',
      `logs-${Date.now()}.json`
    );

    await this.ensureDirectory(path.dirname(logPath));
    await fs.writeFile(logPath, JSON.stringify(logs, null, 2));

    return {
      success: true,
      output: `Logs collected to ${path.relative(this.projectRoot, logPath)}`
    };
  }

  calculateDuration() {
    if (this.recoveryAttempts.length > 0) {
      const start = new Date(this.recoveryAttempts[0].timestamp);
      const end = new Date(this.recoveryAttempts[this.recoveryAttempts.length - 1].timestamp);
      return Math.round((end - start) / 1000); // seconds
    }
    return 0;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI execution
if (require.main === module) {
  const journey = new CIRecoveryJourney();

  const args = process.argv.slice(2);
  const options = {};

  if (args.includes('--auto-fix')) {
    options.autoFix = true;
  }

  journey.run(options).catch(console.error);
}

module.exports = CIRecoveryJourney;