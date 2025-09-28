#!/usr/bin/env node

/**
 * Test Memory-Safe Router
 *
 * Validates that the new router prevents memory consumption issues
 * and provides controlled, predictable memory usage.
 */

const MemorySafeRouter = require('./.claude/scripts/core/memory-safe-router.js');

async function testMemorySafeRouter() {
  console.log('🧪 Testing Memory-Safe Router...\n');

  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  console.log(`📊 Starting conditions:`);
  console.log(`   Memory: ${Math.round(startMemory.heapUsed / 1024 / 1024)}MB`);
  console.log(`   Time: ${new Date().toISOString()}\n`);

  try {
    // Create router with conservative settings for testing
    const router = new MemorySafeRouter();

    // Override settings to be extra conservative for testing
    router.maxMemoryMB = 150; // Allow up to 150MB for testing
    router.warningMemoryMB = 120; // Warning at 120MB
    router.maxTotalFiles = 10; // Process max 10 files
    router.maxFilesPerBatch = 3; // Small batches

    console.log('🔧 Router configured with conservative limits:');
    console.log(`   Max memory: ${router.maxMemoryMB}MB`);
    console.log(`   Warning threshold: ${router.warningMemoryMB}MB`);
    console.log(`   Max files: ${router.maxTotalFiles}`);
    console.log(`   Batch size: ${router.maxFilesPerBatch}\n`);

    // Monitor memory during execution
    const memoryLog = [];
    const memoryMonitor = setInterval(() => {
      const current = process.memoryUsage();
      const heapMB = Math.round(current.heapUsed / 1024 / 1024);
      memoryLog.push({
        time: Date.now() - startTime,
        memory: heapMB
      });

      if (memoryLog.length % 5 === 0) { // Log every 5th check
        console.log(`📊 Memory check: ${heapMB}MB (${memoryLog.length} checks)`);
      }
    }, 500);

    // Run the analysis
    console.log('🚀 Starting analysis...\n');
    const result = await router.analyzeCode();

    // Stop monitoring
    clearInterval(memoryMonitor);

    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;

    console.log('\n✅ Analysis completed!\n');

    // Memory analysis
    const maxMemory = Math.max(...memoryLog.map(log => log.memory));
    const avgMemory = Math.round(memoryLog.reduce((sum, log) => sum + log.memory, 0) / memoryLog.length);

    console.log('📊 Memory Analysis:');
    console.log(`   Start: ${Math.round(startMemory.heapUsed / 1024 / 1024)}MB`);
    console.log(`   End: ${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`);
    console.log(`   Peak: ${maxMemory}MB`);
    console.log(`   Average: ${avgMemory}MB`);
    console.log(`   Limit: ${router.maxMemoryMB}MB`);
    console.log(`   ✅ Under limit: ${maxMemory < router.maxMemoryMB ? 'YES' : 'NO'}\n`);

    // Performance analysis
    console.log('⚡ Performance Analysis:');
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Files analyzed: ${result.filesAnalyzed || 0}`);
    console.log(`   Files per second: ${((result.filesAnalyzed || 0) / (duration / 1000)).toFixed(2)}`);
    console.log(`   Memory efficiency: ${(avgMemory / (result.filesAnalyzed || 1)).toFixed(1)}MB per file\n`);

    // Results analysis
    console.log('🔍 Analysis Results:');
    console.log(`   Success: ${result.success ? 'YES' : 'NO'}`);
    console.log(`   Patterns found: ${result.patterns?.length || 0}`);
    console.log(`   ESLint issues: ${result.eslintIssues?.length || 0}`);
    console.log(`   Circuit breaker triggered: ${router.circuitBreakerOpen ? 'YES' : 'NO'}\n`);

    // Validate memory safety
    const memorySafe = maxMemory < router.maxMemoryMB;
    const performanceGood = duration < 30000; // Should complete within 30 seconds
    const resultsValid = result.success && (result.filesAnalyzed || 0) > 0;

    console.log('🏆 Test Results:');
    console.log(`   ✅ Memory safe: ${memorySafe ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Performance good: ${performanceGood ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Results valid: ${resultsValid ? 'PASS' : 'FAIL'}`);

    const overallPass = memorySafe && performanceGood && resultsValid;
    console.log(`   🎯 Overall: ${overallPass ? 'PASS' : 'FAIL'}\n`);

    // Cleanup
    router.cleanup();

    if (overallPass) {
      console.log('🎉 Memory-Safe Router test PASSED!');
      console.log('   System memory consumption is now under control.');
      console.log('   No more system crashes expected.');
    } else {
      console.log('❌ Memory-Safe Router test FAILED!');
      console.log('   Issues need to be addressed before deployment.');
    }

    return overallPass;

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('Stack:', error.stack);

    const currentMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    console.log(`📊 Memory at failure: ${currentMemory}MB`);

    return false;
  }
}

// Run the test
testMemorySafeRouter()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal test error:', error.message);
    process.exit(1);
  });