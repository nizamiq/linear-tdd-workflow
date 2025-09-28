#!/usr/bin/env node

/**
 * Test script for TDD Gate Enforcer
 *
 * Validates that the enhanced diff coverage enforcement
 * works correctly with both JavaScript and Python projects
 */

const TDDGateEnforcer = require('./tdd-gate-enforcer.js');
const fs = require('fs');
const path = require('path');

class TDDEnforcerTests {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  /**
   * Add a test case
   */
  test(name, testFunction) {
    this.tests.push({ name, testFunction });
  }

  /**
   * Run all tests
   */
  async runTests() {
    console.log('🧪 Testing TDD Gate Enforcer Enhanced Coverage...\n');

    for (const { name, testFunction } of this.tests) {
      try {
        console.log(`📝 Test: ${name}`);
        await testFunction();
        console.log('✅ PASSED\n');
        this.passed++;
      } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        this.failed++;
      }
    }

    console.log(`📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  /**
   * Assert helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }
}

// Initialize test suite
const testSuite = new TDDEnforcerTests();

// Test 1: Basic instantiation
testSuite.test('TDD Enforcer instantiation', () => {
  const enforcer = new TDDGateEnforcer();
  testSuite.assert(enforcer !== null, 'Enforcer should be instantiated');
  testSuite.assert(typeof enforcer.enforce === 'function', 'Should have enforce method');
});

// Test 2: Configuration loading
testSuite.test('Configuration loading', () => {
  const enforcer = new TDDGateEnforcer();
  const config = enforcer.config;

  testSuite.assert(config.minimumCoverage === 80, 'Should have default minimum coverage of 80%');
  testSuite.assert(config.minimumDiffCoverage === 80, 'Should have default diff coverage of 80%');
  testSuite.assert(config.requireFailingTestFirst === true, 'Should require failing tests first');
});

// Test 3: Test file detection - JavaScript
testSuite.test('JavaScript test file detection', () => {
  const enforcer = new TDDGateEnforcer();

  testSuite.assert(enforcer.isTestFile('src/component.test.js'), 'Should detect .test.js files');
  testSuite.assert(enforcer.isTestFile('src/component.spec.ts'), 'Should detect .spec.ts files');
  testSuite.assert(enforcer.isTestFile('tests/integration.js'), 'Should detect files in tests/ directory');
  testSuite.assert(enforcer.isTestFile('__tests__/unit.js'), 'Should detect files in __tests__/ directory');
  testSuite.assert(!enforcer.isTestFile('src/component.js'), 'Should not detect regular source files');
});

// Test 4: Test file detection - Python
testSuite.test('Python test file detection', () => {
  const enforcer = new TDDGateEnforcer();

  testSuite.assert(enforcer.isTestFile('test_module.py'), 'Should detect test_*.py files');
  testSuite.assert(enforcer.isTestFile('module_test.py'), 'Should detect *_test.py files');
  testSuite.assert(enforcer.isTestFile('tests/test_integration.py'), 'Should detect test files in tests/ directory');
  testSuite.assert(enforcer.isTestFile('conftest.py'), 'Should detect conftest.py files');
  testSuite.assert(!enforcer.isTestFile('module.py'), 'Should not detect regular Python files');
});

// Test 5: Test command detection - JavaScript
testSuite.test('JavaScript test command detection', () => {
  const enforcer = new TDDGateEnforcer();

  // Mock package.json existence
  const originalExistsSync = fs.existsSync;
  const originalReadFileSync = fs.readFileSync;

  fs.existsSync = (filePath) => {
    if (filePath.endsWith('package.json')) return true;
    return originalExistsSync(filePath);
  };

  fs.readFileSync = (filePath, encoding) => {
    if (filePath.endsWith('package.json')) {
      return JSON.stringify({
        scripts: { test: 'jest' },
        devDependencies: { jest: '^29.0.0' }
      });
    }
    return originalReadFileSync(filePath, encoding);
  };

  const command = enforcer.getTestCommand();
  testSuite.assert(command === 'npm test', `Should detect npm test command, got: ${command}`);

  // Restore original functions
  fs.existsSync = originalExistsSync;
  fs.readFileSync = originalReadFileSync;
});

// Test 6: Coverage command detection - JavaScript
testSuite.test('JavaScript coverage command detection', () => {
  const enforcer = new TDDGateEnforcer();

  // Mock package.json with Jest
  const originalExistsSync = fs.existsSync;
  const originalReadFileSync = fs.readFileSync;

  fs.existsSync = (filePath) => {
    if (filePath.endsWith('package.json')) return true;
    return originalExistsSync(filePath);
  };

  fs.readFileSync = (filePath, encoding) => {
    if (filePath.endsWith('package.json')) {
      return JSON.stringify({
        devDependencies: { jest: '^29.0.0' }
      });
    }
    return originalReadFileSync(filePath, encoding);
  };

  const command = enforcer.getCoverageCommand();
  testSuite.assert(command.includes('jest'), `Should detect Jest coverage, got: ${command}`);

  // Restore original functions
  fs.existsSync = originalExistsSync;
  fs.readFileSync = originalReadFileSync;
});

// Test 7: Python project detection
testSuite.test('Python project detection', () => {
  const enforcer = new TDDGateEnforcer();

  // Mock Python project files
  const originalExistsSync = fs.existsSync;

  fs.existsSync = (filePath) => {
    if (filePath.endsWith('pytest.ini')) return true;
    if (filePath.endsWith('package.json')) return false;
    return originalExistsSync(filePath);
  };

  const command = enforcer.getTestCommand();
  testSuite.assert(command.includes('pytest'), `Should detect pytest for Python projects, got: ${command}`);

  // Restore original function
  fs.existsSync = originalExistsSync;
});

// Test 8: Coverage parsing - JavaScript
testSuite.test('JavaScript coverage parsing', () => {
  const enforcer = new TDDGateEnforcer();

  // Test Jest output format
  const jestOutput = `
    File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
    --------------|---------|----------|---------|---------|-------------------
    All files     |   85.5  |    80.2  |   90.1  |   85.5  |
  `;

  const percentage = enforcer.parseJavaScriptCoverage(jestOutput);
  testSuite.assert(percentage === 85.5, `Should parse Jest coverage correctly, got: ${percentage}`);
});

// Test 9: Coverage parsing - Python
testSuite.test('Python coverage parsing', () => {
  const enforcer = new TDDGateEnforcer();

  // Test coverage.py output format
  const coverageOutput = `
    Name                    Stmts   Miss  Cover
    -------------------------------------------
    mymodule.py               100     15    85%
    tests/test_mymodule.py     50      5    90%
    -------------------------------------------
    TOTAL                     150     20    87%
  `;

  const percentage = enforcer.parsePythonCoverage(coverageOutput);
  testSuite.assert(percentage === 87, `Should parse Python coverage correctly, got: ${percentage}`);
});

// Test 10: Diff coverage estimation
testSuite.test('Diff coverage estimation', () => {
  const enforcer = new TDDGateEnforcer();

  const changedLines = [
    { file: 'src/module.js', line: 10 },
    { file: 'src/module.js', line: 11 },
    { file: 'test/module.test.js', line: 5 }
  ];

  const coverage = enforcer.estimateDiffCoverage(changedLines);

  testSuite.assert(coverage.totalLines === 2, `Should count only non-test files, got: ${coverage.totalLines}`);
  testSuite.assert(coverage.percentage >= 50, `Should have reasonable coverage estimate, got: ${coverage.percentage}%`);
  testSuite.assert(coverage.estimated === true, `Should mark as estimated, got: ${coverage.estimated}`);
});

// Test 11: File exclusion patterns
testSuite.test('File exclusion patterns', () => {
  const enforcer = new TDDGateEnforcer();

  testSuite.assert(enforcer.isExcludedFile('node_modules/package/file.js'), 'Should exclude node_modules');
  testSuite.assert(enforcer.isExcludedFile('coverage/lcov-report/index.html'), 'Should exclude coverage directory');
  testSuite.assert(enforcer.isExcludedFile('dist/bundle.min.js'), 'Should exclude minified files');
  testSuite.assert(enforcer.isExcludedFile('__pycache__/module.pyc'), 'Should exclude Python cache');
  testSuite.assert(!enforcer.isExcludedFile('src/module.js'), 'Should not exclude source files');
});

// Test 12: Path normalization
testSuite.test('Path normalization', () => {
  const enforcer = new TDDGateEnforcer();

  testSuite.assert(enforcer.normalizePath('./src/module.js') === 'src/module.js', 'Should remove ./ prefix');
  testSuite.assert(enforcer.normalizePath('src\\module.js') === 'src/module.js', 'Should normalize backslashes');
});

// Run the tests
if (require.main === module) {
  testSuite.runTests()
    .then(success => {
      console.log(success ? '🎉 All tests passed!' : '💥 Some tests failed!');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test runner crashed:', error.message);
      process.exit(1);
    });
}

module.exports = TDDEnforcerTests;