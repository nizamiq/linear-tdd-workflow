#!/usr/bin/env node

/**
 * User Story Registry Helper
 *
 * CLI tool for managing the user story registry:
 * - List all features
 * - Show coverage statistics
 * - Add new features
 * - Validate registry format
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class RegistryHelper {
  constructor() {
    this.registryPath = path.join(process.cwd(), '.claude/user-stories/registry.yaml');
    this.registry = null;
  }

  /**
   * Load registry from YAML file
   */
  loadRegistry() {
    try {
      const content = fs.readFileSync(this.registryPath, 'utf8');
      this.registry = yaml.load(content);
      return true;
    } catch (error) {
      console.error('❌ Failed to load registry:', error.message);
      console.error(`   Expected location: ${this.registryPath}`);
      return false;
    }
  }

  /**
   * Save registry to YAML file
   */
  saveRegistry() {
    try {
      const content = yaml.dump(this.registry, { indent: 2, lineWidth: 120 });
      fs.writeFileSync(this.registryPath, content, 'utf8');
      return true;
    } catch (error) {
      console.error('❌ Failed to save registry:', error.message);
      return false;
    }
  }

  /**
   * List all features
   */
  list() {
    if (!this.loadRegistry()) return;

    console.log('\n📋 User Story Registry\n');
    console.log('═'.repeat(80));

    const features = this.registry.features || {};
    const slugs = Object.keys(features);

    if (slugs.length === 0) {
      console.log('No features in registry');
      return;
    }

    slugs.forEach((slug) => {
      const feature = features[slug];
      const statusIcon = this.getStatusIcon(feature.status);
      const testStatus = feature.e2e_test ? '✅ E2E' : '❌ No E2E';

      console.log(`\n${statusIcon} ${slug}`);
      console.log(`   Name: ${feature.name}`);
      console.log(`   Status: ${feature.status}`);
      console.log(`   E2E Test: ${testStatus}`);
      if (feature.e2e_test) {
        console.log(`   Test Path: ${feature.e2e_test}`);
      }
      if (feature.notes) {
        console.log(`   Notes: ${feature.notes}`);
      }
    });

    console.log('\n' + '═'.repeat(80));
    console.log(`Total features: ${slugs.length}`);
  }

  /**
   * Show coverage statistics
   */
  coverage() {
    if (!this.loadRegistry()) return;

    const features = this.registry.features || {};
    const implemented = Object.values(features).filter((f) => f.status === 'implemented');
    const partial = Object.values(features).filter((f) => f.status === 'partial');
    const planned = Object.values(features).filter((f) => f.status === 'planned');

    const implementedWithTests = implemented.filter((f) => f.e2e_test);
    const implementedWithoutTests = implemented.filter((f) => !f.e2e_test);

    const coveragePercent =
      implemented.length > 0
        ? Math.round((implementedWithTests.length / implemented.length) * 100)
        : 0;

    console.log('\n📊 User Story Coverage Report\n');
    console.log('═'.repeat(80));

    console.log(`\n✅ Implemented Features: ${implemented.length}`);
    console.log(`   With E2E tests: ${implementedWithTests.length}`);
    console.log(`   Without E2E tests: ${implementedWithoutTests.length}`);

    console.log(`\n⚠️  Partial Features (block release): ${partial.length}`);
    if (partial.length > 0) {
      partial.forEach((f) => {
        const slug = Object.keys(features).find((k) => features[k] === f);
        console.log(`   - ${slug}`);
      });
    }

    console.log(`\n⏳ Planned Features: ${planned.length}`);

    console.log(`\n📈 E2E Coverage: ${coveragePercent}%`);
    console.log(
      `   (${implementedWithTests.length}/${implemented.length} implemented features have E2E tests)`,
    );

    console.log('\n' + '═'.repeat(80));

    // Release readiness
    if (partial.length > 0 || implementedWithoutTests.length > 0) {
      console.log('\n❌ RELEASE BLOCKED');
      console.log(
        `   ${partial.length + implementedWithoutTests.length} feature(s) need E2E tests`,
      );
    } else if (implemented.length > 0) {
      console.log('\n✅ RELEASE READY');
      console.log(`   All implemented features have E2E test coverage`);
    } else {
      console.log('\n⚠️  No implemented features yet');
    }

    console.log('');
  }

  /**
   * Add new feature to registry
   */
  add(options) {
    if (!this.loadRegistry()) return;

    const { name, slug, status, test, notes } = options;

    if (!name) {
      console.error('❌ Error: --name is required');
      return;
    }

    // Auto-generate slug from name if not provided
    const featureSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Check if slug already exists
    if (this.registry.features[featureSlug]) {
      console.error(`❌ Error: Feature '${featureSlug}' already exists`);
      console.log(`   Use a different name or update existing feature`);
      return;
    }

    // Validate status
    const validStatuses = ['implemented', 'partial', 'planned'];
    if (status && !validStatuses.includes(status)) {
      console.error(`❌ Error: Invalid status '${status}'`);
      console.log(`   Valid values: ${validStatuses.join(', ')}`);
      return;
    }

    // Create feature entry
    const feature = {
      name,
      status: status || 'planned',
      e2e_test: test || null,
      notes: notes || '',
    };

    // Add to registry
    this.registry.features[featureSlug] = feature;
    this.registry.last_updated = new Date().toISOString().split('T')[0];

    // Save
    if (this.saveRegistry()) {
      console.log(`\n✅ Added feature: ${featureSlug}`);
      console.log(`   Name: ${name}`);
      console.log(`   Status: ${feature.status}`);
      if (test) {
        console.log(`   E2E Test: ${test}`);
      }
      console.log('');
    }
  }

  /**
   * Validate registry format
   */
  validate() {
    if (!this.loadRegistry()) return;

    console.log('\n🔍 Validating registry format...\n');

    const errors = [];
    const warnings = [];

    // Check required top-level fields
    if (!this.registry.features) {
      errors.push('Missing required field: features');
    }

    if (!this.registry.registry_version) {
      warnings.push('Missing recommended field: registry_version');
    }

    // Validate each feature
    const features = this.registry.features || {};
    Object.entries(features).forEach(([slug, feature]) => {
      // Check required fields
      if (!feature.name) {
        errors.push(`Feature '${slug}': missing required field 'name'`);
      }
      if (!feature.status) {
        errors.push(`Feature '${slug}': missing required field 'status'`);
      }

      // Validate status value
      const validStatuses = ['implemented', 'partial', 'planned'];
      if (feature.status && !validStatuses.includes(feature.status)) {
        errors.push(`Feature '${slug}': invalid status '${feature.status}'`);
      }

      // Check for inconsistencies
      if (feature.status === 'implemented' && !feature.e2e_test) {
        warnings.push(
          `Feature '${slug}': status is 'implemented' but no E2E test specified (should be 'partial')`,
        );
      }

      if (feature.status === 'partial' && feature.e2e_test) {
        warnings.push(
          `Feature '${slug}': status is 'partial' but E2E test is specified (should be 'implemented')`,
        );
      }

      // Validate E2E test path format
      if (feature.e2e_test && typeof feature.e2e_test !== 'string') {
        errors.push(`Feature '${slug}': e2e_test must be a string or null`);
      }
    });

    // Report results
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ Registry is valid');
      console.log(`   ${Object.keys(features).length} features validated`);
    } else {
      if (errors.length > 0) {
        console.log('❌ Validation FAILED\n');
        console.log('Errors:');
        errors.forEach((err) => console.log(`  - ${err}`));
      }

      if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        warnings.forEach((warn) => console.log(`  - ${warn}`));
      }
    }

    console.log('');

    return errors.length === 0;
  }

  /**
   * Get status icon
   */
  getStatusIcon(status) {
    const icons = {
      implemented: '✅',
      partial: '⚠️',
      planned: '⏳',
    };
    return icons[status] || '❓';
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const helper = new RegistryHelper();

  switch (command) {
    case 'list':
      helper.list();
      break;

    case 'coverage':
      helper.coverage();
      break;

    case 'add': {
      const options = {};
      for (let i = 1; i < args.length; i += 2) {
        const key = args[i].replace(/^--/, '');
        const value = args[i + 1];
        options[key] = value;
      }
      helper.add(options);
      break;
    }

    case 'validate':
      helper.validate();
      break;

    default:
      console.log(`
User Story Registry Helper

Usage:
  node registry-helper.js <command> [options]

Commands:
  list                     List all features
  coverage                 Show E2E coverage statistics
  add                      Add new feature to registry
  validate                 Validate registry format

Add Options:
  --name <name>           Feature name (required)
  --slug <slug>           Feature slug (auto-generated if omitted)
  --status <status>       Feature status (implemented|partial|planned)
  --test <path>           E2E test path
  --notes <notes>         Implementation notes

Examples:
  node registry-helper.js list
  node registry-helper.js coverage
  node registry-helper.js add --name "User authentication" --status implemented --test "tests/e2e/auth.test.js"
  node registry-helper.js validate
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = RegistryHelper;
