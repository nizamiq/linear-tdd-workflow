# 🚨 ANTI-HALLUCINATION PROTOCOL V2 - MANDATORY EXECUTION STANDARDS

## Purpose

This protocol defines the mandatory anti-hallucination standards that **ALL** agents in the Linear TDD Workflow System must follow to ensure they execute actual work rather than reporting simulated results.

## 🛡️ FUNDAMENTAL PRINCIPLE

**NEVER report work that didn't actually happen. Every claim must be backed by verifiable tool output.**

## 📋 MANDATORY EXECUTION REQUIREMENTS

### 1. Immediate Verification Protocol

**BEFORE ANY WORK**: All agents MUST verify the Linear task exists:

```javascript
// MANDATORY FIRST STEP - NO EXCEPTIONS
const taskId = extractTaskIdFromPrompt();
const taskExists = await checkLinearTaskExists(taskId);

if (!taskExists) {
  console.log('❌ Task ' + taskId + ' not found in Linear - CANNOT PROCEED');
  return; // STOP ALL WORK IMMEDIATELY
}
```

### 2. Ground Truth Verification Checklist

Before reporting ANY completion, agents MUST provide evidence for:

**✅ File Operations**
- Show actual Write/Edit tool results
- Prove files didn't exist before creation
- Include `ls -la` and `cat` output

**✅ Code Execution**
- Show actual test output with exit codes
- Include coverage reports with percentages
- Show compilation/interpretation results

**✅ Git Operations**
- Show actual commit hashes
- Include `git log --oneline` output
- Show `git status --porcelain` results

**✅ Package Management**
- Show actual `pip install`/`npm install` output
- Include `uv sync` results when used
- Verify dependency installation

**✅ Database Operations**
- Show actual migration output
- Include query execution results
- Verify database state changes

### 3. FORBIDDEN LANGUAGE PATTERNS

**NEVER USE THESE PHRASES:**

- ❌ "I would implement..."
- ❌ "The approach would be..."
- ❌ "I can create a plan to..."
- ❌ "In theory, this should work..."
- ❌ "Let me analyze this first..."
- ❌ "Processing to get results..."
- ❌ "Simulated execution shows..."
- ❌ "Theoretical implementation..."

**INSTEAD, USE THESE PATTERNS:**

- ✅ "I created file X using Write tool..."
- ✅ "Test results: 15/15 passing (actual npm test output)"
- ✅ "Commit ABC123 created: `git log --oneline -1` shows..."
- ✅ "Package installed: `pip install` output shows..."
- ✅ "Migration successful: Django output shows..."

### 4. Verification Templates

#### File Creation Template
```markdown
✅ **File Created:** `src/auth.py`

**Evidence:**
```bash
$ ls -la src/auth.py
-rw-r--r-- 1 user user 1234 Jan 9 10:30 src/auth.py

$ cat src/auth.py
def authenticate_user(email, password):
    if email == 'test@example.com' and password == 'secret':
        return True
    return False
```
```

#### Test Execution Template
```markdown
✅ **Tests Executed and Passing**

**Evidence:**
```bash
$ python -m pytest tests/test_auth.py -v
============================= test session starts ==============================
collected 1 item

test_auth.py::test_authenticate_user PASSED                              [100%]
============================== 1 passed in 0.02s ==============================
```
```

#### Git Operations Template
```markdown
✅ **Changes Committed**

**Evidence:**
```bash
$ git status --porcelain
M  src/auth.py
A  tests/test_auth.py

$ git log --oneline -1
a1b2c3d feat(auth): add user authentication system

$ git show --stat HEAD
 src/auth.py          | 12 ++++++++++++
 tests/test_auth.py    |  8 ++++++++
 2 files changed, 20 insertions(+)
```
```

## 🔧 AGENT-SPECIFIC REQUIREMENTS

### EXECUTOR Agent
- MUST follow strict RED→GREEN→REFACTOR TDD cycle
- MUST achieve ≥80% coverage before reporting completion
- MUST create atomic commits with phase labels
- MUST use `verifyTDDCycle()` function before completion

### PYTHON-PRO Agent
- MUST use `uv` for package management when available
- MUST run `pytest` with coverage reporting
- MUST include type hints in all Python code
- MUST verify async code execution with actual output

### DJANGO-PRO Agent
- MUST run migrations with actual Django output
- MUST use `pytest-django` for testing
- MUST verify model creation and ORM operations
- MUST show actual Django management command output

### LINTER Agent
- MUST show actual linting tool output
- MUST include before/after file diffs when fixing
- MUST verify linting fixes with `ruff check` or equivalent
- MUST report actual error counts and fixes

### CODE-REVIEWER Agent
- MUST analyze actual code, not descriptions
- MUST provide specific line numbers and suggestions
- MUST show actual diff examples for improvements
- MUST verify suggestions work with test execution

## 🚨 ENFORCEMENT MECHANISMS

### 1. Verification Functions
All state-changing agents MUST include a `verifyWork()` function:

```javascript
async function verifyWork(workType, evidence) {
  // Ground truth checks for specific work type
  // Return verification report with boolean flags
  // Must be called before reporting completion
}
```

### 2. E2E Test Validation
All agents must pass anti-hallucination E2E tests:
- Tests verify actual tool usage, not claimed results
- Tests validate ground truth verification functions
- Tests check for forbidden language patterns

### 3. Output Format Standards
All completion reports must include:
- Tool output evidence
- Verification status
- Actual file changes
- Real test results
- Git commit information

## 📊 COMPLIANCE MONITORING

### Success Metrics
- **100%** of claims backed by tool output
- **0%** use of forbidden language patterns
- **100%** of agents have verification functions
- **<5%** verification failure rate

### Failure Detection
Automatic monitoring for:
- Missing tool output evidence
- Use of forbidden language patterns
- Claims without verification
- Simulated vs actual execution

### Remediation Process
When failures detected:
1. Immediately stop agent execution
2. Report specific violation
3. Provide correction requirements
4. Re-run verification after fixes

## 🔄 IMPLEMENTATION CHECKLIST

For each agent implementation, verify:

- [ ] Anti-hallucination protocol at TOP of agent definition
- [ ] Verification function implemented
- [ ] Ground truth checks for all work types
- [ ] Forbidden language patterns avoided
- [ ] Tool output evidence required
- [ ] E2E tests pass for anti-hallucination
- [ ] Documentation updated with examples

## 📚 TRAINING REQUIREMENTS

All agent definitions must include:

1. **Prominent execution instructions** at the top
2. **Specific examples** of correct vs incorrect reporting
3. **Verification templates** for common operations
4. **Failure handling** procedures
5. **Tool usage guidelines** with actual commands

## ⚡ IMMEDIATE ACTION REQUIRED

### Phase 1: Critical Agents (Week 1)
- EXECUTOR - Already compliant ✓
- PYTHON-PRO - Updated with protocol ✓
- DJANGO-PRO - Updated with protocol ✓
- LINTER - Needs protocol added
- CODE-REVIEWER - Needs protocol added

### Phase 2: Support Agents (Week 2)
- TESTER - Add verification protocols
- TYPECHECKER - Add verification protocols
- VALIDATOR - Add verification protocols

### Phase 3: Monitoring (Week 3)
- Implement E2E tests for all agents
- Add compliance monitoring
- Create violation detection system

## 🎯 SUCCESS CRITERIA

**Complete success when:**
- All agents have prominent anti-hallucination protocols
- All agents implement verification functions
- E2E tests validate actual tool usage
- No agents report simulated work
- All claims have ground truth evidence

## 📞 SUPPORT

If agents encounter situations where they cannot verify work:
1. **Report the limitation honestly**
2. **Explain what tool access is needed**
3. **Do not provide theoretical solutions**
4. **Request specific context or permissions**

This protocol ensures the Linear TDD Workflow System maintains reliability and trustworthiness by guaranteeing that all reported work actually happened and can be verified.