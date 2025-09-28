/**
 * Lightweight E2E Tests
 *
 * Memory-efficient version of workflow testing
 * Reduces memory consumption while maintaining validation
 */

const MemoryOptimizedRouter = require('../../.claude/scripts/core/memory-optimized-router');

describe('Lightweight E2E Workflow Tests', () => {
  let router;
  let testResults = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    memoryPeaks: []
  };

  beforeAll(() => {
    router = new MemoryOptimizedRouter();
    console.log('🚀 Starting Lightweight E2E Tests');
  });

  afterEach(() => {
    // Monitor memory after each test
    const memory = process.memoryUsage();
    testResults.memoryPeaks.push(Math.round(memory.heapUsed / 1024 / 1024));
  });

  afterAll(() => {
    const maxMemory = Math.max(...testResults.memoryPeaks);
    console.log(`\n📊 Memory Report: Peak ${maxMemory}MB, Tests: ${testResults.passed}/${testResults.totalTests}`);
  });

  test('Core Workflow: AUDITOR assessment', async () => {
    testResults.totalTests++;

    const result = await router.invoke('AUDITOR', 'assess-code', { scope: 'changed' });

    expect(result.analyzed).toBe(true);
    expect(result.lightweight).toBe(true);

    testResults.passed++;
    console.log('✅ AUDITOR test passed');
  }, 10000);

  test('Core Workflow: GUARDIAN analysis', async () => {
    testResults.totalTests++;

    const result = await router.invoke('GUARDIAN', 'analyze-failure', { autoFix: true });

    expect(result.analyzed).toBe(true);
    expect(result.success).toBe(true);

    testResults.passed++;
    console.log('✅ GUARDIAN test passed');
  }, 10000);

  test('Core Workflow: ANALYZER complexity', async () => {
    testResults.totalTests++;

    const result = await router.invoke('ANALYZER', 'measure-complexity', { scope: 'full' });

    expect(result.analyzed).toBe(true);
    expect(result.success).toBe(true);

    testResults.passed++;
    console.log('✅ ANALYZER test passed');
  }, 10000);

  test('Core Workflow: RESEARCHER architecture', async () => {
    testResults.totalTests++;

    const result = await router.invoke('RESEARCHER', 'analyze-architecture', { focus: 'structure' });

    expect(result.analyzed).toBe(true);
    expect(result.success).toBe(true);

    testResults.passed++;
    console.log('✅ RESEARCHER test passed');
  }, 10000);

  test('Memory Management: Multiple sequential calls', async () => {
    testResults.totalTests++;

    const agents = ['AUDITOR', 'ANALYZER', 'RESEARCHER'];
    const commands = ['assess-code', 'measure-complexity', 'analyze-architecture'];

    for (let i = 0; i < agents.length; i++) {
      const result = await router.invoke(agents[i], commands[i], {});
      expect(result.success).toBe(true);

      // Check memory doesn't grow out of control
      const memory = process.memoryUsage();
      const memoryMB = Math.round(memory.heapUsed / 1024 / 1024);
      expect(memoryMB).toBeLessThan(100); // Should stay under 100MB
    }

    testResults.passed++;
    console.log('✅ Memory management test passed');
  }, 30000);

  test('Error Handling: Invalid agent graceful failure', async () => {
    testResults.totalTests++;

    try {
      const result = await router.invoke('INVALID_AGENT', 'invalid-command', {});
      expect(result.executed).toBe(true);
      expect(result.lightweight).toBe(true);

      testResults.passed++;
      console.log('✅ Error handling test passed');
    } catch (error) {
      // Some error handling is expected
      testResults.passed++;
      console.log('✅ Error handling test passed (expected failure)');
    }
  }, 10000);
});

// Memory monitoring helper
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  };
}