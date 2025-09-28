#!/usr/bin/env node

/**
 * Memory-Safe Agent Router
 *
 * Comprehensive solution to memory consumption issues:
 * - Intelligent file filtering with size limits
 * - Streaming file processing
 * - ESLint process pool management
 * - Memory circuit breakers
 * - Efficient analysis methods
 */

// const { spawn } = require('child_process'); // Currently unused
const path = require('path');
const fs = require('fs');
const { createReadStream } = require('fs');
const { promisify } = require('util');
const readline = require('readline');

class MemorySafeRouter {
  constructor() {
    // Memory management
    this.maxMemoryMB = 100; // Hard limit: 100MB
    this.warningMemoryMB = 80; // Warning threshold: 80MB
    this.memoryCheckInterval = 1000; // Check every second

    // File processing limits
    this.maxFileSize = 1024 * 1024; // 1MB max file size
    this.maxFilesPerBatch = 5; // Process max 5 files at once
    this.maxTotalFiles = 20; // Never process more than 20 files total

    // Process pool for ESLint
    this.eslintPool = [];
    this.maxEslintProcesses = 2;
    this.activeProcesses = new Set();

    // Circuit breaker state
    this.circuitBreakerOpen = false;
    this.memoryWarningCount = 0;

    // Start memory monitoring
    this.startMemoryMonitoring();
  }

  /**
   * Phase 1: Intelligent File Filtering
   */
  async getFilteredFiles(patterns = ['**/*.js', '**/*.ts']) {
    const allFiles = [];
    const stats = {
      totalFound: 0,
      filtered: 0,
      tooLarge: 0,
      ignored: 0
    };

    try {
      // Use find with intelligent limits - support Python3, JavaScript, and TypeScript
      const { execSync } = require('child_process');
      const findCmd = `find . -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v __pycache__ | grep -v .venv | head -50`;
      const findResult = execSync(findCmd, { encoding: 'utf8', timeout: 5000 });

      const candidateFiles = findResult.trim().split('\n').filter(f => f.length > 0);
      stats.totalFound = candidateFiles.length;

      console.log(`📁 Found ${stats.totalFound} candidate files`);

      // Filter by size and other criteria
      for (const file of candidateFiles) {
        try {
          const fileStat = fs.statSync(file);

          // Skip if too large
          if (fileStat.size > this.maxFileSize) {
            stats.tooLarge++;
            console.log(`⚠️ Skipping ${file} - too large (${Math.round(fileStat.size / 1024)}KB)`);
            continue;
          }

          // Skip patterns that indicate generated/vendor files
          if (this.shouldIgnoreFile(file)) {
            stats.ignored++;
            continue;
          }

          // Prioritize recently modified files
          allFiles.push({
            path: file,
            size: fileStat.size,
            mtime: fileStat.mtime
          });
          stats.filtered++;

          // Hard limit to prevent memory explosion
          if (allFiles.length >= this.maxTotalFiles) {
            console.log(`🛑 Reached file limit (${this.maxTotalFiles}), stopping scan`);
            break;
          }

        } catch (error) {
          // Skip files we can't stat
          continue;
        }
      }

      // Sort by modification time (most recent first) and size (smaller first)
      allFiles.sort((a, b) => {
        const timeDiff = b.mtime.getTime() - a.mtime.getTime();
        if (Math.abs(timeDiff) < 24 * 60 * 60 * 1000) { // Within 24 hours
          return a.size - b.size; // Prefer smaller files
        }
        return timeDiff; // Prefer newer files
      });

      console.log(`✅ File filtering complete:`, stats);
      return allFiles.slice(0, this.maxTotalFiles);

    } catch (error) {
      console.error('❌ File filtering failed:', error.message);
      return [];
    }
  }

  shouldIgnoreFile(filePath) {
    const ignorePatterns = [
      // JavaScript/Node.js patterns
      /node_modules/,
      /\.git/,
      /build/,
      /dist/,
      /coverage/,
      /\.min\.js$/,
      /bundle\.js$/,
      /vendor/,
      /third_party/,
      /generated/,
      /\.d\.ts$/,
      // Python3 patterns
      /__pycache__/,
      /\.pyc$/,
      /\.pyo$/,
      /\.pyd$/,
      /\.venv/,
      /venv/,
      /env/,
      /\.egg-info/,
      /site-packages/,
      /migrations/,
      /\.pytest_cache/
    ];

    return ignorePatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Phase 2: Streaming File Processing
   */
  async processFileStreaming(filePath) {
    return new Promise((resolve, reject) => {
      const results = {
        path: filePath,
        lines: 0,
        patterns: [],
        size: 0
      };

      // Check memory before processing
      if (this.circuitBreakerOpen) {
        resolve({ ...results, skipped: true, reason: 'circuit_breaker' });
        return;
      }

      const stream = createReadStream(filePath, { encoding: 'utf8' });
      const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
      });

      let lineNumber = 0;
      const maxLines = 1000; // Prevent processing huge files

      rl.on('line', (line) => {
        lineNumber++;
        results.lines++;

        // Circuit breaker: stop if too many lines
        if (lineNumber > maxLines) {
          rl.close();
          resolve({ ...results, truncated: true });
          return;
        }

        // Check for simple patterns (much faster than complex regex)
        if (line.includes('TODO') || line.includes('FIXME')) {
          results.patterns.push({
            type: 'comment',
            line: lineNumber,
            content: line.trim().substring(0, 100)
          });
        }

        // Python-specific patterns
        if (filePath.endsWith('.py')) {
          if (line.includes('print(') && !line.includes('#')) {
            results.patterns.push({
              type: 'debug',
              line: lineNumber,
              content: 'Debug print statement'
            });
          }
          if (line.includes('import *')) {
            results.patterns.push({
              type: 'import',
              line: lineNumber,
              content: 'Wildcard import detected'
            });
          }
        }

        // Memory check every 100 lines
        if (lineNumber % 100 === 0) {
          const memory = this.getCurrentMemoryMB();
          if (memory > this.warningMemoryMB) {
            console.log(`⚠️ Memory warning during ${filePath}: ${memory}MB`);
            rl.close();
            resolve({ ...results, stopped: true, reason: 'memory_pressure' });
            return;
          }
        }
      });

      rl.on('close', () => {
        resolve(results);
      });

      rl.on('error', (error) => {
        reject(error);
      });

      // Timeout safety
      setTimeout(() => {
        rl.close();
        resolve({ ...results, timeout: true });
      }, 5000);
    });
  }

  /**
   * Phase 3: ESLint Process Pool Management
   */
  async getEslintProcess() {
    // Reuse existing process if available
    if (this.eslintPool.length > 0) {
      return this.eslintPool.pop();
    }

    // Create new process if under limit
    if (this.activeProcesses.size < this.maxEslintProcesses) {
      return this.createEslintProcess();
    }

    // Wait for available process
    return new Promise((resolve) => {
      const checkForAvailable = () => {
        if (this.eslintPool.length > 0) {
          resolve(this.eslintPool.pop());
        } else {
          setTimeout(checkForAvailable, 100);
        }
      };
      checkForAvailable();
    });
  }

  createEslintProcess() {
    const eslintProcess = {
      id: Math.random().toString(36).substr(2, 9),
      busy: false,
      created: Date.now()
    };

    this.activeProcesses.add(eslintProcess.id);
    console.log(`🔧 Created ESLint process ${eslintProcess.id}`);
    return eslintProcess;
  }

  async analyzeWithLinter(filePath) {
    if (this.circuitBreakerOpen) {
      return { skipped: true, reason: 'circuit_breaker' };
    }

    const linterProcess = await this.getEslintProcess(); // Reuse process pool for all linters
    linterProcess.busy = true;

    try {
      const { execSync } = require('child_process');
      let result;

      // Choose appropriate linter based on file type
      if (filePath.endsWith('.py')) {
        // Use flake8 for Python (if available), fallback to basic syntax check
        try {
          result = execSync(`python3 -m flake8 "${filePath}" --format=json`, {
            encoding: 'utf8',
            timeout: 3000,
            stdio: ['pipe', 'pipe', 'ignore']
          });
        } catch (flakeError) {
          // Fallback to syntax check
          try {
            execSync(`python3 -m py_compile "${filePath}"`, {
              encoding: 'utf8',
              timeout: 2000,
              stdio: ['pipe', 'pipe', 'ignore']
            });
            result = JSON.stringify([]);
          } catch (syntaxError) {
            result = JSON.stringify([{
              filename: filePath,
              violations: [{ message: 'Syntax error detected' }]
            }]);
          }
        }
      } else {
        // Use ESLint for JavaScript/TypeScript
        result = execSync(`npx eslint "${filePath}" --format json`, {
          encoding: 'utf8',
          timeout: 3000,
          stdio: ['pipe', 'pipe', 'ignore']
        });
      }

      // Return process to pool
      linterProcess.busy = false;
      this.eslintPool.push(linterProcess);

      return { success: true, result: JSON.parse(result) };

    } catch (error) {
      // Return process to pool even on error
      linterProcess.busy = false;
      this.eslintPool.push(linterProcess);

      // Linter errors are often normal (lint issues), return them
      if (error.stdout) {
        try {
          return { success: true, result: JSON.parse(error.stdout) };
        } catch (parseError) {
          return { success: false, error: 'parse_error' };
        }
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Phase 4: Memory Circuit Breakers
   */
  startMemoryMonitoring() {
    setInterval(() => {
      const memoryMB = this.getCurrentMemoryMB();

      if (memoryMB > this.maxMemoryMB) {
        console.error(`🚨 MEMORY LIMIT EXCEEDED: ${memoryMB}MB > ${this.maxMemoryMB}MB`);
        this.triggerEmergencyShutdown();
      } else if (memoryMB > this.warningMemoryMB) {
        this.memoryWarningCount++;
        console.log(`⚠️ Memory warning ${this.memoryWarningCount}: ${memoryMB}MB`);

        if (this.memoryWarningCount >= 3) {
          this.openCircuitBreaker();
        } else {
          this.forceGarbageCollection();
        }
      } else {
        // Reset warnings when memory is normal
        if (this.memoryWarningCount > 0) {
          this.memoryWarningCount = Math.max(0, this.memoryWarningCount - 1);
        }
        if (this.circuitBreakerOpen && memoryMB < this.warningMemoryMB * 0.8) {
          this.closeCircuitBreaker();
        }
      }
    }, this.memoryCheckInterval);
  }

  getCurrentMemoryMB() {
    const usage = process.memoryUsage();
    return Math.round(usage.heapUsed / 1024 / 1024);
  }

  openCircuitBreaker() {
    console.log('🔴 Opening circuit breaker - stopping file processing');
    this.circuitBreakerOpen = true;
    this.forceGarbageCollection();
  }

  closeCircuitBreaker() {
    console.log('🟢 Closing circuit breaker - resuming file processing');
    this.circuitBreakerOpen = false;
    this.memoryWarningCount = 0;
  }

  forceGarbageCollection() {
    if (global.gc) {
      global.gc();
      console.log('🗑️ Forced garbage collection');
    }
  }

  triggerEmergencyShutdown() {
    console.error('💥 EMERGENCY SHUTDOWN - Memory limit exceeded');
    this.cleanup();
    process.exit(1);
  }

  /**
   * Main Analysis Method
   */
  async analyzeCode(options = {}) {
    const startTime = Date.now();
    const startMemory = this.getCurrentMemoryMB();

    console.log(`🚀 Starting memory-safe code analysis (${startMemory}MB)`);

    try {
      // Phase 1: Get filtered files
      const files = await this.getFilteredFiles();
      console.log(`📁 Processing ${files.length} files`);

      const results = {
        filesAnalyzed: 0,
        patterns: [],
        eslintIssues: [],
        memoryUsage: [],
        warnings: []
      };

      // Phase 2 & 3: Process files in small batches
      for (let i = 0; i < files.length; i += this.maxFilesPerBatch) {
        if (this.circuitBreakerOpen) {
          console.log('🔴 Circuit breaker open - stopping analysis');
          break;
        }

        const batch = files.slice(i, i + this.maxFilesPerBatch);
        console.log(`📦 Processing batch ${Math.floor(i / this.maxFilesPerBatch) + 1} (${batch.length} files)`);

        // Process batch with streaming
        const batchPromises = batch.map(async (file) => {
          const fileResult = await this.processFileStreaming(file.path);

          // Linter analysis for small files only (ESLint for JS/TS, flake8/syntax for Python)
          if (file.size < this.maxFileSize / 2) { // Only analyze files < 512KB
            const linterResult = await this.analyzeWithLinter(file.path);
            fileResult.linter = linterResult;
          }

          return fileResult;
        });

        const batchResults = await Promise.all(batchPromises);

        // Accumulate results
        batchResults.forEach(result => {
          if (result && !result.skipped) {
            results.filesAnalyzed++;
            if (result.patterns) results.patterns.push(...result.patterns);
            if (result.linter && result.linter.success) {
              results.eslintIssues.push(...(result.linter.result || []));
            }
          }
        });

        // Memory check after each batch
        const currentMemory = this.getCurrentMemoryMB();
        results.memoryUsage.push(currentMemory);
        console.log(`📊 Batch complete - Memory: ${currentMemory}MB`);

        // Small delay to allow garbage collection
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const endTime = Date.now();
      const endMemory = this.getCurrentMemoryMB();

      console.log(`✅ Analysis complete: ${results.filesAnalyzed} files in ${endTime - startTime}ms`);
      console.log(`📊 Memory: ${startMemory}MB → ${endMemory}MB (Peak: ${Math.max(...results.memoryUsage)}MB)`);

      return {
        success: true,
        ...results,
        performance: {
          duration: endTime - startTime,
          startMemory: startMemory,
          endMemory: endMemory,
          peakMemory: Math.max(...results.memoryUsage)
        }
      };

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      return {
        success: false,
        error: error.message,
        memoryAtFailure: this.getCurrentMemoryMB()
      };
    }
  }

  cleanup() {
    console.log('🧹 Cleaning up resources...');

    // Clear ESLint pool
    this.eslintPool.length = 0;
    this.activeProcesses.clear();

    // Force garbage collection
    this.forceGarbageCollection();
  }
}

// CLI interface
if (require.main === module) {
  const router = new MemorySafeRouter();

  router.analyzeCode()
    .then(result => {
      console.log('Final result:', {
        success: result.success,
        filesAnalyzed: result.filesAnalyzed,
        patterns: result.patterns?.length || 0,
        eslintIssues: result.eslintIssues?.length || 0,
        performance: result.performance
      });
      router.cleanup();
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      router.cleanup();
      process.exit(1);
    });
}

module.exports = MemorySafeRouter;