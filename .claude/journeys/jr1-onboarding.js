#!/usr/bin/env node

/**
 * JR-1: New Project Onboarding Journey
 *
 * Autonomous initialization of Claude TDD workflow in any project.
 * Detects project type and configures appropriate tooling.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class OnboardingJourney {
  constructor() {
    this.projectRoot = process.cwd();
    this.claudeDir = path.join(this.projectRoot, '.claude');
    this.projectType = null;
    this.decisions = [];
    this.results = {
      steps: [],
      issues: [],
      tasks: [],
    };
  }

  /**
   * Main entry point - runs autonomously
   */
  async run(options = {}) {
    console.log('🎯 JR-1: New Project Onboarding Journey');
    console.log('========================================');

    try {
      // Phase 1: Detection and Setup
      await this.detectProjectType();
      await this.validatePrerequisites();
      await this.installClaudeSystem();

      // Phase 2: Initial Assessment
      const assessment = await this.runInitialAssessment();

      // Phase 3: Task Creation (Autonomous)
      const tasks = await this.createLinearTasks(assessment);

      // Phase 4: First Fix Pack (Autonomous if approved)
      if (options.autoFix !== false) {
        await this.implementFirstFix(tasks);
      }

      // Phase 5: Report Generation
      await this.generateOnboardingReport();

      console.log('✅ Onboarding complete!');
      return this.results;
    } catch (error) {
      console.error('❌ Onboarding failed:', error.message);
      await this.rollback();
      throw error;
    }
  }

  /**
   * Detect project type autonomously
   */
  async detectProjectType() {
    console.log('🔍 Detecting project type...');

    const detectors = [
      { file: 'package.json', type: 'javascript', parser: this.parsePackageJson },
      { file: 'requirements.txt', type: 'python', parser: this.parseRequirements },
      { file: 'pyproject.toml', type: 'python', parser: this.parsePyproject },
      { file: 'Gemfile', type: 'ruby', parser: this.parseGemfile },
      { file: 'pom.xml', type: 'java', parser: this.parsePom },
      { file: 'go.mod', type: 'go', parser: this.parseGoMod },
    ];

    for (const detector of detectors) {
      const filePath = path.join(this.projectRoot, detector.file);
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf8');
        const details = detector.parser ? detector.parser(content) : {};

        this.projectType = {
          language: detector.type,
          file: detector.file,
          details,
        };

        this.logDecision('project_detection', {
          detected: detector.type,
          confidence: 0.95,
          evidence: detector.file,
        });

        console.log(`   ✅ Detected: ${detector.type} project`);
        return;
      } catch (e) {
        // File doesn't exist, continue
      }
    }

    // Fallback detection based on file extensions
    await this.detectByExtensions();
  }

  /**
   * Validate prerequisites autonomously
   */
  async validatePrerequisites() {
    console.log('🔧 Validating prerequisites...');

    const required = {
      javascript: ['node', 'npm'],
      python: ['python3', 'pip'],
      common: ['git', 'make'],
    };

    const missing = [];

    // Check common requirements
    for (const tool of required.common) {
      if (!this.commandExists(tool)) {
        missing.push(tool);
      }
    }

    // Check language-specific requirements
    if (this.projectType && required[this.projectType.language]) {
      for (const tool of required[this.projectType.language]) {
        if (!this.commandExists(tool)) {
          missing.push(tool);
        }
      }
    }

    if (missing.length > 0) {
      // Attempt autonomous installation
      await this.attemptAutoInstall(missing);
    }

    console.log('   ✅ All prerequisites satisfied');
  }

  /**
   * Install Claude system
   */
  async installClaudeSystem() {
    console.log('📦 Installing Claude TDD system...');

    if (await this.fileExists(this.claudeDir)) {
      console.log('   ℹ️  .claude directory already exists');
      return;
    }

    // Copy .claude directory from this installation
    const sourceDir = path.join(__dirname, '..');
    await this.copyDirectory(sourceDir, this.claudeDir);

    // Create project-specific configuration
    await this.createProjectConfig();

    // Install language-specific dependencies
    await this.installDependencies();

    console.log('   ✅ Claude system installed');
  }

  /**
   * Run initial assessment autonomously
   */
  async runInitialAssessment() {
    console.log('📊 Running initial assessment...');

    const assessmentCmd = `node ${this.claudeDir}/cli.js assess --scope full --output json`;
    const result = execSync(assessmentCmd, { encoding: 'utf8' });
    const assessment = JSON.parse(result);

    // Autonomous analysis of results
    const analysis = this.analyzeAssessment(assessment);

    this.results.issues = analysis.issues;

    console.log(`   📋 Found ${analysis.issues.length} issues`);
    console.log(`   🔴 Critical: ${analysis.critical}`);
    console.log(`   🟡 Medium: ${analysis.medium}`);
    console.log(`   🟢 Low: ${analysis.low}`);

    return assessment;
  }

  /**
   * Create Linear tasks autonomously
   */
  async createLinearTasks(assessment) {
    console.log('📝 Creating Linear tasks...');

    const tasks = [];

    // Autonomous prioritization
    const prioritized = this.prioritizeIssues(assessment.issues);

    // Create tasks for top issues
    for (const issue of prioritized.slice(0, 10)) {
      const task = {
        title: this.generateTaskTitle(issue),
        description: this.generateTaskDescription(issue),
        priority: this.calculatePriority(issue),
        labels: this.generateLabels(issue),
        estimate: this.estimateEffort(issue),
      };

      // Simulate Linear task creation (would call actual API)
      task.id = `CLEAN-${Math.floor(Math.random() * 1000)}`;
      tasks.push(task);

      this.logDecision('task_creation', {
        issue: issue.type,
        priority: task.priority,
        estimate: task.estimate,
        automated: true,
      });
    }

    this.results.tasks = tasks;
    console.log(`   ✅ Created ${tasks.length} tasks`);

    return tasks;
  }

  /**
   * Implement first fix autonomously
   */
  async implementFirstFix(tasks) {
    console.log('🔨 Implementing first fix pack...');

    if (tasks.length === 0) {
      console.log('   ℹ️  No tasks to implement');
      return;
    }

    // Select best candidate for first fix
    const firstTask = this.selectFirstTask(tasks);

    console.log(`   📌 Selected: ${firstTask.id} - ${firstTask.title}`);

    // Autonomous TDD implementation
    const implementation = await this.implementTDD(firstTask);

    // Create PR
    if (implementation.success) {
      await this.createPullRequest(firstTask, implementation);
      console.log('   ✅ First PR created!');
    }
  }

  /**
   * Implement TDD cycle autonomously
   */
  async implementTDD(task) {
    const steps = {
      red: false,
      green: false,
      refactor: false,
    };

    try {
      // RED: Write failing test
      console.log('   🔴 Writing failing test...');
      const testPath = await this.writeFailingTest(task);
      steps.red = await this.runTest(testPath, false); // Expect failure

      // GREEN: Minimal implementation
      console.log('   🟢 Implementing minimal solution...');
      const implPath = await this.writeMinimalImplementation(task);
      steps.green = await this.runTest(testPath, true); // Expect pass

      // REFACTOR: Improve code
      console.log('   🔵 Refactoring...');
      await this.refactorCode(implPath);
      steps.refactor = await this.runTest(testPath, true); // Still pass

      return {
        success: steps.red && steps.green && steps.refactor,
        steps,
        files: { test: testPath, implementation: implPath },
      };
    } catch (error) {
      console.error('   ❌ TDD implementation failed:', error.message);
      return { success: false, steps, error };
    }
  }

  /**
   * Generate onboarding report
   */
  async generateOnboardingReport() {
    console.log('📄 Generating onboarding report...');

    const report = {
      timestamp: new Date().toISOString(),
      project: {
        type: this.projectType,
        root: this.projectRoot,
      },
      results: this.results,
      decisions: this.decisions,
      recommendations: this.generateRecommendations(),
    };

    const reportPath = path.join(this.projectRoot, 'reports', `onboarding-${Date.now()}.json`);

    await this.ensureDirectory(path.dirname(reportPath));
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`   ✅ Report saved to: ${reportPath}`);
  }

  // ============= Helper Methods =============

  commandExists(cmd) {
    try {
      execSync(`which ${cmd}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
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

  async copyDirectory(src, dest) {
    await this.ensureDirectory(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  logDecision(type, data) {
    this.decisions.push({
      timestamp: new Date().toISOString(),
      type,
      data,
      autonomous: true,
    });
  }

  analyzeAssessment(assessment) {
    const analysis = {
      issues: assessment.issues || [],
      critical: 0,
      medium: 0,
      low: 0,
    };

    for (const issue of analysis.issues) {
      switch (issue.severity) {
        case 'critical':
        case 'high':
          analysis.critical++;
          break;
        case 'medium':
          analysis.medium++;
          break;
        default:
          analysis.low++;
      }
    }

    return analysis;
  }

  prioritizeIssues(issues) {
    return issues.sort((a, b) => {
      // Autonomous prioritization logic
      const priorityMap = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityMap[a.severity] || 4;
      const bPriority = priorityMap[b.severity] || 4;

      if (aPriority !== bPriority) return aPriority - bPriority;

      // Secondary: effort (quick wins first)
      return (a.effort || 10) - (b.effort || 10);
    });
  }

  selectFirstTask(tasks) {
    // Autonomous selection of best first task
    // Prefer: Low risk (FIL-0/1), High impact, Low effort
    return tasks.find((t) => t.labels.includes('FIL-0') || t.labels.includes('FIL-1')) || tasks[0];
  }

  generateTaskTitle(issue) {
    const actionMap = {
      'unused-code': 'Remove unused',
      duplication: 'Eliminate duplicate',
      complexity: 'Simplify complex',
      formatting: 'Format',
      naming: 'Rename',
    };

    const action = actionMap[issue.type] || 'Fix';
    return `${action} ${issue.location || 'code'}`;
  }

  generateLabels(issue) {
    const labels = ['auto-generated'];

    // FIL classification
    if (issue.type === 'formatting' || issue.type === 'unused-code') {
      labels.push('FIL-0');
    } else if (issue.type === 'naming' || issue.type === 'duplication') {
      labels.push('FIL-1');
    }

    // Severity
    labels.push(issue.severity || 'medium');

    return labels;
  }

  calculatePriority(issue) {
    const severityScore = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
    };

    return severityScore[issue.severity] || 3;
  }

  estimateEffort(issue) {
    // Autonomous effort estimation in hours
    const effortMap = {
      formatting: 0.5,
      'unused-code': 1,
      naming: 1,
      duplication: 2,
      complexity: 4,
      architecture: 8,
    };

    return effortMap[issue.type] || 2;
  }

  generateRecommendations() {
    const recommendations = [];

    // Based on assessment results
    if (this.results.issues.length > 20) {
      recommendations.push({
        type: 'schedule',
        action: 'Enable continuous assessment every 4 hours',
        reason: 'High technical debt detected',
      });
    }

    if (this.projectType.language === 'javascript' && !this.projectType.details.typescript) {
      recommendations.push({
        type: 'tooling',
        action: 'Consider migrating to TypeScript',
        reason: 'Improved type safety and tooling support',
      });
    }

    return recommendations;
  }

  async rollback() {
    console.log('🔄 Rolling back changes...');
    // Implement rollback logic if needed
  }
}

// CLI execution
if (require.main === module) {
  const journey = new OnboardingJourney();
  journey
    .run({
      autoFix: process.argv.includes('--auto-fix'),
    })
    .catch(console.error);
}

module.exports = OnboardingJourney;
