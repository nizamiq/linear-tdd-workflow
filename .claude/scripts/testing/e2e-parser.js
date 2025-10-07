#!/usr/bin/env node

/**
 * E2E Test Parser
 *
 * Parses E2E test files to extract @feature tags and validate
 * that all features in the registry have corresponding E2E tests.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

class E2EParser {
  constructor() {
    this.projectRoot = process.cwd();
    this.registryPath = path.join(this.projectRoot, '.claude/user-stories/registry.yaml');
    this.testDir = path.join(this.projectRoot, 'tests/e2e');
    this.testFiles = [];
    this.featureMap = new Map(); // feature -> test file(s)
  }

  /**
   * Parse all E2E test files
   */
  async parseTests() {
    // Find all E2E test files
    const pattern = path.join(this.testDir, '**/*.test.js');
    this.testFiles = await glob(pattern);

    console.log(`\n🔍 Parsing ${this.testFiles.length} E2E test files...\n`);

    // Parse each file for @feature tags
    for (const testFile of this.testFiles) {
      await this.parseFile(testFile);
    }
  }

  /**
   * Parse single test file for @feature tags
   */
  async parseFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.projectRoot, filePath);

    // Extract @feature tags from comments
    const featureRegex = /@feature\s+([a-z0-9-]+)/g;
    let match;
    const features = [];

    while ((match = featureRegex.exec(content)) !== null) {
      const feature = match[1];
      features.push(feature);

      // Add to feature map
      if (!this.featureMap.has(feature)) {
        this.featureMap.set(feature, []);
      }
      this.featureMap.get(feature).push(relativePath);
    }

    if (features.length > 0) {
      console.log(`✅ ${relativePath}`);
      features.forEach((f) => console.log(`   @feature ${f}`));
    }
  }

  /**
   * Load registry
   */
  loadRegistry() {
    try {
      const content = fs.readFileSync(this.registryPath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      console.error('❌ Failed to load registry:', error.message);
      return null;
    }
  }

  /**
   * Validate that all implemented features have E2E tests
   */
  async validate() {
    await this.parseTests();

    const registry = this.loadRegistry();
    if (!registry) return false;

    console.log('\n🔍 Validating E2E test coverage...\n');
    console.log('═'.repeat(80));

    const features = registry.features || {};
    let allValid = true;
    const errors = [];
    const warnings = [];

    Object.entries(features).forEach(([slug, feature]) => {
      // Only validate implemented features
      if (feature.status !== 'implemented') return;

      const hasTest = this.featureMap.has(slug);
      const registryTest = feature.e2e_test;

      if (!hasTest && !registryTest) {
        errors.push(`Feature '${slug}' is implemented but has no E2E test`);
        allValid = false;
      } else if (!hasTest && registryTest) {
        warnings.push(
          `Feature '${slug}' has e2e_test in registry but no @feature tag in test files`,
        );
      } else if (hasTest && !registryTest) {
        warnings.push(`Feature '${slug}' has @feature tag but no e2e_test in registry`);
      } else {
        console.log(`✅ ${slug}`);
        console.log(`   Registry: ${registryTest}`);
        console.log(`   Test files: ${this.featureMap.get(slug).join(', ')}`);
      }
    });

    console.log('\n' + '═'.repeat(80));

    if (errors.length > 0) {
      console.log('\n❌ Validation FAILED\n');
      console.log('Errors:');
      errors.forEach((err) => console.log(`  - ${err}`));
      allValid = false;
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach((warn) => console.log(`  - ${warn}`));
    }

    if (allValid && errors.length === 0) {
      console.log('\n✅ All implemented features have E2E test coverage');
    }

    console.log('');

    return allValid;
  }

  /**
   * Generate coverage report
   */
  async report() {
    await this.parseTests();

    const registry = this.loadRegistry();
    if (!registry) return;

    const features = registry.features || {};
    const implemented = Object.entries(features).filter(([_, f]) => f.status === 'implemented');
    const withTests = implemented.filter(([slug, _]) => this.featureMap.has(slug));

    console.log('\n📊 E2E Test Coverage Report\n');
    console.log('═'.repeat(80));

    console.log(`\n📝 Total Features: ${Object.keys(features).length}`);
    console.log(`   Implemented: ${implemented.length}`);
    console.log(`   With E2E Tests: ${withTests.length}`);

    const coverage =
      implemented.length > 0 ? Math.round((withTests.length / implemented.length) * 100) : 0;

    console.log(`\n📈 E2E Test Coverage: ${coverage}%`);

    console.log('\n🧪 Test Files Found:');
    this.testFiles.forEach((file) => {
      const relative = path.relative(this.projectRoot, file);
      console.log(`   - ${relative}`);
    });

    console.log('\n🔗 Feature → Test Mapping:');
    this.featureMap.forEach((tests, feature) => {
      console.log(`   ${feature}:`);
      tests.forEach((test) => console.log(`      → ${test}`));
    });

    console.log('\n' + '═'.repeat(80));
    console.log('');
  }

  /**
   * List all @feature tags found
   */
  async list() {
    await this.parseTests();

    console.log('\n📋 Features Found in E2E Tests\n');
    console.log('═'.repeat(80));

    if (this.featureMap.size === 0) {
      console.log('No @feature tags found in E2E tests');
    } else {
      this.featureMap.forEach((tests, feature) => {
        console.log(`\n✅ ${feature}`);
        tests.forEach((test) => console.log(`   → ${test}`));
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`Total: ${this.featureMap.size} features with E2E tests`);
    console.log('');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'validate';

  const parser = new E2EParser();

  switch (command) {
    case 'validate':
      const valid = await parser.validate();
      process.exit(valid ? 0 : 1);
      break;

    case 'report':
      await parser.report();
      break;

    case 'list':
      await parser.list();
      break;

    default:
      console.log(`
E2E Test Parser

Usage:
  node e2e-parser.js <command>

Commands:
  validate    Validate that all implemented features have E2E tests (default)
  report      Generate E2E test coverage report
  list        List all @feature tags found in E2E tests

Examples:
  node e2e-parser.js validate
  node e2e-parser.js report
  node e2e-parser.js list
      `);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = E2EParser;
