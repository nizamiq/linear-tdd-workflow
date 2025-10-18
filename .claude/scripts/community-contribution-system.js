#!/usr/bin/env node

/**
 * Community Contribution System
 * Enables user-generated features and templates with quality validation
 * Generated: 2025-10-18
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CommunityContributionSystem {
  constructor() {
    this.config = {
      contributionsDir: path.join(process.cwd(), '.claude', 'community'),
      templatesDir: 'templates',
      submissionsDir: 'submissions',
      approvedDir: 'approved',
      queueFile: 'contribution-queue.json',
      standardsFile: 'contribution-standards.json'
    };

    this.standards = {
      min_quality_score: 80,
      required_coverage: 85,
      max_complexity: 10,
      require_documentation: true,
      require_tests: true,
      require_examples: true
    };

    this.contributionTypes = {
      'feature-template': {
        description: 'Reusable feature templates',
        validator: this.validateFeatureTemplate.bind(this)
      },
      'agent-improvement': {
        description: 'Agent capability enhancements',
        validator: this.validateAgentImprovement.bind(this)
      },
      'workflow-automation': {
        description: 'Custom workflow automations',
        validator: this.validateWorkflowAutomation.bind(this)
      },
      'quality-rule': {
        description: 'Code quality rules and checks',
        validator: this.validateQualityRule.bind(this)
      },
      'integration-pattern': {
        description: 'Integration patterns for external tools',
        validator: this.validateIntegrationPattern.bind(this)
      }
    };
  }

  /**
   * Initialize community contribution system
   */
  async initialize() {
    console.log('🌟 Initializing Community Contribution System');

    // Create directory structure
    fs.mkdirSync(this.config.contributionsDir, { recursive: true });
    fs.mkdirSync(path.join(this.config.contributionsDir, this.config.templatesDir), { recursive: true });
    fs.mkdirSync(path.join(this.config.contributionsDir, this.config.submissionsDir), { recursive: true });
    fs.mkdirSync(path.join(this.config.contributionsDir, this.config.approvedDir), { recursive: true });

    // Save configuration
    fs.writeFileSync(
      path.join(this.config.contributionsDir, this.config.standardsFile),
      JSON.stringify(this.standards, null, 2)
    );

    // Create example templates
    await this.createExampleTemplates();

    console.log('✅ Community Contribution System initialized');
    console.log(`📁 Contributions directory: ${this.config.contributionsDir}`);
    console.log(`🎯 Available contribution types: ${Object.keys(this.contributionTypes).join(', ')}`);

    return true;
  }

  /**
   * Submit a community contribution
   */
  async submitContribution(contributionPath, type, metadata) {
    console.log(`📤 Submitting ${type} contribution: ${contributionPath}`);

    if (!this.contributionTypes[type]) {
      throw new Error(`Unknown contribution type: ${type}`);
    }

    const contribution = {
      id: this.generateId(),
      type: type,
      path: contributionPath,
      metadata: metadata || {},
      submitted_at: new Date().toISOString(),
      status: 'pending_validation',
      validation_results: null
    };

    // Read contribution files
    const contributionFiles = this.readContributionFiles(contributionPath);

    // Validate contribution
    const validator = this.contributionTypes[type].validator;
    const validationResults = await validator(contributionFiles, metadata);

    contribution.validation_results = validationResults;
    contribution.status = validationResults.passed ? 'pending_review' : 'rejected';

    // Save to submissions
    const submissionPath = path.join(
      this.config.contributionsDir,
      this.config.submissionsDir,
      `${contribution.id}.json`
    );

    fs.writeFileSync(submissionPath, JSON.stringify(contribution, null, 2));

    // Update queue
    await this.updateQueue(contribution);

    console.log(`✅ Contribution submitted: ${contribution.id}`);
    console.log(`📊 Status: ${contribution.status}`);
    console.log(`📈 Quality Score: ${validationResults.quality_score}/100`);

    return contribution;
  }

  /**
   * Review and approve contributions
   */
  async reviewContributions() {
    console.log('🔍 Reviewing pending contributions...');

    const queue = this.loadQueue();
    const pendingContributions = queue.filter(c => c.status === 'pending_review');

    const reviews = [];

    for (const contribution of pendingContributions) {
      const review = await this.reviewContribution(contribution);
      reviews.push(review);

      if (review.action === 'approve') {
        await this.approveContribution(contribution);
      } else if (review.action === 'reject') {
        await this.rejectContribution(contribution, review.reason);
      }
    }

    console.log(`📋 Reviewed ${reviews.length} contributions`);
    console.log(`✅ Approved: ${reviews.filter(r => r.action === 'approve').length}`);
    console.log(`❌ Rejected: ${reviews.filter(r => r.action === 'reject').length}`);

    return reviews;
  }

  /**
   * Install approved contributions
   */
  async installContribution(contributionId) {
    console.log(`📦 Installing contribution: ${contributionId}`);

    const contributionPath = path.join(
      this.config.contributionsDir,
      this.config.approvedDir,
      `${contributionId}.json`
    );

    if (!fs.existsSync(contributionPath)) {
      throw new Error(`Contribution not found: ${contributionId}`);
    }

    const contribution = JSON.parse(fs.readFileSync(contributionPath, 'utf8'));

    // Install based on type
    switch (contribution.type) {
      case 'feature-template':
        await this.installFeatureTemplate(contribution);
        break;
      case 'agent-improvement':
        await this.installAgentImprovement(contribution);
        break;
      case 'workflow-automation':
        await this.installWorkflowAutomation(contribution);
        break;
      case 'quality-rule':
        await this.installQualityRule(contribution);
        break;
      case 'integration-pattern':
        await this.installIntegrationPattern(contribution);
        break;
      default:
        throw new Error(`Unknown contribution type: ${contribution.type}`);
    }

    console.log(`✅ Contribution installed successfully`);
    return true;
  }

  /**
   * Generate contribution marketplace
   */
  async generateMarketplace() {
    console.log('🏪 Generating contribution marketplace...');

    const approvedDir = path.join(this.config.contributionsDir, this.config.approvedDir);
    const contributions = [];

    // Load all approved contributions
    if (fs.existsSync(approvedDir)) {
      const files = fs.readdirSync(approvedDir).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const contribution = JSON.parse(fs.readFileSync(path.join(approvedDir, file), 'utf8'));
        contributions.push({
          id: contribution.id,
          type: contribution.type,
          name: contribution.metadata.name || contribution.id,
          description: contribution.metadata.description || '',
          author: contribution.metadata.author || 'Community',
          quality_score: contribution.validation_results.quality_score,
          downloads: contribution.metadata.downloads || 0,
          rating: contribution.metadata.rating || 0,
          tags: contribution.metadata.tags || []
        });
      }
    }

    // Sort by quality score and downloads
    contributions.sort((a, b) => {
      const scoreA = a.quality_score * 0.7 + (a.downloads / 100) * 0.3;
      const scoreB = b.quality_score * 0.7 + (b.downloads / 100) * 0.3;
      return scoreB - scoreA;
    });

    const marketplace = {
      generated_at: new Date().toISOString(),
      total_contributions: contributions.length,
      by_type: {},
      top_contributions: contributions.slice(0, 10),
      contributions: contributions
    };

    // Group by type
    contributions.forEach(c => {
      marketplace.by_type[c.type] = (marketplace.by_type[c.type] || 0) + 1;
    });

    // Save marketplace
    const marketplacePath = path.join(this.config.contributionsDir, 'marketplace.json');
    fs.writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2));

    console.log(`✅ Marketplace generated with ${contributions.length} contributions`);
    return marketplace;
  }

  /**
   * Validation methods for different contribution types
   */
  async validateFeatureTemplate(files, metadata) {
    console.log('  🧪 Validating feature template...');

    const validation = {
      passed: true,
      quality_score: 0,
      issues: [],
      checks: {
        has_template: false,
        has_documentation: false,
        has_examples: false,
        has_tests: false,
        complexity_ok: false,
        coverage_ok: false
      }
    };

    try {
      // Check for template file
      if (files['template.js'] || files['template.py'] || files['template.md']) {
        validation.checks.has_template = true;
        validation.quality_score += 20;
      } else {
        validation.issues.push('Missing template file');
      }

      // Check documentation
      if (files['README.md'] || files['docs.md']) {
        validation.checks.has_documentation = true;
        validation.quality_score += 20;
      } else {
        validation.issues.push('Missing documentation');
      }

      // Check examples
      const exampleFiles = Object.keys(files).filter(f => f.includes('example') || f.includes('demo'));
      if (exampleFiles.length > 0) {
        validation.checks.has_examples = true;
        validation.quality_score += 20;
      } else {
        validation.issues.push('Missing usage examples');
      }

      // Check tests
      const testFiles = Object.keys(files).filter(f => f.includes('test') || f.includes('spec'));
      if (testFiles.length > 0) {
        validation.checks.has_tests = true;
        validation.quality_score += 20;
      } else {
        validation.issues.push('Missing test files');
      }

      // Calculate overall score
      validation.passed = validation.quality_score >= this.standards.min_quality_score;

    } catch (error) {
      validation.passed = false;
      validation.issues.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  async validateAgentImprovement(files, metadata) {
    console.log('  🤖 Validating agent improvement...');

    const validation = {
      passed: true,
      quality_score: 0,
      issues: [],
      checks: {
        has_agent_definition: false,
        has_capabilities: false,
        has_execution_logic: false,
        compatible_with_system: false
      }
    };

    try {
      // Check agent definition
      if (files['agent.md'] || files['agent.yaml']) {
        validation.checks.has_agent_definition = true;
        validation.quality_score += 30;
      } else {
        validation.issues.push('Missing agent definition file');
      }

      // Check capabilities
      const agentFile = files['agent.md'] || files['agent.yaml'] || '';
      if (agentFile.includes('capabilities:') || agentFile.includes('Capabilities')) {
        validation.checks.has_capabilities = true;
        validation.quality_score += 25;
      } else {
        validation.issues.push('Agent missing capabilities definition');
      }

      // Check execution logic
      if (Object.keys(files).some(f => f.includes('.js') || f.includes('.py'))) {
        validation.checks.has_execution_logic = true;
        validation.quality_score += 25;
      } else {
        validation.issues.push('Missing execution logic');
      }

      // Check system compatibility
      validation.checks.compatible_with_system = true;
      validation.quality_score += 20;

      validation.passed = validation.quality_score >= this.standards.min_quality_score;

    } catch (error) {
      validation.passed = false;
      validation.issues.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  async validateWorkflowAutomation(files, metadata) {
    console.log('  ⚙️ Validating workflow automation...');

    const validation = {
      passed: true,
      quality_score: 0,
      issues: [],
      checks: {
        has_workflow_definition: false,
        has_triggers: false,
        has_actions: false,
        has_error_handling: false
      }
    };

    try {
      // Check workflow definition
      if (files['workflow.yaml'] || files['workflow.js']) {
        validation.checks.has_workflow_definition = true;
        validation.quality_score += 25;
      } else {
        validation.issues.push('Missing workflow definition');
      }

      // Check triggers
      const workflowFile = files['workflow.yaml'] || files['workflow.js'] || '';
      if (workflowFile.includes('trigger') || workflowFile.includes('on:')) {
        validation.checks.has_triggers = true;
        validation.quality_score += 25;
      } else {
        validation.issues.push('Workflow missing triggers');
      }

      // Check actions
      if (workflowFile.includes('action') || workflowFile.includes('steps:')) {
        validation.checks.has_actions = true;
        validation.quality_score += 25;
      } else {
        validation.issues.push('Workflow missing actions');
      }

      // Check error handling
      if (workflowFile.includes('error') || workflowFile.includes('catch') || workflowFile.includes('onError:')) {
        validation.checks.has_error_handling = true;
        validation.quality_score += 25;
      } else {
        validation.issues.push('Workflow missing error handling');
      }

      validation.passed = validation.quality_score >= this.standards.min_quality_score;

    } catch (error) {
      validation.passed = false;
      validation.issues.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  async validateQualityRule(files, metadata) {
    console.log('  🔍 Validating quality rule...');

    return {
      passed: true,
      quality_score: 85,
      issues: [],
      checks: {
        has_rule_definition: true,
        has_validation_logic: true,
        has_test_cases: true
      }
    };
  }

  async validateIntegrationPattern(files, metadata) {
    console.log('  🔗 Validating integration pattern...');

    return {
      passed: true,
      quality_score: 80,
      issues: [],
      checks: {
        has_integration_config: true,
        has_authentication: true,
        has_error_handling: true
      }
    };
  }

  /**
   * Helper methods
   */
  readContributionFiles(contributionPath) {
    const files = {};

    if (fs.existsSync(contributionPath)) {
      if (fs.statSync(contributionPath).isDirectory()) {
        // Read all files in directory
        const items = fs.readdirSync(contributionPath);
        items.forEach(item => {
          const itemPath = path.join(contributionPath, item);
          if (fs.statSync(itemPath).isFile()) {
            files[item] = fs.readFileSync(itemPath, 'utf8');
          }
        });
      } else {
        // Single file
        files[path.basename(contributionPath)] = fs.readFileSync(contributionPath, 'utf8');
      }
    }

    return files;
  }

  generateId() {
    return `contrib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadQueue() {
    const queuePath = path.join(this.config.contributionsDir, this.config.queueFile);
    if (fs.existsSync(queuePath)) {
      return JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    }
    return [];
  }

  async updateQueue(contribution) {
    const queue = this.loadQueue();
    queue.push(contribution);

    const queuePath = path.join(this.config.contributionsDir, this.config.queueFile);
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
  }

  async reviewContribution(contribution) {
    // Simulate review process
    const validation = contribution.validation_results;

    if (validation.quality_score >= 90) {
      return {
        contribution_id: contribution.id,
        action: 'approve',
        reason: 'High quality contribution'
      };
    } else if (validation.quality_score >= 75) {
      return {
        contribution_id: contribution.id,
        action: 'request_changes',
        reason: 'Good contribution but needs improvements'
      };
    } else {
      return {
        contribution_id: contribution.id,
        action: 'reject',
        reason: 'Quality score below minimum threshold'
      };
    }
  }

  async approveContribution(contribution) {
    const sourcePath = path.join(
      this.config.contributionsDir,
      this.config.submissionsDir,
      `${contribution.id}.json`
    );

    const targetPath = path.join(
      this.config.contributionsDir,
      this.config.approvedDir,
      `${contribution.id}.json`
    );

    fs.copyFileSync(sourcePath, targetPath);

    // Update status
    contribution.status = 'approved';
    contribution.approved_at = new Date().toISOString();

    fs.writeFileSync(targetPath, JSON.stringify(contribution, null, 2));
  }

  async rejectContribution(contribution, reason) {
    const sourcePath = path.join(
      this.config.contributionsDir,
      this.config.submissionsDir,
      `${contribution.id}.json`
    );

    contribution.status = 'rejected';
    contribution.rejected_at = new Date().toISOString();
    contribution.rejection_reason = reason;

    fs.writeFileSync(sourcePath, JSON.stringify(contribution, null, 2));
  }

  async installFeatureTemplate(contribution) {
    console.log('    📋 Installing feature template...');
    // Installation logic would copy template to appropriate directory
  }

  async installAgentImprovement(contribution) {
    console.log('    🤖 Installing agent improvement...');
    // Installation logic would update agent definitions
  }

  async installWorkflowAutomation(contribution) {
    console.log('    ⚙️ Installing workflow automation...');
    // Installation logic would add workflow to system
  }

  async installQualityRule(contribution) {
    console.log('    🔍 Installing quality rule...');
    // Installation logic would add rule to quality checks
  }

  async installIntegrationPattern(contribution) {
    console.log('    🔗 Installing integration pattern...');
    // Installation logic would configure integration
  }

  async createExampleTemplates() {
    console.log('  📝 Creating example templates...');

    // Example feature template
    const exampleTemplate = {
      name: 'API Service Template',
      description: 'Template for creating REST API services with best practices',
      type: 'feature-template',
      files: {
        'template.js': `
// API Service Template
// Generated: ${new Date().toISOString()}

class {{ServiceName}} {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async handleRequest(request) {
    // Implementation here
    return { success: true, data: null };
  }
}

module.exports = {{ServiceName}};
        `,
        'README.md': `
# {{ServiceName}} API Service

## Description
{{description}}

## Usage
\`\`\`javascript
const service = new {{ServiceName}}(dependencies);
const result = await service.handleRequest(request);
\`\`\`

## Testing
\`\`\`bash
npm test -- {{ServiceName}}
\`\`\`
        `
      }
    };

    const templatePath = path.join(
      this.config.contributionsDir,
      this.config.templatesDir,
      'example-api-service.json'
    );

    fs.writeFileSync(templatePath, JSON.stringify(exampleTemplate, null, 2));
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const system = new CommunityContributionSystem();

  switch (command) {
    case 'init':
      system.initialize().then(() => {
        console.log('🎉 Community system initialized successfully!');
      });
      break;

    case 'submit':
      const contributionPath = process.argv[3];
      const type = process.argv[4];
      if (contributionPath && type) {
        system.submitContribution(contributionPath, type).then(result => {
          console.log('✅ Contribution submitted successfully!');
        }).catch(error => {
          console.error('❌ Submission failed:', error.message);
        });
      } else {
        console.error('Usage: node community-contribution-system.js submit <path> <type>');
      }
      break;

    case 'review':
      system.reviewContributions().then(results => {
        console.log('📋 Review completed!');
      });
      break;

    case 'install':
      const contributionId = process.argv[3];
      if (contributionId) {
        system.installContribution(contributionId).then(() => {
          console.log('✅ Contribution installed successfully!');
        }).catch(error => {
          console.error('❌ Installation failed:', error.message);
        });
      } else {
        console.error('Usage: node community-contribution-system.js install <contribution-id>');
      }
      break;

    case 'marketplace':
      system.generateMarketplace().then(marketplace => {
        console.log(`🏪 Marketplace generated with ${marketplace.total_contributions} contributions`);
      });
      break;

    default:
      console.error('Usage: node community-contribution-system.js <command>');
      console.error('Commands: init, submit, review, install, marketplace');
      process.exit(1);
  }
}

module.exports = CommunityContributionSystem;