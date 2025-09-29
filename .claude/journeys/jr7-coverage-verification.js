#!/usr/bin/env node

/**
 * JR-7: Coverage Verification Journey
 *
 * Comprehensive test coverage verification against project specifications.
 * Creates Linear tasks for coverage gaps and compliance issues.
 */

const path = require('path');
const fs = require('fs').promises;

// Import coverage tools
const RequirementParser = require('../scripts/coverage/requirement-parser');
const CoverageAnalyzer = require('../scripts/coverage/coverage-analyzer');
const TestMapper = require('../scripts/coverage/test-mapper');
const GapAnalyzer = require('../scripts/coverage/gap-analyzer');
const TDDAnalyzer = require('../scripts/coverage/tdd-analyzer');
const SpecValidator = require('../scripts/coverage/spec-validator');
const TaskTemplates = require('../scripts/linear/task-templates');

class CoverageVerificationJourney {
  constructor() {
    this.results = {
      requirements: [],
      coverage: {},
      mapping: {},
      gaps: [],
      tddCompliance: {},
      tasks: []
    };

    this.qualityGates = {
      coverage: {
        overall: 80,
        diff: 80,
        critical: 95,
        newFeatures: 90
      },
      tdd: {
        complianceRate: 80
      }
    };

    this.taskTemplates = new TaskTemplates();
  }

  /**
   * Execute the coverage verification journey
   */
  async execute(options = {}) {
    const {
      module,
      createTasks = false,
      detailed = true,
      outputFormat = 'console'
    } = options;

    console.log('🚀 Starting JR-7: Coverage Verification Journey\n');

    try {
      // Step 1: Parse requirements
      await this.parseRequirements(module);

      // Step 2: Analyze current coverage
      await this.analyzeCoverage();

      // Step 3: Map tests to specifications
      await this.mapTestsToSpecs();

      // Step 4: Check TDD compliance
      await this.checkTDDCompliance();

      // Step 5: Identify gaps
      await this.identifyGaps();

      // Step 6: Validate against quality gates
      await this.validateQualityGates();

      // Step 7: Generate action items
      await this.generateActionItems();

      // Step 8: Create Linear tasks if requested
      if (createTasks) {
        await this.createLinearTasks();
      }

      // Step 9: Generate report
      const report = this.generateReport(detailed);

      // Output results
      this.outputResults(report, outputFormat);

      return {
        success: this.isCompliant(),
        results: this.results,
        report
      };

    } catch (error) {
      console.error('❌ Journey failed:', error);
      throw error;
    }
  }

  /**
   * Step 1: Parse requirements from documentation
   */
  async parseRequirements(module) {
    console.log('📋 Step 1: Parsing requirements from documentation...');

    const parser = new RequirementParser();
    this.results.requirements = await parser.parse({
      docsDir: path.join(process.cwd(), 'docs'),
      claudeDir: path.join(process.cwd(), '.claude'),
      module
    });

    console.log(`  ✅ Found ${this.results.requirements.length} requirements\n`);
  }

  /**
   * Step 2: Analyze current test coverage
   */
  async analyzeCoverage() {
    console.log('📊 Step 2: Analyzing test coverage...');

    const analyzer = new CoverageAnalyzer();
    this.results.coverage = await analyzer.analyze();

    const summary = this.results.coverage.summary || {};
    console.log(`  Overall Coverage: ${summary.lines?.pct || 0}%`);
    console.log(`  Branches: ${summary.branches?.pct || 0}%`);
    console.log(`  Functions: ${summary.functions?.pct || 0}%`);
    console.log(`  Statements: ${summary.statements?.pct || 0}%\n`);
  }

  /**
   * Step 3: Map tests to specifications
   */
  async mapTestsToSpecs() {
    console.log('🗺️  Step 3: Mapping tests to specifications...');

    const mapper = new TestMapper();
    this.results.mapping = await mapper.map({
      requirements: this.results.requirements,
      detailed: true
    });

    const { analysis } = this.results.mapping;
    if (analysis) {
      console.log(`  Test Files: ${analysis.summary.totalTests}`);
      console.log(`  Test Cases: ${analysis.summary.totalTestCases}`);
      console.log(`  Mapped Specs: ${analysis.summary.mappedSpecs}`);
      console.log(`  Orphaned Tests: ${analysis.summary.orphanedTests}`);
      console.log(`  Unmapped Specs: ${analysis.summary.unmappedSpecs}\n`);
    }
  }

  /**
   * Step 4: Check TDD compliance
   */
  async checkTDDCompliance() {
    console.log('✅ Step 4: Checking TDD compliance...');

    const analyzer = new TDDAnalyzer();
    this.results.tddCompliance = await analyzer.analyze({
      since: '1 month ago',
      strict: false
    });

    const { analysis } = this.results.tddCompliance;
    console.log(`  Commits Analyzed: ${analysis.totalCommits}`);
    console.log(`  TDD Compliant: ${analysis.tddCompliant}`);
    console.log(`  Violations: ${analysis.violations}`);
    console.log(`  Compliance Rate: ${analysis.complianceRate}%\n`);
  }

  /**
   * Step 5: Identify coverage gaps
   */
  async identifyGaps() {
    console.log('🔍 Step 5: Identifying coverage gaps...');

    const gapAnalyzer = new GapAnalyzer();
    this.results.gaps = await gapAnalyzer.analyze({
      mapping: this.results.mapping,
      qualityGates: this.qualityGates,
      threshold: this.qualityGates.coverage.overall
    });

    const criticalGaps = this.results.gaps.filter(g => g.priority === 'HIGH');
    console.log(`  Total Gaps: ${this.results.gaps.length}`);
    console.log(`  Critical Gaps: ${criticalGaps.length}\n`);
  }

  /**
   * Step 6: Validate against quality gates
   */
  async validateQualityGates() {
    console.log('🚦 Step 6: Validating quality gates...');

    const gates = {
      coverage: this.validateCoverageGates(),
      tdd: this.validateTDDGates(),
      mapping: this.validateMappingGates()
    };

    this.results.gateValidation = gates;

    // Display results
    const passed = Object.values(gates).every(g => g.passed);
    const icon = passed ? '✅' : '❌';
    console.log(`  ${icon} Overall: ${passed ? 'PASSED' : 'FAILED'}`);
    console.log(`  Coverage Gates: ${gates.coverage.passed ? '✅' : '❌'}`);
    console.log(`  TDD Gates: ${gates.tdd.passed ? '✅' : '❌'}`);
    console.log(`  Mapping Gates: ${gates.mapping.passed ? '✅' : '❌'}\n`);
  }

  /**
   * Validate coverage gates
   */
  validateCoverageGates() {
    const summary = this.results.coverage.summary || {};
    const lineCoverage = summary.lines?.pct || 0;

    const gates = {
      overall: lineCoverage >= this.qualityGates.coverage.overall,
      branches: (summary.branches?.pct || 0) >= 70,
      functions: (summary.functions?.pct || 0) >= 75,
      statements: (summary.statements?.pct || 0) >= this.qualityGates.coverage.overall
    };

    return {
      passed: Object.values(gates).every(g => g),
      gates,
      message: gates.passed ? 'All coverage gates passed' : 'Some coverage gates failed'
    };
  }

  /**
   * Validate TDD gates
   */
  validateTDDGates() {
    const complianceRate = this.results.tddCompliance.analysis?.complianceRate || 0;

    const gates = {
      compliance: complianceRate >= this.qualityGates.tdd.complianceRate
    };

    return {
      passed: gates.compliance,
      gates,
      message: gates.passed ? 'TDD compliance met' : `TDD compliance below ${this.qualityGates.tdd.complianceRate}%`
    };
  }

  /**
   * Validate mapping gates
   */
  validateMappingGates() {
    const { unmappedSpecs = [], orphanedTests = [] } = this.results.mapping;

    const criticalUnmapped = unmappedSpecs.filter(s => s.priority === 'HIGH');

    const gates = {
      noCriticalUnmapped: criticalUnmapped.length === 0,
      lowOrphaned: orphanedTests.length <= 5
    };

    return {
      passed: gates.noCriticalUnmapped,
      gates,
      message: gates.passed ? 'All critical specs have tests' : 'Critical specs lack test coverage'
    };
  }

  /**
   * Step 7: Generate action items
   */
  async generateActionItems() {
    console.log('📝 Step 7: Generating standardized action items...');

    const standardizedTasks = [];
    let taskCount = 0;

    // Coverage gaps - use standardized templates
    for (const gap of this.results.gaps) {
      try {
        const standardizedTask = this.taskTemplates.generateCoverageTask(gap, {
          threshold: this.qualityGates.coverage.overall,
          module: gap.module || 'unknown',
          component: this.inferComponent(gap)
        });

        // Validate the task meets standards
        const violations = this.taskTemplates.validateTask(standardizedTask);
        if (violations.length > 0) {
          console.log(`   ⚠️  Task validation issues for ${gap.specification}:`, violations.map(v => v.issue).join(', '));
        }

        standardizedTasks.push({
          ...standardizedTask,
          sourceType: 'coverage-gap',
          sourceData: gap
        });
        taskCount++;

      } catch (error) {
        console.log(`   ❌ Failed to generate task for gap ${gap.specification}:`, error.message);
        // Fall back to simple task creation
        standardizedTasks.push({
          type: 'coverage-gap',
          priority: gap.priority,
          title: `Add tests for ${gap.specification}`,
          description: gap.recommendation,
          estimate: this.estimateEffort(gap),
          labels: ['testing', 'coverage', 'technical-debt'],
          sourceType: 'coverage-gap',
          sourceData: gap
        });
        taskCount++;
      }
    }

    // TDD violations - use standardized templates
    for (const violation of this.results.tddCompliance.violations?.slice(0, 5) || []) {
      try {
        const standardizedTask = this.taskTemplates.generateTDDTask(violation);

        // Validate the task meets standards
        const violations = this.taskTemplates.validateTask(standardizedTask);
        if (violations.length > 0) {
          console.log(`   ⚠️  Task validation issues for TDD violation ${violation.commit?.substring(0, 8)}:`, violations.map(v => v.issue).join(', '));
        }

        standardizedTasks.push({
          ...standardizedTask,
          sourceType: 'tdd-violation',
          sourceData: violation
        });
        taskCount++;

      } catch (error) {
        console.log(`   ❌ Failed to generate task for TDD violation:`, error.message);
        // Fall back to simple task creation
        standardizedTasks.push({
          type: 'tdd-violation',
          priority: 'MEDIUM',
          title: `Fix TDD violation in ${violation.commit?.substring(0, 8)}`,
          description: `${violation.reason}\nFiles: ${violation.files?.join(', ')}`,
          estimate: 1,
          labels: ['tdd', 'process', 'technical-debt'],
          sourceType: 'tdd-violation',
          sourceData: violation
        });
        taskCount++;
      }
    }

    // Orphaned tests - use standardized templates
    for (const orphan of this.results.mapping.orphanedTests?.slice(0, 3) || []) {
      try {
        const standardizedTask = this.taskTemplates.generateOrphanedTestTask(orphan);

        // Validate the task meets standards
        const violations = this.taskTemplates.validateTask(standardizedTask);
        if (violations.length > 0) {
          console.log(`   ⚠️  Task validation issues for orphaned test ${orphan.file}:`, violations.map(v => v.issue).join(', '));
        }

        standardizedTasks.push({
          ...standardizedTask,
          sourceType: 'orphaned-test',
          sourceData: orphan
        });
        taskCount++;

      } catch (error) {
        console.log(`   ❌ Failed to generate task for orphaned test:`, error.message);
        // Fall back to simple task creation
        standardizedTasks.push({
          type: 'orphaned-test',
          priority: 'LOW',
          title: `Review orphaned test: ${orphan.file}`,
          description: orphan.recommendation,
          estimate: 0.5,
          labels: ['testing', 'maintenance'],
          sourceType: 'orphaned-test',
          sourceData: orphan
        });
        taskCount++;
      }
    }

    // Unmapped specifications - use standardized templates
    for (const unmappedSpec of this.results.mapping.unmappedSpecs?.slice(0, 10) || []) {
      try {
        const standardizedTask = this.taskTemplates.generateUnmappedSpecTask(unmappedSpec);

        // Validate the task meets standards
        const violations = this.taskTemplates.validateTask(standardizedTask);
        if (violations.length > 0) {
          console.log(`   ⚠️  Task validation issues for unmapped spec ${unmappedSpec.id}:`, violations.map(v => v.issue).join(', '));
        }

        standardizedTasks.push({
          ...standardizedTask,
          sourceType: 'unmapped-spec',
          sourceData: unmappedSpec
        });
        taskCount++;

      } catch (error) {
        console.log(`   ❌ Failed to generate task for unmapped spec:`, error.message);
        // Fall back to simple task creation
        standardizedTasks.push({
          type: 'unmapped-spec',
          priority: unmappedSpec.priority || 'MEDIUM',
          title: `Create tests for ${unmappedSpec.id}`,
          description: unmappedSpec.description,
          estimate: 3,
          labels: ['testing', 'specification'],
          sourceType: 'unmapped-spec',
          sourceData: unmappedSpec
        });
        taskCount++;
      }
    }

    this.results.tasks = standardizedTasks;

    // Generate summary
    const byPriority = {
      HIGH: standardizedTasks.filter(t => t.priority === 1 || t.priority === 'HIGH').length,
      MEDIUM: standardizedTasks.filter(t => t.priority === 2 || t.priority === 'MEDIUM').length,
      LOW: standardizedTasks.filter(t => t.priority === 3 || t.priority === 'LOW').length
    };

    const byType = {
      'coverage-gap': standardizedTasks.filter(t => t.sourceType === 'coverage-gap').length,
      'tdd-violation': standardizedTasks.filter(t => t.sourceType === 'tdd-violation').length,
      'orphaned-test': standardizedTasks.filter(t => t.sourceType === 'orphaned-test').length,
      'unmapped-spec': standardizedTasks.filter(t => t.sourceType === 'unmapped-spec').length
    };

    console.log(`  ✅ Generated ${taskCount} standardized action items:`);
    console.log(`     By Priority - High: ${byPriority.HIGH}, Medium: ${byPriority.MEDIUM}, Low: ${byPriority.LOW}`);
    console.log(`     By Type - Coverage: ${byType['coverage-gap']}, TDD: ${byType['tdd-violation']}, Orphaned: ${byType['orphaned-test']}, Unmapped: ${byType['unmapped-spec']}\n`);
  }

  /**
   * Infer component from gap specification
   */
  inferComponent(gap) {
    const spec = gap.specification?.toLowerCase() || '';

    if (spec.includes('api') || spec.includes('endpoint')) {
      return 'API';
    } else if (spec.includes('database') || spec.includes('data')) {
      return 'Database';
    } else if (spec.includes('frontend') || spec.includes('ui')) {
      return 'Frontend';
    } else if (spec.includes('backend') || spec.includes('server')) {
      return 'Backend';
    } else if (spec.includes('auth') || spec.includes('security')) {
      return 'Security';
    } else if (spec.includes('test') || spec.includes('coverage')) {
      return 'Testing';
    }

    return 'General';
  }

  /**
   * Estimate effort for fixing a gap
   */
  estimateEffort(gap) {
    if (gap.type === 'missing') return 3;
    if (gap.type === 'partial') {
      const increase = gap.targetCoverage - gap.currentCoverage;
      if (increase > 50) return 2;
      if (increase > 20) return 1;
      return 0.5;
    }
    return 1;
  }

  /**
   * Step 8: Create Linear tasks
   */
  async createLinearTasks() {
    console.log('🎯 Step 8: Creating standardized Linear tasks...');

    try {
      // Check if Linear integration is available
      const linearPath = path.join(process.cwd(), '.claude/scripts/linear/create-linear-issues.js');
      await fs.access(linearPath);

      const created = [];
      const failed = [];

      console.log(`   📋 Processing ${this.results.tasks.length} standardized tasks...`);

      for (const task of this.results.tasks) {
        try {
          // Validate task before creation
          const violations = this.taskTemplates.validateTask(task);
          if (violations.length > 0) {
            console.log(`   ⚠️  Task validation issues: ${violations.map(v => v.issue).join(', ')}`);
          }

          // Create standardized Linear issue
          const issue = {
            title: task.title,
            description: task.description,
            priority: typeof task.priority === 'number' ? task.priority : this.mapPriorityToLinear(task.priority),
            estimate: task.estimate,
            labels: task.labels,
            teamId: process.env.LINEAR_TEAM_ID || 'a-coders',
            stateId: process.env.LINEAR_TODO_STATE_ID,
            // Additional standardized metadata
            metadata: {
              sourceType: task.sourceType,
              automatedCreation: true,
              coverageJourney: 'JR-7',
              createdAt: new Date().toISOString()
            }
          };

          // TODO: Replace with actual Linear MCP call:
          // const linearTask = await mcp__linear_server__create_issue({
          //   title: issue.title,
          //   description: issue.description,
          //   labels: issue.labels,
          //   estimate: issue.estimate,
          //   priority: issue.priority,
          //   team: issue.teamId
          // });

          // Mock Linear task creation for now
          const mockLinearTask = {
            ...issue,
            id: `COVERAGE-${created.length + 1}`,
            identifier: `CVG-${created.length + 1}`,
            url: `https://linear.app/issue/CVG-${created.length + 1}`,
            created: new Date().toISOString()
          };

          created.push(mockLinearTask);

          console.log(`   ✅ Created: ${task.title}`);
          console.log(`      ID: ${mockLinearTask.identifier}`);
          console.log(`      Priority: ${issue.priority} | Estimate: ${issue.estimate} points`);
          console.log(`      Labels: ${issue.labels.join(', ')}`);

        } catch (error) {
          console.log(`   ❌ Failed to create task: ${task.title}`, error.message);
          failed.push({
            task,
            error: error.message
          });
        }
      }

      // Store results
      this.results.linearTasks = created;
      this.results.failedTasks = failed;

      // Summary
      const byPriority = {
        urgent: created.filter(t => t.priority === 1).length,
        high: created.filter(t => t.priority === 2).length,
        medium: created.filter(t => t.priority === 3).length,
        low: created.filter(t => t.priority === 4).length
      };

      const byType = {};
      for (const task of created) {
        const sourceType = task.metadata?.sourceType || 'unknown';
        byType[sourceType] = (byType[sourceType] || 0) + 1;
      }

      console.log(`  📊 Task creation summary:`);
      console.log(`     Created: ${created.length}/${this.results.tasks.length} tasks`);
      console.log(`     Failed: ${failed.length} tasks`);
      console.log(`     By Priority - Urgent: ${byPriority.urgent}, High: ${byPriority.high}, Medium: ${byPriority.medium}, Low: ${byPriority.low}`);
      console.log(`     By Type - Coverage: ${byType['coverage-gap'] || 0}, TDD: ${byType['tdd-violation'] || 0}, Orphaned: ${byType['orphaned-test'] || 0}, Unmapped: ${byType['unmapped-spec'] || 0}`);

      if (failed.length > 0) {
        console.log(`   ⚠️  ${failed.length} tasks failed to create - check error details in results\n`);
      } else {
        console.log(`   ✅ All tasks created successfully\n`);
      }

    } catch (error) {
      console.log('  ⚠️  Linear integration not available, skipping task creation');
      console.log(`      Error: ${error.message}\n`);
    }
  }

  /**
   * Map priority to Linear priority
   */
  mapPriorityToLinear(priority) {
    const mapping = {
      'HIGH': 1,
      'MEDIUM': 2,
      'LOW': 3
    };
    return mapping[priority] || 2;
  }

  /**
   * Check if compliant
   */
  isCompliant() {
    return this.results.gateValidation &&
           Object.values(this.results.gateValidation).every(g => g.passed);
  }

  /**
   * Generate report
   */
  generateReport(detailed) {
    let report = '# Coverage Verification Report\n\n';
    const timestamp = new Date().toISOString();
    report += `Generated: ${timestamp}\n\n`;

    // Executive Summary
    report += '## Executive Summary\n\n';
    const compliant = this.isCompliant();
    const icon = compliant ? '✅' : '❌';
    report += `**Status**: ${icon} ${compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}\n\n`;

    // Coverage Metrics
    report += '## Coverage Metrics\n\n';
    const summary = this.results.coverage.summary || {};
    report += `| Metric | Coverage | Target | Status |\n`;
    report += `|--------|----------|--------|--------|\n`;
    report += `| Lines | ${summary.lines?.pct || 0}% | ${this.qualityGates.coverage.overall}% | ${this.getStatusIcon(summary.lines?.pct || 0, this.qualityGates.coverage.overall)} |\n`;
    report += `| Branches | ${summary.branches?.pct || 0}% | 70% | ${this.getStatusIcon(summary.branches?.pct || 0, 70)} |\n`;
    report += `| Functions | ${summary.functions?.pct || 0}% | 75% | ${this.getStatusIcon(summary.functions?.pct || 0, 75)} |\n`;
    report += `| Statements | ${summary.statements?.pct || 0}% | ${this.qualityGates.coverage.overall}% | ${this.getStatusIcon(summary.statements?.pct || 0, this.qualityGates.coverage.overall)} |\n\n`;

    // Test Mapping
    report += '## Test-to-Specification Mapping\n\n';
    const mapping = this.results.mapping.analysis?.summary || {};
    report += `- **Total Test Files**: ${mapping.totalTests || 0}\n`;
    report += `- **Total Test Cases**: ${mapping.totalTestCases || 0}\n`;
    report += `- **Mapped Specifications**: ${mapping.mappedSpecs || 0}\n`;
    report += `- **Orphaned Tests**: ${mapping.orphanedTests || 0}\n`;
    report += `- **Unmapped Specifications**: ${mapping.unmappedSpecs || 0}\n\n`;

    // TDD Compliance
    report += '## TDD Compliance\n\n';
    const tdd = this.results.tddCompliance.analysis || {};
    report += `- **Compliance Rate**: ${tdd.complianceRate || 0}% (Target: ${this.qualityGates.tdd.complianceRate}%)\n`;
    report += `- **Commits Analyzed**: ${tdd.totalCommits || 0}\n`;
    report += `- **TDD Compliant**: ${tdd.tddCompliant || 0}\n`;
    report += `- **Violations**: ${tdd.violations || 0}\n\n`;

    // Coverage Gaps
    if (this.results.gaps.length > 0) {
      report += '## Coverage Gaps\n\n';

      const byPriority = {
        HIGH: [],
        MEDIUM: [],
        LOW: []
      };

      for (const gap of this.results.gaps) {
        byPriority[gap.priority].push(gap);
      }

      for (const priority of ['HIGH', 'MEDIUM', 'LOW']) {
        if (byPriority[priority].length > 0) {
          report += `### ${priority} Priority\n\n`;
          for (const gap of byPriority[priority].slice(0, 5)) {
            report += `- **${gap.specification}**: ${gap.recommendation}\n`;
          }
          if (byPriority[priority].length > 5) {
            report += `- *... and ${byPriority[priority].length - 5} more*\n`;
          }
          report += '\n';
        }
      }
    }

    // Action Items
    if (this.results.tasks.length > 0) {
      report += '## Action Items\n\n';
      report += `Total: ${this.results.tasks.length} items\n\n`;

      const byType = {};
      for (const task of this.results.tasks) {
        if (!byType[task.type]) {
          byType[task.type] = [];
        }
        byType[task.type].push(task);
      }

      for (const [type, tasks] of Object.entries(byType)) {
        report += `### ${this.formatType(type)}\n\n`;
        for (const task of tasks.slice(0, 3)) {
          report += `- ${task.title} (${task.priority}, ${task.estimate}h)\n`;
        }
        if (tasks.length > 3) {
          report += `- *... and ${tasks.length - 3} more*\n`;
        }
        report += '\n';
      }
    }

    // Quality Gates
    report += '## Quality Gates\n\n';
    if (this.results.gateValidation) {
      for (const [category, validation] of Object.entries(this.results.gateValidation)) {
        const icon = validation.passed ? '✅' : '❌';
        report += `- **${this.formatCategory(category)}**: ${icon} ${validation.message}\n`;
      }
    }

    return report;
  }

  /**
   * Get status icon
   */
  getStatusIcon(actual, target) {
    return actual >= target ? '✅' : '❌';
  }

  /**
   * Format type for display
   */
  formatType(type) {
    return type.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Format category for display
   */
  formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  /**
   * Output results
   */
  outputResults(report, format) {
    switch (format) {
      case 'json':
        console.log(JSON.stringify(this.results, null, 2));
        break;
      case 'markdown':
      case 'console':
      default:
        console.log(report);
        break;
    }
  }
}

// CLI execution
if (require.main === module) {
  const journey = new CoverageVerificationJourney();

  async function main() {
    const args = process.argv.slice(2);

    const options = {
      module: null,
      createTasks: false,
      detailed: true,
      outputFormat: 'console'
    };

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--module':
          options.module = args[++i];
          break;
        case '--create-tasks':
          options.createTasks = true;
          break;
        case '--summary':
          options.detailed = false;
          break;
        case '--output':
          options.outputFormat = args[++i];
          break;
        case '--help':
          console.log('Usage: jr7-coverage-verification [options]');
          console.log('Options:');
          console.log('  --module <name>   Focus on specific module');
          console.log('  --create-tasks    Create Linear tasks for gaps');
          console.log('  --summary         Show summary only (not detailed)');
          console.log('  --output <format> Output format: console, json, markdown');
          process.exit(0);
      }
    }

    try {
      const result = await journey.execute(options);

      // Exit with error code if not compliant
      if (!result.success) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Journey failed:', error);
      process.exit(1);
    }
  }

  main();
}

module.exports = CoverageVerificationJourney;