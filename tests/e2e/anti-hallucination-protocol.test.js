/**
 * E2E Tests: Anti-Hallucination Protocol V2
 *
 * Tests that agents follow strict execution protocols and do not
 * report simulated work without actual tool execution evidence.
 *
 * @feature anti-hallucination-v2
 * @user-story System must prevent agents from reporting simulated work
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('ANTI-HALLUCINATION-V2: Agent Execution Protocol Validation', () => {
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
    const reportPath = path.join(PROJECT_ROOT, 'tests/e2e/results/anti-hallucination-protocol-e2e-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    // Report silently saved
  });

  describe('AH-001: Critical Agent Protocol Compliance', () => {
    test('AH-001-1: EXECUTOR agent has prominent anti-hallucination protocol', () => {
      const start = Date.now();
      const testName = 'AH-001-1: EXECUTOR Agent Protocol';

      try {
        const agentPath = path.join(PROJECT_ROOT, '.claude/agents/executor.md');
        const agentContent = fs.readFileSync(agentPath, 'utf8');

        // Verify protocol is at the top (immediately after frontmatter)
        const frontmatterEnd = agentContent.indexOf('---', agentContent.indexOf('---') + 3) + 3;
        const firstSection = agentContent.substring(frontmatterEnd, frontmatterEnd + 800);

        expect(firstSection).toMatch(/🚨 CRITICAL: EXECUTE IMMEDIATELY/);
        expect(firstSection).toMatch(/YOU ARE AN EXECUTION AGENT, NOT A PLANNING AGENT/);
        expect(firstSection).toMatch(/ABSOLUTE PROHIBITIONS:/);
        expect(firstSection).toMatch(/MANDATORY ACTIONS:/);
        expect(firstSection).toMatch(/\*{2}CRITICAL RULE\*{2}:/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('AH-001-2: PYTHON-PRO agent has prominent anti-hallucination protocol', () => {
      const start = Date.now();
      const testName = 'AH-001-2: PYTHON-PRO Agent Protocol';

      try {
        const agentPath = path.join(PROJECT_ROOT, '.claude/agents/python-pro.md');
        const agentContent = fs.readFileSync(agentPath, 'utf8');

        // Verify protocol is at the top (immediately after frontmatter)
        const frontmatterEnd = agentContent.indexOf('---', agentContent.indexOf('---') + 3) + 3;
        const firstSection = agentContent.substring(frontmatterEnd, frontmatterEnd + 800);

        expect(firstSection).toMatch(/🚨 CRITICAL: EXECUTE IMMEDIATELY/);
        expect(firstSection).toMatch(/YOU ARE AN EXECUTION AGENT, NOT A PLANNING AGENT/);
        expect(firstSection).toMatch(/ABSOLUTE PROHIBITIONS:/);
        expect(firstSection).toMatch(/MANDATORY ACTIONS:/);
        expect(firstSection).toMatch(/\*{2}CRITICAL RULE\*{2}:/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('AH-001-3: DJANGO-PRO agent has prominent anti-hallucination protocol', () => {
      const start = Date.now();
      const testName = 'AH-001-3: DJANGO-PRO Agent Protocol';

      try {
        const agentPath = path.join(PROJECT_ROOT, '.claude/agents/django-pro.md');
        const agentContent = fs.readFileSync(agentPath, 'utf8');

        // Verify protocol is at the top (immediately after frontmatter)
        const frontmatterEnd = agentContent.indexOf('---', agentContent.indexOf('---') + 3) + 3;
        const firstSection = agentContent.substring(frontmatterEnd, frontmatterEnd + 800);

        expect(firstSection).toMatch(/🚨 CRITICAL: EXECUTE IMMEDIATELY/);
        expect(firstSection).toMatch(/YOU ARE AN EXECUTION AGENT, NOT A PLANNING AGENT/);
        expect(firstSection).toMatch(/ABSOLUTE PROHIBITIONS:/);
        expect(firstSection).toMatch(/MANDATORY ACTIONS:/);
        expect(firstSection).toMatch(/\*{2}CRITICAL RULE\*{2}:/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('AH-001-4: LINTER agent has prominent anti-hallucination protocol', () => {
      const start = Date.now();
      const testName = 'AH-001-4: LINTER Agent Protocol';

      try {
        const agentPath = path.join(PROJECT_ROOT, '.claude/agents/linter.md');
        const agentContent = fs.readFileSync(agentPath, 'utf8');

        // Verify protocol is at the top (immediately after frontmatter)
        const frontmatterEnd = agentContent.indexOf('---', agentContent.indexOf('---') + 3) + 3;
        const firstSection = agentContent.substring(frontmatterEnd, frontmatterEnd + 800);

        expect(firstSection).toMatch(/🚨 CRITICAL: EXECUTE IMMEDIATELY/);
        expect(firstSection).toMatch(/YOU ARE AN EXECUTION AGENT, NOT A PLANNING AGENT/);
        expect(firstSection).toMatch(/ABSOLUTE PROHIBITIONS:/);
        expect(firstSection).toMatch(/MANDATORY ACTIONS:/);
        expect(firstSection).toMatch(/\*{2}CRITICAL RULE\*{2}:/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('AH-001-5: CODE-REVIEWER agent has prominent anti-hallucination protocol', () => {
      const start = Date.now();
      const testName = 'AH-001-5: CODE-REVIEWER Agent Protocol';

      try {
        const agentPath = path.join(PROJECT_ROOT, '.claude/agents/code-reviewer.md');
        const agentContent = fs.readFileSync(agentPath, 'utf8');

        // Verify protocol is at the top (immediately after frontmatter)
        const frontmatterEnd = agentContent.indexOf('---', agentContent.indexOf('---') + 3) + 3;
        const firstSection = agentContent.substring(frontmatterEnd, frontmatterEnd + 800);

        expect(firstSection).toMatch(/🚨 CRITICAL: EXECUTE IMMEDIATELY/);
        expect(firstSection).toMatch(/YOU ARE AN EXECUTION AGENT, NOT A PLANNING AGENT/);
        expect(firstSection).toMatch(/ABSOLUTE PROHIBITIONS:/);
        expect(firstSection).toMatch(/MANDATORY ACTIONS:/);
        expect(firstSection).toMatch(/\*{2}CRITICAL RULE\*{2}:/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('AH-002: Forbidden Language Patterns', () => {
    test('AH-002-1: Agents forbid simulation language', () => {
      const start = Date.now();
      const testName = 'AH-002-1: Forbidden Simulation Language';

      try {
        const agentDir = path.join(PROJECT_ROOT, '.claude/agents');
        const agentFiles = fs.readdirSync(agentDir).filter(f => f.endsWith('.md'));

        const agentsWithProtocols = ['executor.md', 'python-pro.md', 'django-pro.md', 'linter.md', 'code-reviewer.md'];

        const violationsFound = [];

        agentsWithProtocols.forEach(file => {
          const filePath = path.join(agentDir, file);
          const content = fs.readFileSync(filePath, 'utf8');

          // Look for forbidden patterns in the entire file
          // Exclude examples of what NOT to do (these appear in lists with ❌)
          const contentWithoutForbiddenExamples = content.replace(/- ❌.*"theoretical implementation".*/g, '');

          const forbiddenPatterns = [
            /I would implement/gi,
            /I could create/gi,
            /I might suggest/gi,
            /The approach would be/gi,
            /In theory[^:]/gi,  // Allow "In theory:" as header but not "In theory," as explanation
            /Let me analyze first/gi,
            /Processing to get/gi,
            /Simulated execution/gi
          ];

          forbiddenPatterns.forEach(pattern => {
            if (pattern.test(contentWithoutForbiddenExamples)) {
              violationsFound.push(`${file}: Found forbidden pattern "${pattern.source}"`);
            }
          });
        });

        expect(violationsFound).toEqual([]);
        expect(violationsFound.length).toBe(0);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('AH-002-2: Agents require Linear task verification', () => {
      const start = Date.now();
      const testName = 'AH-002-2: Linear Task Verification Required';

      try {
        const agentDir = path.join(PROJECT_ROOT, '.claude/agents');
        const agentsWithProtocols = ['executor.md', 'python-pro.md', 'django-pro.md', 'linter.md', 'code-reviewer.md'];

        const violationsFound = [];

        agentsWithProtocols.forEach(file => {
          const filePath = path.join(agentDir, file);
          const content = fs.readFileSync(filePath, 'utf8');

          // Check for Linear task verification requirement
          if (!content.includes('Before ANY work, you MUST verify the Linear task exists')) {
            violationsFound.push(`${file}: Missing Linear task verification requirement`);
          }

          if (!content.includes('If task doesn\'t exist, STOP IMMEDIATELY')) {
            violationsFound.push(`${file}: Missing immediate stop requirement`);
          }
        });

        expect(violationsFound).toEqual([]);
        expect(violationsFound.length).toBe(0);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('AH-003: Verification Requirements', () => {
    test('AH-003-1: EXECUTOR has verifyTDDCycle function', () => {
      const start = Date.now();
      const testName = 'AH-003-1: EXECUTOR verifyTDDCycle Function';

      try {
        const agentPath = path.join(PROJECT_ROOT, '.claude/agents/executor.md');
        const agentContent = fs.readFileSync(agentPath, 'utf8');

        expect(agentContent).toMatch(/verifyTDDCycle/);
        expect(agentContent).toMatch(/async function verifyTDDCycle/);
        expect(agentContent).toMatch(/Ground Truth Verification/);
        expect(agentContent).toMatch(/git branch --list/);
        expect(agentContent).toMatch(/git status --porcelain/);
        expect(agentContent).toMatch(/npm test/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('AH-003-2: Python-specific agents require pytest verification', () => {
      const start = Date.now();
      const testName = 'AH-003-2: Python Pytest Verification';

      try {
        const pythonProPath = path.join(PROJECT_ROOT, '.claude/agents/python-pro.md');
        const pythonProContent = fs.readFileSync(pythonProPath, 'utf8');
        const djangoProPath = path.join(PROJECT_ROOT, '.claude/agents/django-pro.md');
        const djangoProContent = fs.readFileSync(djangoProPath, 'utf8');

        // Check PYTHON-PRO requires pytest
        expect(pythonProContent).toMatch(/ACTUALLY run pytest/);

        // Check DJANGO-PRO requires pytest-django
        expect(djangoProContent).toMatch(/ACTUALLY run pytest-django/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now - start);
      }
    });

    test('AH-003-3: LINTER requires actual tool execution', () => {
      const start = Date.now();
      const testName = 'AH-003-3: LINTER Tool Execution';

      try {
        const linterPath = path.join(PROJECT_ROOT, '.claude/agents/linter.md');
        const linterContent = fs.readFileSync(linterPath, 'utf8');

        expect(linterContent).toMatch(/ACTUALLY run linting tools/);
        expect(linterContent).toMatch(/ACTUALLY run formatting tools/);
        expect(linterContent).toMatch(/ACTUALLY verify fixes/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now - start);
      }
    });

    test('AH-003-4: CODE-REVIEWER requires tool-based analysis', () => {
      const start = Date.now();
      const testName = 'AH-003-4: CODE-REVIEWER Tool Analysis';

      try {
        const codeReviewerPath = path.join(PROJECT_ROOT, '.claude/agents/code-reviewer.md');
        const codeReviewerContent = fs.readFileSync(codeReviewerPath, 'utf8');

        expect(codeReviewerContent).toMatch(/ACTUALLY run security tools/);
        expect(codeReviewerContent).toMatch(/ACTUALLY analyze real code/);
        expect(codeReviewerContent).toMatch(/ACTUALLY run static analysis tools/);
        expect(codeReviewerContent).toMatch(/ACTUALLY verify findings/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now - start);
      }
    });
  });

  describe('AH-004: Protocol Documentation', () => {
    test('AH-004-1: Anti-hallucination protocol document exists', () => {
      const start = Date.now();
      const testName = 'AH-004-1: Protocol Document Exists';

      try {
        const protocolPath = path.join(PROJECT_ROOT, '.claude/protocols/ANTI-HALLUCINATION-V2.md');
        const protocolExists = fs.existsSync(protocolPath);

        expect(protocolExists).toBe(true);

        if (protocolExists) {
          const protocolContent = fs.readFileSync(protocolPath, 'utf8');
          expect(protocolContent).toMatch(/🚨 ANTI-HALLUCINATION PROTOCOL V2/);
          expect(protocolContent).toMatch(/FUNDAMENTAL PRINCIPLE/);
          expect(protocolContent).toMatch(/MANDATORY EXECUTION REQUIREMENTS/);
          expect(protocolContent).toMatch(/FORBIDDEN LANGUAGE PATTERNS/);
          expect(protocolContent).toMatch(/ENFORCEMENT MECHANISMS/);
        }

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('AH-004-2: Protocol document contains verification templates', () => {
      const start = Date.now();
      const testName = 'AH-004-2: Verification Templates';

      try {
        const protocolPath = path.join(PROJECT_ROOT, '.claude/protocols/ANTI-HALLUCINATION-V2.md');
        const protocolContent = fs.readFileSync(protocolPath, 'utf8');

        expect(protocolContent).toMatch(/File Creation Template/);
        expect(protocolContent).toMatch(/Test Execution Template/);
        expect(protocolContent).toMatch(/Git Operations Template/);
        expect(protocolContent).toMatch(/ls -la/);
        expect(protocolContent).toMatch(/npm test/);
        expect(protocolContent).toMatch(/git log --oneline/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('AH-005: Compliance Monitoring', () => {
    test('AH-005-1: Success metrics are defined', () => {
      const start = Date.now();
      const testName = 'AH-005-1: Success Metrics Defined';

      try {
        const protocolPath = path.join(PROJECT_ROOT, '.claude/protocols/ANTI-HALLUCINATION-V2.md');
        const protocolContent = fs.readFileSync(protocolPath, 'utf8');

        expect(protocolContent).toMatch(/Success Metrics/);
        expect(protocolContent).toMatch(/100%.*of claims backed by tool output/);
        expect(protocolContent).toMatch(/0%.*use of forbidden language patterns/);
        expect(protocolContent).toMatch(/<5%.*verification failure rate/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('AH-005-2: Implementation checklist exists', () => {
      const start = Date.now();
      const testName = 'AH-005-2: Implementation Checklist';

      try {
        const protocolPath = path.join(PROJECT_ROOT, '.claude/protocols/ANTI-HALLUCINATION-V2.md');
        const protocolContent = fs.readFileSync(protocolPath, 'utf8');

        expect(protocolContent).toMatch(/IMPLEMENTATION CHECKLIST/);
        expect(protocolContent).toMatch(/Anti-hallucination protocol at TOP/);
        expect(protocolContent).toMatch(/Verification function implemented/);
        expect(protocolContent).toMatch(/E2E tests pass/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('AH-006: Integration Validation', () => {
    test('AH-006-1: All execution agents have tools for verification', () => {
      const start = Date.now();
      const testName = 'AH-006-1: Agent Tools for Verification';

      try {
        const agentDir = path.join(PROJECT_ROOT, '.claude/agents');
        const criticalAgents = ['executor.md', 'python-pro.md', 'django-pro.md', 'linter.md', 'code-reviewer.md'];

        const violationsFound = [];

        criticalAgents.forEach(file => {
          const filePath = path.join(agentDir, file);
          const content = fs.readFileSync(filePath, 'utf8');

          // Check if frontmatter includes Write and Bash tools
          const frontmatterMatch = content.match(/---[\s\S]*?---/);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[0];

            if (!frontmatter.includes('- Write')) {
              violationsFound.push(`${file}: Missing Write tool in frontmatter`);
            }

            if (!frontmatter.includes('- Bash')) {
              violationsFound.push(`${file}: Missing Bash tool in frontmatter`);
            }

            if (file === 'code-reviewer.md' && !frontmatter.includes('- Read')) {
              violationsFound.push(`${file}: Missing Read tool in frontmatter`);
            }
          }
        });

        expect(violationsFound).toEqual([]);
        expect(violationsFound.length).toBe(0);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now - start);
      }
    });

    test('AH-006-2: Agents have proper MCP server configuration', () => {
      const start = Date.now();
      const testName = 'AH-006-2: MCP Server Configuration';

      try {
        const agentDir = path.join(PROJECT_ROOT, '.claude/agents');
        const agentsWithMCP = ['executor.md', 'python-pro.md', 'django-pro.md', 'code-reviewer.md'];

        const violationsFound = [];

        agentsWithMCP.forEach(file => {
          const filePath = path.join(agentDir, file);
          const content = fs.readFileSync(filePath, 'utf8');

          const frontmatterMatch = content.match(/---[\s\S]*?---/);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[0];

            // Most agents should have context7
            if (!frontmatter.includes('context7')) {
              violationsFound.push(`${file}: Missing context7 MCP server`);
            }
          }
        });

        // LINTER is an exception - it has no MCP servers
        const linterPath = path.join(agentDir, 'linter.md');
        const linterContent = fs.readFileSync(linterPath, 'utf8');
        const linterFrontmatter = linterContent.match(/---[\s\S]*?---/)[0];
        if (linterFrontmatter.includes('mcp_servers:')) {
          violationsFound.push('linter.md: Should not have MCP servers configured');
        }

        expect(violationsFound).toEqual([]);
        expect(violationsFound.length).toBe(0);

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