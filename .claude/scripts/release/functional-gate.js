#!/usr/bin/env node

/**
 * Functional Release Gate Validator
 *
 * Validates that all implemented features have passing E2E tests before release.
 * This is THE critical gate that enforces "functional release" concept.
 *
 * Pass Criteria:
 * - All `implemented` features have `e2e_test` specified in registry
 * - All specified E2E tests pass when run
 * - NO `partial` status features exist
 *
 * Blocks Release If:
 * - Any implemented feature lacks E2E test
 * - Any E2E test fails
 * - Any partial status features exist
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

class FunctionalGate {
  constructor() {
    this.projectRoot = process.cwd();
    this.registryPath = path.join(this.projectRoot, '.claude/user-stories/registry.yaml');
    this.registry = null;
    this.results = {
      passed: false,
      implementedCount: 0,
      totalTests: 0,
      failures: []
    };
  }

  /**
   * Load registry
   */
  loadRegistry() {
    try {
      const content = fs.readFileSync(this.registryPath, 'utf8');
      this.registry = yaml.load(content);
      return true;
    } catch (error) {
      console.error('❌ Failed to load user story registry');
      console.error(`   Expected: ${this.registryPath}`);
      console.error(`   Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Execute functional gate validation
   */
  async execute() {
    console.log('\n' + '═'.repeat(80));
    console.log('🎯 FUNCTIONAL RELEASE GATE VALIDATION');
    console.log('═'.repeat(80));
    console.log('\nChecking: All implemented features have passing E2E tests\n');

    if (!this.loadRegistry()) {
      this.results.passed = false;
      return this.results;
    }

    const features = this.registry.features || {};

    // Step 1: Check for partial features (automatic block)
    const partialFeatures = Object.entries(features)
      .filter(([_, f]) => f.status === 'partial');

    if (partialFeatures.length > 0) {
      console.log('❌ PARTIAL FEATURES DETECTED (blocks release)\n');
      partialFeatures.forEach(([slug, feature]) => {
        console.log(`   ❌ ${slug}`);
        console.log(`      Name: ${feature.name}`);
        console.log(`      Issue: Implemented but no E2E test`);
        console.log('');

        this.results.failures.push({
          feature: slug,
          reason: 'Partial status - implemented but no E2E test'
        });
      });
    }

    // Step 2: Find all implemented features
    const implemented = Object.entries(features)
      .filter(([_, f]) => f.status === 'implemented');

    this.results.implementedCount = implemented.length;

    if (implemented.length === 0) {
      console.log('⚠️  No implemented features found in registry');
      console.log('   This is unusual - check registry is up-to-date\n');
      this.results.passed = false;
      return this.results;
    }

    console.log(`Found ${implemented.length} implemented features to validate:\n`);

    // Step 3: Validate each implemented feature has E2E test
    const testsToRun = [];

    for (const [slug, feature] of implemented) {
      if (!feature.e2e_test) {
        console.log(`❌ ${slug}`);
        console.log(`   Name: ${feature.name}`);
        console.log(`   Issue: NO E2E TEST SPECIFIED`);
        console.log('');

        this.results.failures.push({
          feature: slug,
          reason: 'No e2e_test specified in registry'
        });
      } else {
        console.log(`✅ ${slug}`);
        console.log(`   Name: ${feature.name}`);
        console.log(`   Test: ${feature.e2e_test}`);
        console.log('');

        testsToRun.push({ slug, feature });
      }
    }

    // Step 4: Run E2E tests if all features have tests specified
    if (testsToRun.length > 0 && this.results.failures.length === 0) {
      console.log('\n' + '─'.repeat(80));
      console.log('🧪 Running E2E tests...\n');

      const testResults = await this.runE2ETests(testsToRun);
      this.results.totalTests = testResults.total;

      if (!testResults.passed) {
        testResults.failures.forEach(failure => {
          this.results.failures.push(failure);
        });
      }
    }

    // Step 5: Determine final result
    this.results.passed = this.results.failures.length === 0;

    // Step 6: Print final result
    console.log('\n' + '═'.repeat(80));
    if (this.results.passed) {
      console.log('✅ FUNCTIONAL RELEASE GATE: PASSED');
      console.log('═'.repeat(80));
      console.log(`\n✅ ${this.results.implementedCount} implemented features validated`);
      console.log(`✅ ${this.results.totalTests} E2E tests passed`);
      console.log(`✅ Ready for release\n`);
    } else {
      console.log('❌ FUNCTIONAL RELEASE GATE: BLOCKED');
      console.log('═'.repeat(80));
      console.log(`\n❌ ${this.results.failures.length} issue(s) blocking release:\n`);

      this.results.failures.forEach(failure => {
        console.log(`   Feature: ${failure.feature}`);
        console.log(`   Reason: ${failure.reason}`);
        console.log('');
      });

      console.log('To fix:');
      console.log('  1. Add E2E tests for features missing them');
      console.log('  2. Fix failing E2E tests');
      console.log('  3. Update registry with correct test paths');
      console.log('  4. Re-run: npm run release:validate-functional');
      console.log('');
    }

    return this.results;
  }

  /**
   * Run E2E tests for specified features
   */
  async runE2ETests(testsToRun) {
    const result = {
      passed: true,
      total: 0,
      failures: []
    };

    try {
      // Run full E2E test suite
      console.log('Running: npm run test:e2e');
      execSync('npm run test:e2e', {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });

      result.total = testsToRun.length;
      console.log(`\n✅ All ${result.total} E2E tests passed\n`);

    } catch (error) {
      result.passed = false;

      // Parse which tests failed (simplified - real implementation would parse Jest output)
      testsToRun.forEach(({ slug, feature }) => {
        result.failures.push({
          feature: slug,
          reason: `E2E test failed: ${feature.e2e_test}`
        });
      });

      console.log('\n❌ E2E test suite failed\n');
    }

    return result;
  }
}

// CLI Interface
async function main() {
  const gate = new FunctionalGate();
  const result = await gate.execute();

  // Exit with appropriate code
  process.exit(result.passed ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Functional gate error:', error.message);
    process.exit(1);
  });
}

module.exports = FunctionalGate;
