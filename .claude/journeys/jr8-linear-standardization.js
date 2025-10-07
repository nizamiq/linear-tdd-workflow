#!/usr/bin/env node

/**
 * JR-8: Linear Data Quality & Standardization Journey
 *
 * Comprehensive Linear issue standardization framework that audits, validates,
 * and updates existing Linear issues to ensure conformance with project
 * specifications and eliminate duplicates.
 */

const fs = require('fs').promises;
const path = require('path');

// Import standardization tools
const TaskTemplates = require('../scripts/linear/task-templates');
const TestingTaskValidator = require('../scripts/linear/testing-task-validator');
const { linearConfig } = require('../config/linear.config.js');

class LinearStandardizationJourney {
  constructor() {
    this.results = {
      audit: {
        totalIssues: 0,
        analyzedIssues: 0,
        violationsFound: 0,
        duplicatesFound: 0,
        orphanedIssues: 0,
      },
      standardization: {
        updated: 0,
        created: 0,
        archived: 0,
        merged: 0,
        failed: 0,
      },
      compliance: {
        beforeRate: 0,
        afterRate: 0,
        improvement: 0,
      },
      issues: [],
      violations: [],
      duplicates: [],
      actions: [],
    };

    this.qualityGates = {
      format: {
        titleMaxLength: 60,
        descriptionMinLength: 50,
        requiresEstimate: true,
        requiresLabels: true,
        requiresPriority: true,
      },
      content: {
        requiresAcceptanceCriteria: true,
        requiresUserStoryFormat: false, // For user-facing features
        requiresTechnicalDetails: true, // For bugs
      },
      labels: {
        requiredTypeLabels: ['feature', 'bug', 'task', 'improvement', 'spike'],
        requiredPriorityLabels: ['p0-urgent', 'p1-high', 'p2-medium', 'p3-low'],
        testingLabels: ['testing', 'coverage', 'tdd', 'specification'],
      },
      estimation: {
        maxStoryPoints: 13,
        requiresFibonacci: true,
        suggestBreakdown: 8,
      },
    };

    this.taskTemplates = new TaskTemplates();
    this.testingValidator = new TestingTaskValidator();
  }

  /**
   * Generate dynamic task ID using configured prefix
   */
  generateTaskId(taskPrefix, number) {
    const prefix = taskPrefix?.endsWith('-') ? taskPrefix : `${taskPrefix}-`;
    return `${prefix}${number}`;
  }

  /**
   * Execute the Linear standardization journey
   */
  async execute(options = {}) {
    const {
      project = null, // Will be determined from LINEAR_PROJECT_ID or detected
      dryRun = false,
      updateMode = 'conservative', // aggressive, conservative, interactive
      duplicateHandling = 'merge', // merge, flag, archive
      scope = 'all', // all, mvp, current-cycle, specific-label
      createTasks = false,
    } = options;

    console.log('🚀 Starting JR-8: Linear Data Quality & Standardization Journey\n');

    // Get Linear configuration
    let config;
    try {
      config = linearConfig.getConfig();
    } catch (error) {
      console.error('❌ Linear configuration error:', error.message);
      console.log('\n💡 Please configure Linear integration:');
      console.log('   - Set LINEAR_API_KEY environment variable');
      console.log('   - Set LINEAR_TEAM_ID environment variable');
      console.log('   - Optionally set LINEAR_PROJECT_ID and LINEAR_TASK_PREFIX');
      throw error;
    }

    // Resolve project from configuration
    const resolvedProject = project || config.workspace.projectId || config.workspace.teamId;
    const taskPrefix = config.tasks.prefix || 'TASK';

    console.log(`   Project/Team: ${resolvedProject}`);
    console.log(`   Task Prefix: ${taskPrefix}`);
    console.log(`   Mode: ${updateMode} (dry-run: ${dryRun})`);
    console.log(`   Scope: ${scope}`);
    console.log(`   Duplicate Handling: ${duplicateHandling}\n`);

    try {
      // Step 1: Discovery and Analysis
      await this.discoverAndAnalyzeIssues(project, scope);

      // Step 2: Validate issue format and content
      await this.validateIssueCompliance();

      // Step 3: Detect duplicates
      await this.detectDuplicates();

      // Step 4: Generate standardization actions
      await this.generateStandardizationActions(updateMode);

      // Step 5: Execute standardization (if not dry run)
      if (!dryRun) {
        await this.executeStandardization(duplicateHandling);
      }

      // Step 6: Create follow-up tasks if requested
      if (createTasks) {
        await this.createFollowupTasks();
      }

      // Step 7: Generate compliance report
      const report = this.generateComplianceReport();

      // Output results
      this.outputResults(report, dryRun);

      return {
        success: true,
        results: this.results,
        report,
        complianceImproved: this.results.compliance.improvement > 0,
      };
    } catch (error) {
      console.error('❌ Linear standardization journey failed:', error);
      throw error;
    }
  }

  /**
   * Step 1: Discovery and Analysis
   */
  async discoverAndAnalyzeIssues(project, scope) {
    console.log('🔍 Step 1: Discovering and analyzing Linear issues...');

    try {
      // Get all issues in project (placeholder - would use Linear MCP in real implementation)
      const issues = await this.fetchLinearIssues(resolvedProject, scope, taskPrefix);

      this.results.audit.totalIssues = issues.length;
      this.results.issues = issues;

      console.log(`   ✅ Found ${issues.length} issues in scope "${scope}"`);

      // Build issue inventory
      const inventory = this.buildIssueInventory(issues);

      console.log(`   📊 Issue Inventory:`);
      console.log(`      By State: ${JSON.stringify(inventory.byState)}`);
      console.log(`      Missing Estimates: ${inventory.missingEstimates}`);
      console.log(`      Missing Descriptions: ${inventory.missingDescriptions}`);
      console.log(`      Orphaned Issues: ${inventory.orphaned}`);
      console.log(`      Unlabeled Issues: ${inventory.unlabeled}\n`);

      this.results.audit.orphanedIssues = inventory.orphaned;
    } catch (error) {
      console.log('   ⚠️  Could not fetch Linear issues (using mock data)');
      // Use mock data for demonstration
      this.results.issues = this.generateMockIssues();
      this.results.audit.totalIssues = this.results.issues.length;
    }
  }

  /**
   * Fetch Linear issues using MCP tools
   */
  async fetchLinearIssues(project, scope, taskPrefix = 'TASK') {
    // This would use the Linear MCP server in a real implementation
    // For now, return mock data

    const mockIssues = [
      {
        id: this.generateTaskId(taskPrefix, 1),
        title: 'fix auth issue',
        description: 'auth not working',
        priority: null,
        estimate: null,
        labels: [],
        state: 'Todo',
        team: project,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: this.generateTaskId(taskPrefix, 2),
        title: 'Implement comprehensive test coverage for user authentication module',
        description: `## User Story
As a developer
I want comprehensive test coverage for the user authentication module
So that I can ensure security and reliability

## Acceptance Criteria
- [ ] Unit tests for all authentication functions
- [ ] Integration tests for auth API endpoints
- [ ] Security tests for edge cases
- [ ] Coverage ≥90% for authentication module`,
        priority: 2,
        estimate: 5,
        labels: ['testing', 'coverage', 'p1-high', 'security'],
        state: 'Todo',
        team: project,
        createdAt: '2024-01-16T10:00:00Z',
      },
      {
        id: this.generateTaskId(taskPrefix, 3),
        title: 'auth problem',
        description: 'users cannot login sometimes',
        priority: 1,
        estimate: null,
        labels: ['bug'],
        state: 'In Progress',
        team: project,
        createdAt: '2024-01-17T10:00:00Z',
      },
    ];

    // Apply scope filtering
    switch (scope) {
      case 'mvp':
        return mockIssues.filter((issue) => issue.labels.includes('mvp'));
      case 'current-cycle':
        return mockIssues; // Would filter by current cycle in real implementation
      case 'testing':
        return mockIssues.filter((issue) =>
          issue.labels.some((label) => ['testing', 'coverage', 'tdd'].includes(label)),
        );
      default:
        return mockIssues;
    }
  }

  /**
   * Build issue inventory
   */
  buildIssueInventory(issues) {
    const inventory = {
      byState: {},
      byPriority: {},
      missingEstimates: 0,
      missingDescriptions: 0,
      orphaned: 0,
      unlabeled: 0,
      potentialDuplicates: 0,
    };

    for (const issue of issues) {
      // Group by state
      inventory.byState[issue.state] = (inventory.byState[issue.state] || 0) + 1;

      // Group by priority
      const priority = issue.priority || 'None';
      inventory.byPriority[priority] = (inventory.byPriority[priority] || 0) + 1;

      // Count missing fields
      if (!issue.estimate) inventory.missingEstimates++;
      if (!issue.description || issue.description.length < 10) inventory.missingDescriptions++;
      if (!issue.labels || issue.labels.length === 0) inventory.unlabeled++;
      if (!issue.project && !issue.parent) inventory.orphaned++;
    }

    return inventory;
  }

  /**
   * Step 2: Validate issue compliance
   */
  async validateIssueCompliance() {
    console.log('✅ Step 2: Validating issue compliance...');

    let violationsCount = 0;
    const violations = [];

    for (const issue of this.results.issues) {
      const issueViolations = this.validateIssueFormat(issue);

      if (issueViolations.length > 0) {
        violationsCount++;
        violations.push({
          issue: issue.id,
          title: issue.title,
          violations: issueViolations,
        });
      }

      // Special validation for testing tasks
      if (this.isTestingTask(issue)) {
        const testingValidation = this.testingValidator.validateTestingTask(issue, {
          strict: false,
          project: 'linear-tdd-workflow',
        });

        if (!testingValidation.isValid) {
          violations.push({
            issue: issue.id,
            title: issue.title,
            type: 'testing-specific',
            violations: testingValidation.violations,
            recommendations: testingValidation.recommendations,
          });
        }
      }
    }

    this.results.audit.violationsFound = violationsCount;
    this.results.violations = violations;

    console.log(`   📋 Validation Results:`);
    console.log(`      Issues with violations: ${violationsCount}/${this.results.issues.length}`);
    console.log(
      `      Compliance rate: ${Math.round(((this.results.issues.length - violationsCount) / this.results.issues.length) * 100)}%\n`,
    );

    this.results.compliance.beforeRate = Math.round(
      ((this.results.issues.length - violationsCount) / this.results.issues.length) * 100,
    );
  }

  /**
   * Validate individual issue format
   */
  validateIssueFormat(issue) {
    const violations = [];

    // Title validation
    if (!issue.title || issue.title.length === 0) {
      violations.push({ field: 'title', issue: 'missing', severity: 'error' });
    } else if (issue.title.length > this.qualityGates.format.titleMaxLength) {
      violations.push({ field: 'title', issue: 'too_long', severity: 'warning' });
    } else if (!issue.title[0].match(/[A-Z]/)) {
      violations.push({ field: 'title', issue: 'not_capitalized', severity: 'warning' });
    }

    // Check for action verb
    if (!this.startsWithActionVerb(issue.title)) {
      violations.push({ field: 'title', issue: 'missing_action_verb', severity: 'info' });
    }

    // Description validation
    if (
      !issue.description ||
      issue.description.length < this.qualityGates.format.descriptionMinLength
    ) {
      violations.push({ field: 'description', issue: 'too_short', severity: 'error' });
    }

    // Check for acceptance criteria
    if (
      this.qualityGates.content.requiresAcceptanceCriteria &&
      !this.hasAcceptanceCriteria(issue.description)
    ) {
      violations.push({
        field: 'description',
        issue: 'missing_acceptance_criteria',
        severity: 'warning',
      });
    }

    // Estimate validation
    if (this.qualityGates.format.requiresEstimate && !issue.estimate) {
      violations.push({ field: 'estimate', issue: 'missing', severity: 'error' });
    } else if (issue.estimate && issue.estimate > this.qualityGates.estimation.maxStoryPoints) {
      violations.push({ field: 'estimate', issue: 'too_large', severity: 'warning' });
    }

    // Priority validation
    if (this.qualityGates.format.requiresPriority && !issue.priority) {
      violations.push({ field: 'priority', issue: 'missing', severity: 'warning' });
    }

    // Labels validation
    if (this.qualityGates.format.requiresLabels && (!issue.labels || issue.labels.length === 0)) {
      violations.push({ field: 'labels', issue: 'missing', severity: 'error' });
    } else if (issue.labels) {
      // Check for required type labels
      const hasTypeLabel = this.qualityGates.labels.requiredTypeLabels.some((label) =>
        issue.labels.includes(label),
      );
      if (!hasTypeLabel) {
        violations.push({ field: 'labels', issue: 'missing_type_label', severity: 'warning' });
      }
    }

    return violations;
  }

  /**
   * Check if issue is a testing task
   */
  isTestingTask(issue) {
    const testingKeywords = ['test', 'coverage', 'tdd', 'specification'];
    return (
      issue.labels?.some((label) => testingKeywords.includes(label)) ||
      testingKeywords.some(
        (keyword) =>
          issue.title?.toLowerCase().includes(keyword) ||
          issue.description?.toLowerCase().includes(keyword),
      )
    );
  }

  /**
   * Check if title starts with action verb
   */
  startsWithActionVerb(title) {
    if (!title) return false;

    const actionVerbs = [
      'add',
      'implement',
      'create',
      'build',
      'develop',
      'fix',
      'resolve',
      'correct',
      'repair',
      'update',
      'modify',
      'change',
      'improve',
      'enhance',
      'remove',
      'delete',
      'clean',
      'refactor',
      'test',
      'validate',
      'verify',
      'check',
      'investigate',
      'research',
      'analyze',
    ];

    const firstWord = title.toLowerCase().split(' ')[0];
    return actionVerbs.includes(firstWord);
  }

  /**
   * Check if description has acceptance criteria
   */
  hasAcceptanceCriteria(description) {
    if (!description) return false;

    return (
      description.includes('Acceptance Criteria') ||
      description.includes('- [ ]') ||
      description.includes('- [x]')
    );
  }

  /**
   * Step 3: Detect duplicates
   */
  async detectDuplicates() {
    console.log('🔍 Step 3: Detecting duplicate issues...');

    const duplicates = [];

    for (let i = 0; i < this.results.issues.length; i++) {
      for (let j = i + 1; j < this.results.issues.length; j++) {
        const issue1 = this.results.issues[i];
        const issue2 = this.results.issues[j];

        const similarity = this.calculateSimilarity(issue1, issue2);

        if (similarity.isDuplicate) {
          duplicates.push({
            issues: [issue1.id, issue2.id],
            similarity: similarity.score,
            type: similarity.type,
            primary: similarity.score > 0.9 ? issue1.id : null,
            secondary: similarity.score > 0.9 ? issue2.id : null,
            recommendation: this.getDuplicateRecommendation(similarity),
          });
        }
      }
    }

    this.results.duplicates = duplicates;
    this.results.audit.duplicatesFound = duplicates.length;

    console.log(`   🔍 Duplicate Detection Results:`);
    console.log(`      Potential duplicates found: ${duplicates.length}`);
    console.log(`      High confidence: ${duplicates.filter((d) => d.similarity > 0.9).length}`);
    console.log(
      `      Medium confidence: ${duplicates.filter((d) => d.similarity > 0.7 && d.similarity <= 0.9).length}\n`,
    );
  }

  /**
   * Calculate similarity between two issues
   */
  calculateSimilarity(issue1, issue2) {
    // Title similarity
    const titleSimilarity = this.calculateTextSimilarity(issue1.title, issue2.title);

    // Description similarity
    const descSimilarity = this.calculateTextSimilarity(
      issue1.description?.substring(0, 200) || '',
      issue2.description?.substring(0, 200) || '',
    );

    // Overall similarity
    const overallSimilarity = titleSimilarity * 0.7 + descSimilarity * 0.3;

    return {
      isDuplicate: titleSimilarity > 0.8 || overallSimilarity > 0.75,
      score: overallSimilarity,
      type: titleSimilarity > 0.85 ? 'title_match' : 'content_match',
      titleSimilarity,
      descSimilarity,
    };
  }

  /**
   * Calculate text similarity using simple word overlap
   */
  calculateTextSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Get duplicate recommendation
   */
  getDuplicateRecommendation(similarity) {
    if (similarity.score > 0.9) {
      return 'merge';
    } else if (similarity.score > 0.75) {
      return 'flag_for_review';
    } else {
      return 'monitor';
    }
  }

  /**
   * Step 4: Generate standardization actions
   */
  async generateStandardizationActions(updateMode) {
    console.log('📝 Step 4: Generating standardization actions...');

    const actions = [];

    // Process violations
    for (const violation of this.results.violations) {
      const issue = this.results.issues.find((i) => i.id === violation.issue);
      if (!issue) continue;

      const standardizationActions = this.generateFixActions(
        issue,
        violation.violations,
        updateMode,
      );
      actions.push(...standardizationActions);
    }

    // Process duplicates
    for (const duplicate of this.results.duplicates) {
      if (duplicate.recommendation === 'merge') {
        actions.push({
          type: 'merge_duplicate',
          issues: duplicate.issues,
          primary: duplicate.primary,
          secondary: duplicate.secondary,
          confidence: duplicate.similarity,
        });
      } else if (duplicate.recommendation === 'flag_for_review') {
        actions.push({
          type: 'flag_duplicate',
          issues: duplicate.issues,
          confidence: duplicate.similarity,
        });
      }
    }

    this.results.actions = actions;

    console.log(`   📋 Standardization Actions Generated:`);
    console.log(`      Total actions: ${actions.length}`);
    console.log(`      Title fixes: ${actions.filter((a) => a.field === 'title').length}`);
    console.log(
      `      Description fixes: ${actions.filter((a) => a.field === 'description').length}`,
    );
    console.log(`      Label fixes: ${actions.filter((a) => a.field === 'labels').length}`);
    console.log(`      Estimate fixes: ${actions.filter((a) => a.field === 'estimate').length}`);
    console.log(
      `      Duplicate merges: ${actions.filter((a) => a.type === 'merge_duplicate').length}\n`,
    );
  }

  /**
   * Generate fix actions for violations
   */
  generateFixActions(issue, violations, updateMode) {
    const actions = [];

    for (const violation of violations) {
      let action = null;

      switch (violation.field) {
        case 'title':
          action = this.generateTitleFix(issue, violation, updateMode);
          break;
        case 'description':
          action = this.generateDescriptionFix(issue, violation, updateMode);
          break;
        case 'labels':
          action = this.generateLabelsFix(issue, violation, updateMode);
          break;
        case 'estimate':
          action = this.generateEstimateFix(issue, violation, updateMode);
          break;
        case 'priority':
          action = this.generatePriorityFix(issue, violation, updateMode);
          break;
      }

      if (action) {
        actions.push({
          ...action,
          issueId: issue.id,
          originalIssue: issue,
          violation,
          updateMode,
        });
      }
    }

    return actions;
  }

  /**
   * Generate title fix
   */
  generateTitleFix(issue, violation, updateMode) {
    let newTitle = issue.title;

    switch (violation.issue) {
      case 'not_capitalized':
        newTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);
        break;
      case 'too_long':
        newTitle = newTitle.substring(0, 57) + '...';
        break;
      case 'missing_action_verb':
        // Infer action verb based on labels
        const verb = this.inferActionVerb(issue);
        newTitle = `${verb} ${newTitle.toLowerCase()}`;
        break;
    }

    return {
      type: 'update_field',
      field: 'title',
      oldValue: issue.title,
      newValue: newTitle,
      confidence: 0.9,
    };
  }

  /**
   * Generate description fix
   */
  generateDescriptionFix(issue, violation, updateMode) {
    let newDescription = issue.description || '';

    switch (violation.issue) {
      case 'too_short':
        newDescription = this.generateStandardDescription(issue);
        break;
      case 'missing_acceptance_criteria':
        newDescription +=
          '\n\n## Acceptance Criteria\n- [ ] [Criterion based on title]\n- [ ] [Quality checks pass]\n- [ ] [Documentation updated]';
        break;
    }

    return {
      type: 'update_field',
      field: 'description',
      oldValue: issue.description,
      newValue: newDescription,
      confidence: 0.8,
    };
  }

  /**
   * Generate labels fix
   */
  generateLabelsFix(issue, violation, updateMode) {
    const newLabels = [...(issue.labels || [])];

    switch (violation.issue) {
      case 'missing':
        // Add basic labels
        newLabels.push('task');
        newLabels.push('p2-medium');
        break;
      case 'missing_type_label':
        const typeLabel = this.inferTypeLabel(issue);
        newLabels.push(typeLabel);
        break;
    }

    return {
      type: 'update_field',
      field: 'labels',
      oldValue: issue.labels,
      newValue: [...new Set(newLabels)], // Remove duplicates
      confidence: 0.7,
    };
  }

  /**
   * Generate estimate fix
   */
  generateEstimateFix(issue, violation, updateMode) {
    const estimate = this.inferEstimate(issue);

    return {
      type: 'update_field',
      field: 'estimate',
      oldValue: issue.estimate,
      newValue: estimate,
      confidence: 0.6,
    };
  }

  /**
   * Generate priority fix
   */
  generatePriorityFix(issue, violation, updateMode) {
    const priority = this.inferPriority(issue);

    return {
      type: 'update_field',
      field: 'priority',
      oldValue: issue.priority,
      newValue: priority,
      confidence: 0.5,
    };
  }

  /**
   * Helper methods for inference
   */
  inferActionVerb(issue) {
    const labels = issue.labels || [];

    if (labels.includes('bug')) return 'Fix';
    if (labels.includes('feature')) return 'Implement';
    if (labels.includes('improvement')) return 'Improve';
    if (labels.includes('spike')) return 'Investigate';
    if (labels.includes('testing')) return 'Test';

    return 'Handle';
  }

  inferTypeLabel(issue) {
    const title = issue.title?.toLowerCase() || '';
    const description = issue.description?.toLowerCase() || '';

    if (title.includes('bug') || title.includes('fix') || title.includes('error')) return 'bug';
    if (title.includes('feature') || title.includes('add') || title.includes('implement'))
      return 'feature';
    if (title.includes('improve') || title.includes('enhance') || title.includes('optimize'))
      return 'improvement';
    if (title.includes('investigate') || title.includes('research') || title.includes('spike'))
      return 'spike';
    if (title.includes('test') || description.includes('test')) return 'task';

    return 'task';
  }

  inferEstimate(issue) {
    const title = issue.title?.toLowerCase() || '';
    const labels = issue.labels || [];

    // Base estimate by type
    let estimate = 3;

    if (labels.includes('bug')) estimate = 2;
    if (labels.includes('spike')) estimate = 3;
    if (labels.includes('feature')) estimate = 5;
    if (labels.includes('improvement')) estimate = 3;

    // Adjust by complexity indicators
    if (title.includes('complex') || title.includes('refactor')) estimate += 2;
    if (title.includes('simple') || title.includes('minor')) estimate -= 1;

    // Ensure Fibonacci and within limits
    const fibonacci = [1, 2, 3, 5, 8, 13];
    return fibonacci.find((f) => f >= Math.max(1, estimate)) || 13;
  }

  inferPriority(issue) {
    const title = issue.title?.toLowerCase() || '';
    const labels = issue.labels || [];

    if (title.includes('urgent') || title.includes('critical') || labels.includes('bug')) return 1;
    if (title.includes('important') || labels.includes('feature')) return 2;
    if (title.includes('minor') || labels.includes('improvement')) return 3;

    return 3; // Default medium-low priority
  }

  generateStandardDescription(issue) {
    const template = `## Description
${issue.title}

## Context
[Provide context for this ${this.inferTypeLabel(issue)}]

## Acceptance Criteria
- [ ] [Define specific success criteria]
- [ ] [Quality checks pass]
- [ ] [Documentation updated if needed]

## Technical Notes
[Add any technical details or considerations]

## Definition of Done
- [ ] Implementation completed
- [ ] Tests pass
- [ ] Code reviewed
- [ ] Documentation updated`;

    return template;
  }

  /**
   * Step 5: Execute standardization
   */
  async executeStandardization(duplicateHandling) {
    console.log('⚡ Step 5: Executing standardization actions...');

    let updated = 0;
    let failed = 0;
    const executionResults = [];

    for (const action of this.results.actions) {
      try {
        const result = await this.executeAction(action, duplicateHandling);

        if (result.success) {
          updated++;
          console.log(`   ✅ ${action.type}: ${action.issueId || action.issues?.join(', ')}`);
        } else {
          failed++;
          console.log(`   ❌ Failed ${action.type}: ${result.error}`);
        }

        executionResults.push(result);
      } catch (error) {
        failed++;
        console.log(`   ❌ Error executing ${action.type}:`, error.message);
        executionResults.push({
          success: false,
          action,
          error: error.message,
        });
      }
    }

    this.results.standardization.updated = updated;
    this.results.standardization.failed = failed;

    console.log(`   📊 Execution Summary:`);
    console.log(`      Successfully updated: ${updated}`);
    console.log(`      Failed: ${failed}`);
    console.log(
      `      Success rate: ${Math.round((updated / this.results.actions.length) * 100)}%\n`,
    );

    return executionResults;
  }

  /**
   * Execute individual action
   */
  async executeAction(action, duplicateHandling) {
    // This would use Linear MCP tools in real implementation
    // For now, simulate the action execution

    try {
      switch (action.type) {
        case 'update_field':
          return await this.updateIssueField(action);
        case 'merge_duplicate':
          return await this.mergeDuplicateIssues(action, duplicateHandling);
        case 'flag_duplicate':
          return await this.flagDuplicateIssues(action);
        default:
          return { success: false, error: `Unknown action type: ${action.type}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update issue field
   */
  async updateIssueField(action) {
    // TODO: Replace with actual Linear MCP call
    // await mcp__linear_server__update_issue({
    //   id: action.issueId,
    //   [action.field]: action.newValue
    // });

    // Mock implementation
    const issue = this.results.issues.find((i) => i.id === action.issueId);
    if (issue) {
      issue[action.field] = action.newValue;
    }

    return {
      success: true,
      action,
      oldValue: action.oldValue,
      newValue: action.newValue,
    };
  }

  /**
   * Merge duplicate issues
   */
  async mergeDuplicateIssues(action, duplicateHandling) {
    if (duplicateHandling !== 'merge') {
      return { success: false, error: 'Merge not enabled' };
    }

    // TODO: Replace with actual Linear MCP calls
    // 1. Update primary issue with merged content
    // 2. Archive secondary issue
    // 3. Add comment about merge

    return {
      success: true,
      action,
      primary: action.primary,
      secondary: action.secondary,
    };
  }

  /**
   * Flag duplicate issues
   */
  async flagDuplicateIssues(action) {
    // TODO: Add "duplicate" label and comment

    return {
      success: true,
      action,
      flagged: action.issues,
    };
  }

  /**
   * Step 6: Create follow-up tasks
   */
  async createFollowupTasks() {
    console.log('📝 Step 6: Creating follow-up tasks...');

    const followupTasks = [];

    // Create tasks for manual review items
    const manualReviewCount = this.results.actions.filter((a) => a.confidence < 0.7).length;
    if (manualReviewCount > 0) {
      const task = this.taskTemplates.generateStandardizedTask(
        {
          type: 'manual-review',
          description: `${manualReviewCount} Linear issues require manual review for standardization`,
          priority: 'MEDIUM',
        },
        'improvement',
        {
          component: 'Project Management',
        },
      );

      followupTasks.push(task);
    }

    // Create tasks for duplicate resolution
    const duplicateCount = this.results.duplicates.length;
    if (duplicateCount > 0) {
      const task = this.taskTemplates.generateStandardizedTask(
        {
          type: 'duplicate-resolution',
          description: `${duplicateCount} potential duplicate issues need resolution`,
          priority: 'MEDIUM',
        },
        'improvement',
        {
          component: 'Project Management',
        },
      );

      followupTasks.push(task);
    }

    console.log(`   ✅ Created ${followupTasks.length} follow-up tasks\n`);
    this.results.standardization.created = followupTasks.length;

    return followupTasks;
  }

  /**
   * Step 7: Generate compliance report
   */
  generateComplianceReport() {
    const totalIssues = this.results.audit.totalIssues;
    const violationsFixed = this.results.standardization.updated;
    const afterViolations = Math.max(0, this.results.audit.violationsFound - violationsFixed);

    this.results.compliance.afterRate = Math.round(
      ((totalIssues - afterViolations) / totalIssues) * 100,
    );
    this.results.compliance.improvement =
      this.results.compliance.afterRate - this.results.compliance.beforeRate;

    return {
      summary: {
        totalIssues,
        beforeCompliance: this.results.compliance.beforeRate,
        afterCompliance: this.results.compliance.afterRate,
        improvement: this.results.compliance.improvement,
        violationsFixed,
        duplicatesFound: this.results.audit.duplicatesFound,
        standardizationActions: this.results.actions.length,
      },
      compliance: this.results.compliance,
      audit: this.results.audit,
      standardization: this.results.standardization,
    };
  }

  /**
   * Output results
   */
  outputResults(report, dryRun) {
    console.log('📊 Linear Standardization Journey Complete\n');
    console.log('===========================================');
    console.log(`   Total Issues: ${report.summary.totalIssues}`);
    console.log(`   Compliance Before: ${report.summary.beforeCompliance}%`);
    console.log(`   Compliance After: ${report.summary.afterCompliance}%`);
    console.log(`   Improvement: +${report.summary.improvement}%`);
    console.log(
      `   Actions ${dryRun ? 'Planned' : 'Executed'}: ${report.summary.standardizationActions}`,
    );
    console.log(`   Duplicates Found: ${report.summary.duplicatesFound}`);
    console.log('===========================================\n');

    if (dryRun) {
      console.log('🔍 DRY RUN COMPLETE - No changes were made');
      console.log('   Run with --dry-run=false to execute changes\n');
    } else {
      console.log('✅ STANDARDIZATION COMPLETE');
      console.log(
        `   ${report.summary.improvement > 0 ? '📈' : '📊'} Compliance improved by ${report.summary.improvement}%\n`,
      );
    }
  }

  /**
   * Generate mock issues for testing
   */
  generateMockIssues() {
    return [
      {
        id: this.generateTaskId(taskPrefix, 1),
        title: 'fix auth issue',
        description: 'auth not working',
        priority: null,
        estimate: null,
        labels: [],
        state: 'Todo',
        team: project,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: this.generateTaskId(taskPrefix, 2),
        title: 'Implement comprehensive test coverage for user authentication module',
        description: `## User Story
As a developer
I want comprehensive test coverage for the user authentication module
So that I can ensure security and reliability

## Acceptance Criteria
- [ ] Unit tests for all authentication functions
- [ ] Integration tests for auth API endpoints
- [ ] Security tests for edge cases
- [ ] Coverage ≥90% for authentication module`,
        priority: 2,
        estimate: 5,
        labels: ['testing', 'coverage', 'p1-high', 'security'],
        state: 'Todo',
        team: project,
        createdAt: '2024-01-16T10:00:00Z',
      },
      {
        id: this.generateTaskId(taskPrefix, 3),
        title: 'auth problem',
        description: 'users cannot login sometimes',
        priority: 1,
        estimate: null,
        labels: ['bug'],
        state: 'In Progress',
        team: project,
        createdAt: '2024-01-17T10:00:00Z',
      },
      {
        id: this.generateTaskId(taskPrefix, 4),
        title: 'authentication issue fix',
        description: 'authentication service failing',
        priority: 1,
        estimate: 3,
        labels: ['bug', 'security'],
        state: 'Todo',
        team: project,
        createdAt: '2024-01-18T10:00:00Z',
      },
    ];
  }
}

// CLI execution
if (require.main === module) {
  const journey = new LinearStandardizationJourney();

  async function main() {
    const args = process.argv.slice(2);

    const options = {
      project: null, // Will be resolved from configuration
      dryRun: true,
      updateMode: 'conservative',
      duplicateHandling: 'merge',
      scope: 'all',
      createTasks: false,
    };

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--project':
          options.project = args[++i];
          break;
        case '--dry-run':
          options.dryRun = args[++i] === 'true';
          break;
        case '--update-mode':
          options.updateMode = args[++i];
          break;
        case '--duplicate-handling':
          options.duplicateHandling = args[++i];
          break;
        case '--scope':
          options.scope = args[++i];
          break;
        case '--create-tasks':
          options.createTasks = true;
          break;
        case '--help':
          console.log('Usage: jr8-linear-standardization [options]');
          console.log('Options:');
          console.log('  --project <name>            Linear project/team name');
          console.log('  --dry-run <true|false>      Preview mode (default: true)');
          console.log('  --update-mode <mode>        aggressive|conservative|interactive');
          console.log('  --duplicate-handling <mode> merge|flag|archive');
          console.log('  --scope <scope>             all|mvp|current-cycle|testing');
          console.log('  --create-tasks              Create follow-up tasks');
          process.exit(0);
      }
    }

    try {
      const result = await journey.execute(options);

      // Exit with error code if compliance didn't improve
      if (!result.complianceImproved && !options.dryRun) {
        console.log('⚠️  Compliance did not improve');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Journey failed:', error);
      process.exit(1);
    }
  }

  main();
}

module.exports = LinearStandardizationJourney;
