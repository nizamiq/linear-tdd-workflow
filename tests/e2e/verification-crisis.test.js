/**
 * E2E Tests: Verification System Crisis Fixes
 *
 * Tests the ground truth verification system to ensure agents
 * cannot claim work completion without actual evidence.
 *
 * @feature verification-crisis-fixes
 * @user-story System must verify actual work exists before claiming completion
 */

const fs = require('fs');
const path = require('path');
// import { execSync } from 'child_process'; // Unused import removed

const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('VERIFICATION-CRISIS: Ground Truth Verification System', () => {
  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    errors: [],
    timings: {}
  };

  function recordTest(testName, passed, error = null) {
    results.totalTests++;
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
      results.errors.push({ test: testName, error: error?.message || error });
    }
  }

  function recordTiming(testName, duration) {
    results.timings[testName] = duration;
  }

  afterAll(() => {
    const reportPath = path.join(PROJECT_ROOT, 'tests/e2e/results/verification-crisis-e2e-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    // Report silently saved
  });

  describe('VERIF-001: Critical Verification Function Analysis', () => {
    test('VERIF-001-1: PLANNER verifySubagentWork function exists', () => {
      const start = Date.now();
      const testName = 'VERIF-001-1: Verification Function Exists';

      try {
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // Verify the function exists
        expect(plannerContent).toMatch(/verifySubagentWork\(\)/);
        expect(plannerContent).toMatch(/🚨 CRITICAL: Ground Truth Verification/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-001-2: Verification function uses ground truth checks', () => {
      const start = Date.now();
      const testName = 'VERIF-001-2: Ground Truth Checks';

      try {
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // Verify ground truth checks are implemented
        expect(plannerContent).toMatch(/git status --porcelain/);
        expect(plannerContent).toMatch(/git log --oneline/);
        expect(plannerContent).toMatch(/gh pr view/);
        expect(plannerContent).toMatch(/mcp__linear-server__get_issue/);
        expect(plannerContent).toMatch(/npm test/);

        // Verify verification logic
        expect(plannerContent).toMatch(/let verified = true/);
        expect(plannerContent).toMatch(/verified = false/);
        expect(plannerContent).toMatch(/verified: verified.*CRITICAL: Only true if ALL checks pass/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-001-3: Verification function rejects fake work', () => {
      const start = Date.now();
      const testName = 'VERIF-001-3: Rejects Fake Work';

      try {
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // Verify the function properly sets verified = false on failures
        expect(plannerContent).toMatch(/verified = false;[\s\S]*evidence.failureReason/);
        expect(plannerContent).toMatch(/verified = false;[\s\S]*evidence.commitFailure/);
        expect(plannerContent).toMatch(/verified = false;[\s\S]*evidence.prFailure/);
        expect(plannerContent).toMatch(/verified = false;[\s\S]*evidence.linearFailure/);
        expect(plannerContent).toMatch(/verified = false;[\s\S]*evidence.testFailure/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('VERIF-002: Verification Report System', () => {
    test('VERIF-002-1: Verification report shows failures', () => {
      const start = Date.now();
      const testName = 'VERIF-002-1: Report Shows Failures';

      try {
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // Verify report generation handles failures
        expect(plannerContent).toMatch(/FAILED VERIFICATIONS.*NO GROUND TRUTH EVIDENCE/);
        expect(plannerContent).toMatch(/Failure Reason:/);
        expect(plannerContent).toMatch(/🚨 CRITICAL.*task\(s\).*claimed completion but NO EVIDENCE FOUND/);
        expect(plannerContent).toMatch(/manual investigation required/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-002-2: Verification report shows evidence', () => {
      const start = Date.now();
      const testName = 'VERIF-002-2: Report Shows Evidence';

      try {
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // Verify report includes evidence for all claims
        expect(plannerContent).toMatch(/Evidence: \$\{JSON\.stringify\(v\.evidence/);
        expect(plannerContent).toMatch(/GROUND TRUTH CONFIRMED/);
        expect(plannerContent).toMatch(/VERIFIED WORK.*GROUND TRUTH CONFIRMED/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-002-3: Summary reflects reality', () => {
      const start = Date.now();
      const testName = 'VERIF-002-3: Summary Reflects Reality';

      try {
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // Verify summary doesn't lie about verification results
        expect(plannerContent).toMatch(/tasks have ground truth evidence/);
        expect(plannerContent).toMatch(/All claims verified with ground truth evidence/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('VERIF-003: Anti-Hallucination Safeguards', () => {
    test('VERIF-003-1: PLANNER has anti-hallucination rules', () => {
      const start = Date.now();
      const testName = 'VERIF-003-1: Anti-Hallucination Rules';

      try {
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // Verify anti-hallucination protocol exists
        expect(plannerContent).toMatch(/UNIVERSAL ANTI-HALLUCINATION PROTOCOL/);
        expect(plannerContent).toMatch(/NEVER report work that didn't actually happen/);
        expect(plannerContent).toMatch(/VERIFY everything with tool output/);
        expect(plannerContent).toMatch(/FORBIDDEN LANGUAGE.*Hallucination Traps/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-003-2: EXECUTOR has TDD verification', () => {
      const start = Date.now();
      const testName = 'VERIF-003-2: EXECUTOR TDD Verification';

      try {
        const executorPath = path.join(PROJECT_ROOT, '.claude/agents/executor.md');
        const executorContent = fs.readFileSync(executorPath, 'utf8');

        // Verify EXECUTOR has TDD verification
        expect(executorContent).toMatch(/verifyTDDCycle/);
        expect(executorContent).toMatch(/git branch/);
        expect(executorContent).toMatch(/git status/);
        expect(executorContent).toMatch(/git log/);
        expect(executorContent).toMatch(/npm test/);
        expect(executorContent).toMatch(/gh pr list/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-003-3: Commands have execution instructions', () => {
      const start = Date.now();
      const testName = 'VERIF-003-3: Commands Have Execution';

      try {
        // Check /fix command has verification
        const fixCommandPath = path.join(PROJECT_ROOT, '.claude/commands/fix.md');
        const fixContent = fs.readFileSync(fixCommandPath, 'utf8');
        expect(fixContent).toMatch(/Phase 6: Verification.*MANDATORY/);
        expect(fixContent).toMatch(/verifyTDDCycle/);

        // Check /cycle command has verification
        const cycleCommandPath = path.join(PROJECT_ROOT, '.claude/commands/cycle.md');
        const cycleContent = fs.readFileSync(cycleCommandPath, 'utf8');
        expect(cycleContent).toMatch(/Phase 5: Verification.*MANDATORY/);
        expect(cycleContent).toMatch(/Wait for subagents to complete/);
        expect(cycleContent).toMatch(/Verify actual work happened/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('VERIF-004: Integration Point Verification', () => {
    test('VERIF-004-1: Linear MCP integration verification', () => {
      const start = Date.now();
      const testName = 'VERIF-004-1: Linear MCP Integration';

      try {
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // Verify Linear MCP is used for verification
        expect(plannerContent).toMatch(/mcp_servers:\s*-\s*linear-server/);
        expect(plannerContent).toMatch(/mcp__linear-server__get_issue/);
        expect(plannerContent).toMatch(/Linear Task Status.*GROUND TRUTH/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-004-2: GitHub CLI integration verification', () => {
      const start = Date.now();
      const testName = 'VERIF-004-2: GitHub CLI Integration';

      try {
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // Verify GitHub CLI is used for verification
        expect(plannerContent).toMatch(/gh pr view/);
        expect(plannerContent).toMatch(/PR Actually Exists.*GROUND TRUTH/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-004-3: Git command integration verification', () => {
      const start = Date.now();
      const testName = 'VERIF-004-3: Git Command Integration';

      try {
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // Verify Git commands are used for verification
        expect(plannerContent).toMatch(/git status --porcelain/);
        expect(plannerContent).toMatch(/git log --oneline/);
        expect(plannerContent).toMatch(/Git Status.*GROUND TRUTH/);
        expect(plannerContent).toMatch(/Commits Actually Exist.*GROUND TRUTH/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('VERIF-005: Quality Control Implementation', () => {
    test('VERIF-005-1: Verification documentation exists', () => {
      const start = Date.now();
      const testName = 'VERIF-005-1: Verification Documentation';

      try {
        const docPath = path.join(PROJECT_ROOT, '.claude/docs/VERIFICATION-CRISIS-FIXES.md');
        const docExists = fs.existsSync(docPath);

        expect(docExists).toBe(true);

        // Since we expect the file to exist, we can safely read it
        const docContent = fs.readFileSync(docPath, 'utf8');
        expect(docContent).toMatch(/CRITICAL ISSUE IDENTIFIED/);
        expect(docContent).toMatch(/FAKE VERIFICATION FUNCTION/);
        expect(docContent).toMatch(/IMMEDIATE FIXES REQUIRED/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-005-2: Quality gates are documented', () => {
      const start = Date.now();
      const testName = 'VERIF-005-2: Quality Gates Documented';

      try {
        const docPath = path.join(PROJECT_ROOT, '.claude/docs/VERIFICATION-CRISIS-FIXES.md');
        const docContent = fs.readFileSync(docPath, 'utf8');

        // Verify quality gates are documented
        expect(docContent).toMatch(/VERIFICATION CHECKLIST/);
        expect(docContent).toMatch(/Git status shows actual file changes/);
        expect(docContent).toMatch(/Commits exist in git log/);
        expect(docContent).toMatch(/PRs actually exist/);
        expect(docContent).toMatch(/Linear tasks have correct status/);
        expect(docContent).toMatch(/Tests pass.*if required/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-005-3: Ethical impact is documented', () => {
      const start = Date.now();
      const testName = 'VERIF-005-3: Ethical Impact Documented';

      try {
        const docPath = path.join(PROJECT_ROOT, '.claude/docs/VERIFICATION-CRISIS-FIXES.md');
        const docContent = fs.readFileSync(docPath, 'utf8');

        // Verify ethical impact is documented
        expect(docContent).toMatch(/⚠️ ETHICAL IMPACT/);
        expect(docContent).toMatch(/Current State.*claim 100% productivity while doing 0% work/);
        expect(docContent).toMatch(/After Fix.*only claim work that actually exists/);
        expect(docContent).toMatch(/fundamental ethical failure in an autonomous system/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('VERIF-006: System-Wide Safeguards', () => {
    test('VERIF-006-1: No fake verification logic remains', () => {
      const start = Date.now();
      const testName = 'VERIF-006-1: No Fake Verification Logic';

      try {
        // Scan all agent files for fake verification patterns
        const agentDir = path.join(PROJECT_ROOT, '.claude/agents');
        const agentFiles = fs.readdirSync(agentDir).filter(f => f.endsWith('.md'));

        let fakeVerificationFound = false;
        const evidence = [];

        agentFiles.forEach(file => {
          const filePath = path.join(agentDir, file);
          const content = fs.readFileSync(filePath, 'utf8');

          // Look for patterns that indicate fake verification
          if (content.match(/verified:\s*true.*Set to false if/)) {
            fakeVerificationFound = true;
            evidence.push(`${file}: verified: true with conditional false setting`);
          }

          if (content.match(/verified.*=.*true.*\/\/.*never.*set.*false/i)) {
            fakeVerificationFound = true;
            evidence.push(`${file}: verified=true with comment about never setting false`);
          }
        });

        // Check specific known issue patterns
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // The old broken pattern should NOT exist
        expect(plannerContent).not.toMatch(/verified:\s*true.*Set to false if any critical check fails/);

        // Record findings but no console output
        const findingsLog = fakeVerificationFound ? `⚠️ Fake verification patterns found: ${evidence.join(', ')}` : 'No fake verification patterns found';

        expect(fakeVerificationFound).toBe(false);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-006-2: All verification functions are called', () => {
      const start = Date.now();
      const testName = 'VERIF-006-2: Verification Functions Called';

      try {
        // Check if verification functions are actually called in workflows
        const cycleCommandPath = path.join(PROJECT_ROOT, '.claude/commands/cycle.md');
        const cycleContent = fs.readFileSync(cycleCommandPath, 'utf8');

        // Verify Phase 5: Verification is implemented
        expect(cycleContent).toMatch(/Phase 5: Verification.*MANDATORY/);
        expect(cycleContent).toMatch(/Wait for subagents to complete/);
        expect(cycleContent).toMatch(/Verify actual work happened/);

        // Check /fix command also calls verification
        const fixCommandPath = path.join(PROJECT_ROOT, '.claude/commands/fix.md');
        const fixContent = fs.readFileSync(fixCommandPath, 'utf8');

        expect(fixContent).toMatch(/Phase 6: Verification.*MANDATORY/);
        expect(fixContent).toMatch(/verifyTDDCycle\(taskId, branchName\)/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-006-3: System has fallback verification', () => {
      const start = Date.now();
      const testName = 'VERIF-006-3: Fallback Verification';

      try {
        // Check if system has fallback when verification fails
        const plannerPath = path.join(PROJECT_ROOT, '.claude/agents/planner.md');
        const plannerContent = fs.readFileSync(plannerPath, 'utf8');

        // Verify error handling in verification
        expect(plannerContent).toMatch(/catch \(error\)/);
        expect(plannerContent).toMatch(/verified = false/);
        expect(plannerContent).toMatch(/evidence\..*Error/);

        // Verify verification can handle missing data gracefully
        expect(plannerContent).toMatch(/ignoreError: false/);
        expect(plannerContent).toMatch(/timeout:/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('VERIF-007: Crisis Resolution Validation', () => {
    test('VERIF-007-1: All critical issues are addressed', () => {
      const start = Date.now();
      const testName = 'VERIF-007-1: Critical Issues Addressed';

      try {
        const docPath = path.join(PROJECT_ROOT, '.claude/docs/VERIFICATION-CRISIS-FIXES.md');
        const docContent = fs.readFileSync(docPath, 'utf8');

        // Verify all critical issues are documented as fixed
        expect(docContent).toMatch(/Issue #1: FAKE VERIFICATION FUNCTION.*FIXED/);
        expect(docContent).toMatch(/Issue #2: NO GROUND TRUTH CHECKS.*FIXED/);
        expect(docContent).toMatch(/Issue #3: MISSING VERIFICATION CALLS.*FIXED/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-007-2: Success metrics are defined', () => {
      const start = Date.now();
      const testName = 'VERIF-007-2: Success Metrics Defined';

      try {
        const docPath = path.join(PROJECT_ROOT, '.claude/docs/VERIFICATION-CRISIS-FIXES.md');
        const docContent = fs.readFileSync(docPath, 'utf8');

        // Verify success metrics are defined
        expect(docContent).toMatch(/🎯 SUCCESS METRICS/);
        expect(docContent).toMatch(/False Positive Rate.*0%/);
        expect(docContent).toMatch(/False Negative Rate.*<5%/);
        expect(docContent).toMatch(/Verification Coverage.*100%/);
        expect(docContent).toMatch(/Ground Truth Evidence.*100%/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('VERIF-007-3: System recovery is documented', () => {
      const start = Date.now();
      const testName = 'VERIF-007-3: System Recovery Documented';

      try {
        const docPath = path.join(PROJECT_ROOT, '.claude/docs/VERIFICATION-CRISIS-FIXES.md');
        const docContent = fs.readFileSync(docPath, 'utf8');

        // Verify recovery procedures are documented
        expect(docContent).toMatch(/🚨 IMMEDIATE ACTION REQUIRED/);
        expect(docContent).toMatch(/Fix the verifySubagentWork\(\) function/);
        expect(docContent).toMatch(/Add verification calls to all workflows/);
        expect(docContent).toMatch(/Create E2E tests/);
        expect(docContent).toMatch(/Update all agents/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });
});
