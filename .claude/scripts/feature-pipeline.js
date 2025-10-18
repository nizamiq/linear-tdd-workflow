#!/usr/bin/env node

/**
 * Automated Feature Pipeline
 * Generates, tests, validates, and deploys features automatically
 * Generated: 2025-10-18
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FeaturePipeline {
  constructor() {
    this.config = {
      autoTest: true,
      autoDeploy: false, // Manual approval by default
      qualityTier: 'standard',
      outputDir: 'generated-features',
      ciIntegration: true
    };
  }

  /**
   * Full automated pipeline: Generate → Test → Validate → Deploy
   */
  async runPipeline(featureDescription, options = {}) {
    const opts = { ...this.config, ...options };

    console.log('🚀 Starting Automated Feature Pipeline');
    console.log(`📝 Feature: ${featureDescription}`);
    console.log(`🎯 Quality Tier: ${opts.qualityTier}`);
    console.log(`⚡ Auto-Deploy: ${opts.autoDeploy ? 'Yes' : 'No (Manual Approval)'}`);

    const pipeline = {
      feature: featureDescription,
      options: opts,
      stages: [],
      results: {},
      status: 'running'
    };

    try {
      // Stage 1: Generate Feature
      const generateResult = await this.generateFeature(featureDescription, opts);
      pipeline.stages.push('generate');
      pipeline.results.generate = generateResult;
      console.log('✅ Stage 1 Complete: Feature Generated');

      // Stage 2: Automated Testing
      if (opts.autoTest) {
        const testResult = await this.runAutomatedTests(generateResult, opts);
        pipeline.stages.push('test');
        pipeline.results.test = testResult;
        console.log('✅ Stage 2 Complete: Tests Executed');
      }

      // Stage 3: Quality Validation
      const validateResult = await this.validateQuality(generateResult, opts);
      pipeline.stages.push('validate');
      pipeline.results.validate = validateResult;
      console.log('✅ Stage 3 Complete: Quality Validated');

      // Stage 4: Automated Deployment (if enabled)
      if (opts.autoDeploy && validateResult.success) {
        const deployResult = await this.deployFeature(generateResult, opts);
        pipeline.stages.push('deploy');
        pipeline.results.deploy = deployResult;
        console.log('✅ Stage 4 Complete: Feature Deployed');
      } else if (!validateResult.success) {
        pipeline.status = 'failed';
        console.log('❌ Pipeline Failed: Quality validation failed');
      }

      pipeline.status = 'completed';
      return pipeline;

    } catch (error) {
      pipeline.status = 'failed';
      pipeline.error = error.message;
      console.error('❌ Pipeline Failed:', error.message);
      return pipeline;
    }
  }

  /**
   * Stage 1: Generate feature using existing generator
   */
  async generateFeature(description, options) {
    console.log('  📦 Generating feature stubs...');

    const FeatureGenerator = require('./feature-generator');
    const generator = new FeatureGenerator();

    const result = await generator.generate(description, {
      type: options.type || 'service',
      tier: options.qualityTier,
      withTests: options.autoTest
    });

    return {
      success: result.files.length > 0,
      files: result.files,
      nextSteps: result.nextSteps,
      duration: Date.now() - Date.now() // Will calculate real duration
    };
  }

  /**
   * Stage 2: Run automated tests
   */
  async runAutomatedTests(generationResult, options) {
    console.log('  🧪 Running automated tests...');

    const testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      coverage: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Run tests for each generated file
    for (const file of generationResult.files) {
      if (file.type === 'test') {
        testResults.total++;

        try {
          // Try to run the test file
          const testCommand = this.getTestCommand(file.relativePath);
          const result = execSync(testCommand, {
            cwd: process.cwd(),
            encoding: 'utf8',
            timeout: 30000
          });

          const output = result.stdout || result.stderr || '';

          // Parse test results
          testResults.passed += this.parseTestOutput(output);
          testResults.failed += testResults.total - testResults.passed;

        } catch (error) {
          testResults.failed++;
          console.log(`    ⚠️ Test failed: ${file.relativePath}`);
        }
      }
    }

    // Run coverage if tests exist
    if (testResults.total > 0) {
      try {
        const coverageResult = this.runCoverageAnalysis();
        testResults.coverage = coverageResult.percentage;
      } catch (error) {
        console.log('    ⚠️ Coverage analysis failed');
      }
    }

    testResults.duration = Date.now() - startTime;
    testResults.success = testResults.failed === 0 && testResults.passed > 0;

    return {
      success: testResults.success,
      ...testResults,
      threshold: options.qualityTier === 'critical' ? 90 : options.qualityTier === 'standard' ? 80 : 70,
      details: testResults.failed > 0 ? `Failed tests: ${testResults.failed}` : 'All tests passed'
    };
  }

  /**
   * Stage 3: Validate quality metrics
   */
  async validateQuality(generationResult, options) {
    console.log('  🔍 Validating quality metrics...');

    const validation = {
      files: generationResult.files.length,
      lint: { passed: 0, failed: 0 },
      syntax: { passed: 0, failed: 0 },
      structure: { passed: 0, failed: 0 },
      overall: { passed: 0, failed: 0, score: 0 }
    };

    // Syntax validation
    for (const file of generationResult.files) {
      if (file.type === 'implementation') {
        try {
          const syntaxResult = this.validateSyntax(file.relativePath);
          validation.syntax.passed += syntaxResult.passed ? 1 : 0;
          validation.syntax.failed += syntaxResult.passed ? 0 : 1;
        } catch (error) {
          validation.syntax.failed++;
          console.log(`    ⚠️ Syntax error in: ${file.relativePath}`);
        }
      }
    }

    // Lint validation (if available)
    try {
      const lintResult = this.runLinting(generationResult.files);
      validation.lint = lintResult;
    } catch (error) {
      console.log('    ⚠️ Linting validation skipped');
    }

    // Structure validation
    for (const file of generationResult.files) {
      try {
        const structureResult = this.validateFileStructure(file);
        validation.structure.passed += structureResult.passed ? 1 : 0;
        validation.structure.failed += structureResult.passed ? 0 : 1;
      } catch (error) {
        validation.structure.failed++;
        console.log(`    ⚠️ Structure issue in: ${file.relativePath}`);
      }
    }

    // Calculate overall score
    const totalChecks = validation.files * 3; // 3 checks per file
    validation.overall.passed = validation.syntax.passed + validation.lint.passed + validation.structure.passed;
    validation.overall.failed = validation.syntax.failed + validation.lint.failed + validation.structure.failed;
    validation.overall.score = Math.round((validation.overall.passed / totalChecks) * 100);

    validation.success = validation.overall.score >= 80; // 80% pass rate required

    return {
      success: validation.success,
      ...validation,
      recommendation: validation.success ?
        'Quality standards met ✅' :
        'Address failed validations before deployment ❌'
    };
  }

  /**
   * Stage 4: Deploy feature
   */
  async deployFeature(generationResult, options) {
    console.log('  🚀 Deploying feature...');

    const deployment = {
      method: 'git',
      files: generationResult.files.length,
      commits: 0,
      success: false,
      rollback: false
    };

    try {
      // Stage files
      execSync('git add -A', { cwd: process.cwd() });
      deployment.commits = execSync('git status --porcelain', { cwd: process.cwd() }).split('\n').length - 1;

      // Commit changes
      const commitMessage = this.generateCommitMessage(generationResult);
      execSync(`git commit -m "${commitMessage}"`, { cwd: process.cwd() });
      deployment.success = true;

      console.log(`    ✅ Committed ${deployment.commits} files`);
      console.log(`    📝 Commit: ${commitMessage}`);

      // Push if configured
      if (options.autoPush) {
        execSync('git push', { cwd: process.cwd() });
        console.log('    ✅ Pushed to remote');
      }

    } catch (error) {
      console.log(`    ❌ Deployment failed: ${error.message}`);
      deployment.error = error.message;

      // Attempt rollback
      try {
        execSync('git reset --hard HEAD~1', { cwd: process.cwd() });
        deployment.rollback = true;
        console.log('    🔄 Rolled back changes');
      } catch (rollbackError) {
        console.log('    ❌ Rollback failed: ${rollbackError.message}`);
      }
    }

    return deployment;
  }

  /**
   * Helper: Get test command for file
   */
  getTestCommand(testFile) {
    if (testFile.includes('.test.')) {
      return `npm test -- --testPathPattern=${testFile}`;
    }
    return `npm test -- --testNamePattern="${testFile}"`;
  }

  /**
   * Helper: Parse test output
   */
  parseTestOutput(output) {
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;

    for (const line of lines) {
      if (line.includes('✓') || line.includes('PASS') || line.includes('OK')) {
        passed++;
      } else if (line.includes('✗') || line.includes('FAIL') || line.includes('ERROR')) {
        failed++;
      }
    }

    return Math.max(passed, 0);
  }

  /**
   * Helper: Run coverage analysis
   */
  runCoverageAnalysis() {
    try {
      const result = execSync('npm run test:coverage', {
        cwd: process.cwd(),
        encoding: 'utf8'
      });

      const output = result.stdout || result.stderr || '';
      const match = output.match(/All files\s+\|\s+Lines\s+(\d+)%\s+|(\d+)%\s+/);

      return {
        percentage: match ? parseFloat(match[1] || match[2]) : 0,
        details: output.substring(0, 200)
      };
    } catch (error) {
      return { percentage: 0, details: 'Coverage analysis failed' };
    }
  }

  /**
   * Helper: Validate file syntax
   */
  validateSyntax(filePath) {
    try {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        execSync(`node -c "${filePath}"`, { cwd: process.cwd() });
      } else if (filePath.endsWith('.py')) {
        execSync(`python -m py_compile "${filePath}"`, { cwd: process.cwd() });
      }
      return { passed: true };
    } catch (error) {
      return { passed: false, error: error.message };
    }
  }

  /**
   * Helper: Run linting
   */
  runLinting(files) {
    try {
      const jsFiles = files.filter(f => f.relativePath.match(/\.(js|jsx|ts|tsx)$/));
      if (jsFiles.length > 0) {
        execSync('npm run lint:check', { cwd: process.cwd() });
      }
      return { passed: jsFiles.length, failed: 0 };
    } catch (error) {
      return { passed: 0, failed: jsFiles.length, error: error.message };
    }
  }

  /**
   * Helper: Validate file structure
   */
  validateFileStructure(file) {
    const stats = fs.statSync(file.path);
    return {
      passed: stats.isFile(),
      error: stats.isFile() ? null : 'Not a file'
    };
  }

  /**
   * Helper: Generate commit message
   */
  generateCommitMessage(generationResult) {
    const featureName = generationResult.description
      .split(' ')
      .map(word => word.charAt(0).toLowerCase() + word.slice(1))
      .join('');

    return `feat(pipeline): add ${featureName}`;
  }

  /**
   * Generate pipeline report
   */
  generateReport(pipeline) {
    const report = {
      timestamp: new Date().toISOString(),
      feature: pipeline.feature,
      status: pipeline.status,
      stages: pipeline.stages,
      results: pipeline.results,
      duration: Date.now() - Date.now(), // Will calculate actual duration
      summary: this.generateSummary(pipeline)
    };

    // Save report
    const reportPath = path.join(process.cwd(), '.claude', 'reports', `pipeline-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  /**
   * Generate human-readable summary
   */
  generateSummary(pipeline) {
    const stages = pipeline.stages || [];
    const results = pipeline.results || {};

    const summary = {
      completed: stages.length,
      successful: stages.length > 0 && pipeline.status === 'completed',
      duration: pipeline.status === 'completed' ? 'Completed successfully' : 'Pipeline failed',
      highlights: []
    };

    // Add highlights based on results
    if (results.generate?.files) {
      summary.highlights.push(`Generated ${results.generate.files.length} files`);
    }
    if (results.test?.passed > 0) {
      summary.highlights.push(`${results.test.passed} tests passed`);
    }
    if (results.validate?.overall?.score) {
      summary.highlights.push(`Quality score: ${results.validate.overall.score}%`);
    }
    if (results.deploy?.success) {
      summary.highlights.push('Successfully deployed');
    }

    return summary;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const description = args[1];

  if (!command || !description) {
    console.error('Usage: node feature-pipeline.js <command> "feature description"');
    console.error('Commands: run, test, validate, deploy');
    process.exit(1);
  }

  const pipeline = new FeaturePipeline();

  switch (command) {
    case 'run':
      pipeline.runPipeline(description, {
        type: 'service',
        qualityTier: 'standard',
        autoTest: true,
        autoDeploy: false
      }).then(result => {
        const report = pipeline.generateReport(result);
        console.log('\n📊 Pipeline Report:');
        console.log(JSON.stringify(report.summary, null, 2));
      });
      break;

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

module.exports = FeaturePipeline;