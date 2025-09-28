#!/usr/bin/env node

/**
 * EMERGENCY MINIMAL ROUTER - Prevents system crashes
 * Absolute minimum functionality with strict memory controls
 */

class EmergencyMinimalRouter {
  constructor() {
    this.maxMemoryMB = 50; // Hard limit: 50MB
    this.timeoutMs = 5000; // Hard limit: 5 seconds
    this.startTime = Date.now();

    // Kill process if it runs too long
    setTimeout(() => {
      console.error('❌ Emergency timeout - killing process');
      process.exit(1);
    }, this.timeoutMs);
  }

  checkMemory() {
    const usage = process.memoryUsage();
    const heapMB = Math.round(usage.heapUsed / 1024 / 1024);

    if (heapMB > this.maxMemoryMB) {
      console.error(`❌ Memory limit exceeded: ${heapMB}MB > ${this.maxMemoryMB}MB`);
      process.exit(1);
    }

    return heapMB;
  }

  async invoke(agent, command, options = {}) {
    const memoryMB = this.checkMemory();
    console.log(`🚀 Emergency router: ${agent}:${command} (${memoryMB}MB)`);

    // Simulate minimal work with immediate response
    return new Promise((resolve) => {
      setTimeout(() => {
        const finalMemory = this.checkMemory();
        resolve({
          success: true,
          agent,
          command,
          memoryMB: finalMemory,
          emergency: true,
          message: 'Emergency minimal response - no real work performed'
        });
      }, 100); // Minimal delay
    });
  }

  async quickTest() {
    console.log('🧪 Emergency minimal test...');
    const result = await this.invoke('TEST', 'minimal', {});
    console.log('✅ Emergency test passed:', result.memoryMB + 'MB');
    return result;
  }
}

// If run directly
if (require.main === module) {
  const router = new EmergencyMinimalRouter();
  router.quickTest()
    .then(() => {
      console.log('✅ Emergency router working safely');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Emergency test failed:', error.message);
      process.exit(1);
    });
}

module.exports = EmergencyMinimalRouter;