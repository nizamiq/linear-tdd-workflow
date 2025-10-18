# Unified Execution Standards V1.0

**Replaces**: Anti-hallucination V2, verification protocols, and all execution safeguards
**Purpose**: Single source of truth for all execution standards
**Maintenance**: Minimal - update only when standards change
**Focus**: User value, not system policing

---

## 🚀 Core Principle: Execute Real Work

### Executive Summary
- **DO**: Use tools to make actual changes
- **DON'T**: Describe what you "would" do
- **VERIFY**: Show tool output as evidence
- **REPORT**: Only what actually happened

### Simple Decision Tree
```
START → Can I use tools to make this change?
  ├─ YES → Execute with tools → Show output → Report results
  └─ NO  → Report limitation → Suggest alternative approach
```

---

## 🛡️ Essential Safeguards (Minimal Set)

### 1. Tool Verification (Required)
**Before reporting ANY work, you must have:**
- File operations: `Write/Edit` tool results
- Tests: `npm test` output with pass/fail
- Git: `git log` output with commit hashes
- Coverage: `npm run coverage` output with percentages

### 2. Task Validation (Required)
**Before starting work:**
- Verify Linear task exists (if task ID provided)
- If task doesn't exist → STOP and report
- If no task ID → Proceed with user-provided context

### 3. Realistic Reporting (Required)
**Only report what you actually did:**
- ❌ "I implemented the authentication system"
- ✅ "Created auth.js (45 lines) with tests passing"
- ❌ "All tests are now passing"
- ✅ "npm test output: 15/15 passing"

---

## ⚡ Execution Standards

### File Operations
```bash
# BEFORE: Show file doesn't exist
ls -la src/new-feature.js 2>/dev/null || echo "FILE NOT FOUND"

# AFTER: Show file exists
ls -la src/new-feature.js
stat src/new-feature.js  # Shows creation time
```

### Test Execution
```bash
# Run tests and show ACTUAL output
npm test -- --verbose

# Show coverage if requested
npm run coverage:check
```

### Git Operations
```bash
# Show actual commits
git log --oneline -3

# Show what changed
git diff --stat HEAD~1
```

### Error Handling
```bash
# Show actual errors, don't hide them
npm test 2>&1 | grep -A 5 "FAIL\|error"

# Report limitations honestly
"Cannot run integration tests - test database not configured"
```

---

## 🔍 Quality Tiers

### Tier 1: Fast Track (Documentation, Minor Fixes)
- Single test file
- Basic lint check
- No coverage requirements
- Deploy immediately

### Tier 2: Standard (Features, Bug Fixes)
- Full TDD cycle
- 80% coverage minimum
- Integration tests
- PR review required

### Tier 3: Critical (System Changes, Security)
- Full verification suite
- Multiple approvers
- Rollback plan required
- Staged deployment

---

## 📊 Success Metrics

### What We Track
- **Features shipped per week**: Target 3+
- **Time from idea to working**: Target <24 hours
- **User adoption**: Active users, feature usage
- **System stability**: >95% uptime

### What We Don't Track
- Number of "protocols" followed
- Amount of verification documentation
- Agent compliance scores
- Maintenance activities performed

---

## 🎯 Examples: Right vs Wrong

### WRONG (Don't Do This)
```
"I analyzed the codebase and identified several opportunities for improvement.
I would recommend implementing a new authentication system with OAuth2 integration.
The approach would be to create a comprehensive solution that handles all edge cases.
In theory, this would provide significant security benefits."
```

### RIGHT (Do This Instead)
```
"Created src/auth.js (67 lines) with OAuth2 integration
✅ Test results: npm test → 12/12 passing
✅ Coverage: 85% (target: 80%)
✅ Commit: a1b2c3d - 'feat(auth): add OAuth2 integration'
✅ Linear task: AUTH-123 updated to 'Done'
```

### When You Can't Execute
```
"Cannot implement OAuth2 integration - missing CLIENT_SECRET environment variable.
Required: Set CLIENT_SECRET in .env file
Alternative: Use mock authentication for development
"
```

---

## 🔄 Integration Points

### Linear Integration
- Check task exists before starting
- Update task status on completion
- Link commits to issues

### Git Integration
- Atomic commits with clear messages
- Branch management follows GitFlow
- Tags for releases

### Testing Integration
- Jest for unit tests
- Playwright for E2E tests
- Coverage reporting

---

## 📋 Quick Reference

### DO ✅
- Use Write/Edit tools to create files
- Run npm test and show output
- Show git log with real commits
- Report actual tool output
- Say "cannot do X because Y"

### DON'T ❌
- Describe what you "would" do
- Report imaginary results
- Hide limitations or errors
- Create theoretical implementations
- Say "I analyzed" without showing analysis

### ALWAYS 💯
- Verify before reporting
- Show evidence of work
- Be honest about limitations
- Focus on user value

---

## 🎉 The Goal

**Build features users love, quickly and reliably.**

Everything in this document serves that single purpose. If something doesn't help users get value faster, question whether it belongs here.

---

*Version: 1.0*
*Focus: Features over maintenance*
*Last Updated: 2025-10-18*