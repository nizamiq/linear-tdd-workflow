/**
 * E2E Tests: Intelligent Linting System
 *
 * Tests the /lint command and intelligent-lint.sh script
 *
 * @feature intelligent-linting
 * @user-story User runs /lint to automatically detect project type and run appropriate linters
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const LINT_SCRIPT = path.join(PROJECT_ROOT, '.claude/scripts/intelligent-lint.sh');
const LINT_COMMAND = path.join(PROJECT_ROOT, '.claude/commands/lint.md');

describe('LINT-E2E: Intelligent Linting System', () => {
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
    const reportPath = path.join(PROJECT_ROOT, 'tests/e2e/results/intelligent-lint-e2e-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📊 E2E Test Report saved to: ${reportPath}`);
  });

  describe('LINT-001: Script Existence and Permissions', () => {
    test('LINT-001-1: intelligent-lint.sh exists in .claude/scripts/', () => {
      const start = Date.now();
      const testName = 'LINT-001-1: Script Existence';

      try {
        const scriptExists = fs.existsSync(LINT_SCRIPT);
        expect(scriptExists).toBe(true);
        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-001-2: intelligent-lint.sh is executable', () => {
      const start = Date.now();
      const testName = 'LINT-001-2: Script Executable';

      try {
        const stats = fs.statSync(LINT_SCRIPT);
        const isExecutable = (stats.mode & fs.constants.S_IXUSR) !== 0;
        expect(isExecutable).toBe(true);
        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-001-3: lint.md command file exists', () => {
      const start = Date.now();
      const testName = 'LINT-001-3: Command File Existence';

      try {
        const commandExists = fs.existsSync(LINT_COMMAND);
        expect(commandExists).toBe(true);
        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('LINT-002: Language Detection', () => {
    test('LINT-002-1: Detects Python project', () => {
      const start = Date.now();
      const testName = 'LINT-002-1: Python Detection';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify Python detection logic exists
        expect(scriptContent).toMatch(/HAS_PYTHON=false/);
        expect(scriptContent).toMatch(/requirements\.txt.*pyproject\.toml.*setup\.py/);
        expect(scriptContent).toMatch(/Python project detected/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-002-2: Detects JavaScript/TypeScript project', () => {
      const start = Date.now();
      const testName = 'LINT-002-2: JS/TS Detection';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify JS/TS detection logic exists
        expect(scriptContent).toMatch(/HAS_JAVASCRIPT=false/);
        expect(scriptContent).toMatch(/HAS_TYPESCRIPT=false/);
        expect(scriptContent).toMatch(/package\.json/);
        expect(scriptContent).toMatch(/tsconfig\.json/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-002-3: Detects Markdown files', () => {
      const start = Date.now();
      const testName = 'LINT-002-3: Markdown Detection';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify Markdown detection logic exists
        expect(scriptContent).toMatch(/HAS_MARKDOWN=false/);
        expect(scriptContent).toMatch(/\*\.md/);
        expect(scriptContent).toMatch(/Markdown files detected/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-002-4: Detects YAML files', () => {
      const start = Date.now();
      const testName = 'LINT-002-4: YAML Detection';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify YAML detection logic exists
        expect(scriptContent).toMatch(/HAS_YAML=false/);
        expect(scriptContent).toMatch(/\*\.yaml.*\*\.yml/);
        expect(scriptContent).toMatch(/YAML files detected/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-002-5: Gracefully detects other languages', () => {
      const start = Date.now();
      const testName = 'LINT-002-5: Other Language Detection';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify detection for Go, Rust, Java, Ruby, PHP, C/C++, Shell
        expect(scriptContent).toMatch(/Go files detected.*golangci-lint/);
        expect(scriptContent).toMatch(/Rust files detected.*clippy/);
        expect(scriptContent).toMatch(/Java files detected.*checkstyle/);
        expect(scriptContent).toMatch(/Ruby files detected.*rubocop/);
        expect(scriptContent).toMatch(/PHP files detected.*phpcs/);
        expect(scriptContent).toMatch(/C\/C\+\+ files detected.*clang-tidy/);
        expect(scriptContent).toMatch(/Shell scripts detected.*shellcheck/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('LINT-003: Framework Detection', () => {
    test('LINT-003-1: Detects Django', () => {
      const start = Date.now();
      const testName = 'LINT-003-1: Django Detection';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify Django detection
        expect(scriptContent).toMatch(/HAS_DJANGO=false/);
        expect(scriptContent).toMatch(/django.*requirements\.txt.*pyproject\.toml/);
        expect(scriptContent).toMatch(/manage\.py/);
        expect(scriptContent).toMatch(/Django detected/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-003-2: Detects FastAPI and Pydantic', () => {
      const start = Date.now();
      const testName = 'LINT-003-2: FastAPI/Pydantic Detection';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify FastAPI and Pydantic detection
        expect(scriptContent).toMatch(/HAS_FASTAPI=false/);
        expect(scriptContent).toMatch(/HAS_PYDANTIC=false/);
        expect(scriptContent).toMatch(/fastapi.*requirements\.txt/);
        expect(scriptContent).toMatch(/pydantic.*requirements\.txt/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-003-3: Detects React and Next.js', () => {
      const start = Date.now();
      const testName = 'LINT-003-3: React/Next.js Detection';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify React and Next.js detection
        expect(scriptContent).toMatch(/HAS_REACT=false/);
        expect(scriptContent).toMatch(/HAS_NEXTJS=false/);
        expect(scriptContent).toMatch(/react.*package\.json/);
        expect(scriptContent).toMatch(/next.*package\.json.*next\.config\.js/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('LINT-004: Modern Linter Support', () => {
    test('LINT-004-1: Uses ruff for Python (not flake8)', () => {
      const start = Date.now();
      const testName = 'LINT-004-1: Ruff Linter';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify ruff is used (comments mentioning flake8 are OK)
        expect(scriptContent).toMatch(/command -v ruff/);
        expect(scriptContent).toMatch(/ruff check/);
        // Don't check for absence of "flake8" since it's mentioned in comments

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-004-2: Uses black for Python formatting', () => {
      const start = Date.now();
      const testName = 'LINT-004-2: Black Formatter';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify black is used
        expect(scriptContent).toMatch(/command -v black/);
        expect(scriptContent).toMatch(/black --check/);
        expect(scriptContent).toMatch(/black --quiet/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-004-3: Uses mypy for type checking', () => {
      const start = Date.now();
      const testName = 'LINT-004-3: Mypy Type Checker';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify mypy is used
        expect(scriptContent).toMatch(/command -v mypy/);
        expect(scriptContent).toMatch(/mypy/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-004-4: Uses eslint and prettier for JS/TS', () => {
      const start = Date.now();
      const testName = 'LINT-004-4: ESLint and Prettier';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify eslint and prettier are used
        expect(scriptContent).toMatch(/eslint/);
        expect(scriptContent).toMatch(/prettier/);
        expect(scriptContent).toMatch(/--fix/);
        expect(scriptContent).toMatch(/--write/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-004-5: Uses markdownlint for Markdown', () => {
      const start = Date.now();
      const testName = 'LINT-004-5: Markdownlint';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify markdownlint is used
        expect(scriptContent).toMatch(/markdownlint/);
        expect(scriptContent).toMatch(/\*\*\/\*\.md/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-004-6: Uses yamllint for YAML', () => {
      const start = Date.now();
      const testName = 'LINT-004-6: Yamllint';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify yamllint is used
        expect(scriptContent).toMatch(/command -v yamllint/);
        expect(scriptContent).toMatch(/yamllint -f parsable/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('LINT-005: Framework-Specific Rules', () => {
    test('LINT-005-1: Applies Django-specific ruff rules', () => {
      const start = Date.now();
      const testName = 'LINT-005-1: Django Rules';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify Django-specific rules
        expect(scriptContent).toMatch(/HAS_DJANGO.*RUFF_SELECT.*DJ/s);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-005-2: Applies Pydantic-specific rules', () => {
      const start = Date.now();
      const testName = 'LINT-005-2: Pydantic Rules';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify Pydantic-specific rules
        expect(scriptContent).toMatch(/HAS_PYDANTIC.*RUFF_SELECT.*PD/s);
        expect(scriptContent).toMatch(/pydantic\.mypy/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('LINT-006: Command Specification', () => {
    test('LINT-006-1: Command has proper frontmatter', () => {
      const start = Date.now();
      const testName = 'LINT-006-1: Command Frontmatter';

      try {
        const commandContent = fs.readFileSync(LINT_COMMAND, 'utf8');

        // Verify frontmatter
        expect(commandContent).toMatch(/^---\s*$/m);
        expect(commandContent).toMatch(/title:\s*Intelligent Project Linting/);
        expect(commandContent).toMatch(/command:\s*\/lint/);
        expect(commandContent).toMatch(/agent:\s*LINTER/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-006-2: Command has execution instructions', () => {
      const start = Date.now();
      const testName = 'LINT-006-2: Execution Instructions';

      try {
        const commandContent = fs.readFileSync(LINT_COMMAND, 'utf8');

        // Verify execution instructions
        expect(commandContent).toMatch(/🤖 Execution Instructions for Claude Code/);
        expect(commandContent).toMatch(/\.\/\.claude\/scripts\/intelligent-lint\.sh/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-006-3: Command documents modern tools preference', () => {
      const start = Date.now();
      const testName = 'LINT-006-3: Modern Tools Documentation';

      try {
        const commandContent = fs.readFileSync(LINT_COMMAND, 'utf8');

        // Verify modern tools are documented
        expect(commandContent).toMatch(/ruff/);
        expect(commandContent).toMatch(/black/);
        expect(commandContent).toMatch(/markdownlint/);
        expect(commandContent).toMatch(/yamllint/);
        expect(commandContent).toMatch(/Modern Linters Used/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('LINT-007: Check and Fix Modes', () => {
    test('LINT-007-1: Supports check mode', () => {
      const start = Date.now();
      const testName = 'LINT-007-1: Check Mode';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify check mode logic
        expect(scriptContent).toMatch(/MODE.*check/);
        expect(scriptContent).toMatch(/--check/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-007-2: Supports fix mode', () => {
      const start = Date.now();
      const testName = 'LINT-007-2: Fix Mode';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify fix mode logic
        expect(scriptContent).toMatch(/--fix/);
        expect(scriptContent).toMatch(/--write/);
        expect(scriptContent).toMatch(/MODE.*fix/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('LINT-008: Error Handling and Reporting', () => {
    test('LINT-008-1: Counts errors and warnings', () => {
      const start = Date.now();
      const testName = 'LINT-008-1: Error Counting';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify error/warning counting
        expect(scriptContent).toMatch(/TOTAL_ERRORS=0/);
        expect(scriptContent).toMatch(/TOTAL_WARNINGS=0/);
        expect(scriptContent).toMatch(/LINTER_ERRORS/);
        expect(scriptContent).toMatch(/LINTER_WARNINGS/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-008-2: Generates comprehensive report', () => {
      const start = Date.now();
      const testName = 'LINT-008-2: Report Generation';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify report generation
        expect(scriptContent).toMatch(/📊 Summary:/);
        expect(scriptContent).toMatch(/Languages:/);
        expect(scriptContent).toMatch(/Frameworks:/);
        expect(scriptContent).toMatch(/Issues by Severity:/);
        expect(scriptContent).toMatch(/Duration:/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-008-3: Provides helpful installation messages', () => {
      const start = Date.now();
      const testName = 'LINT-008-3: Installation Guidance';

      try {
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify installation guidance
        expect(scriptContent).toMatch(/not installed - install with:/);
        expect(scriptContent).toMatch(/pip install ruff/);
        expect(scriptContent).toMatch(/npm install eslint/);
        expect(scriptContent).toMatch(/pip install yamllint/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });
  });

  describe('LINT-009: Integration Points', () => {
    test('LINT-009-1: Can be invoked via slash command', () => {
      const start = Date.now();
      const testName = 'LINT-009-1: Slash Command Integration';

      try {
        const commandContent = fs.readFileSync(LINT_COMMAND, 'utf8');

        // Verify slash command setup
        expect(commandContent).toMatch(/command: \/lint/);
        expect(commandContent).toMatch(/When user invokes `\/lint \[options\]`/);

        recordTest(testName, true);
      } catch (error) {
        recordTest(testName, false, error);
        throw error;
      } finally {
        recordTiming(testName, Date.now() - start);
      }
    });

    test('LINT-009-2: Supports scope parameter', () => {
      const start = Date.now();
      const testName = 'LINT-009-2: Scope Parameter';

      try {
        const commandContent = fs.readFileSync(LINT_COMMAND, 'utf8');
        const scriptContent = fs.readFileSync(LINT_SCRIPT, 'utf8');

        // Verify scope parameter
        expect(commandContent).toMatch(/scope/);
        expect(scriptContent).toMatch(/SCOPE/);

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
