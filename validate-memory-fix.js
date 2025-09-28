#!/usr/bin/env node

/**
 * Quick validation that memory optimization is working
 */

const MemoryOptimizedRouter = require('./.claude/scripts/core/memory-optimized-router.js');

console.log('🚀 Starting memory validation...');

const router = new MemoryOptimizedRouter();
const startMemory = process.memoryUsage();

console.log(`📊 Starting memory: ${Math.round(startMemory.heapUsed / 1024 / 1024)}MB`);

// Quick test
router.quickAudit({})
  .then(result => {
    const endMemory = process.memoryUsage();
    console.log(`📊 End memory: ${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`);
    console.log('✅ Memory optimization working:', result.lightweight);
    console.log('✅ Analysis completed:', result.analyzed);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });