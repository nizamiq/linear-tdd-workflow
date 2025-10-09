# 🚨 Universal Anti-Hallucination Protocol

**CRITICAL: ALL AGENTS MUST FOLLOW THESE RULES TO PREVENT FABRICATING WORK**

## Core Principles

1. **NEVER claim work you didn't actually do**
2. **ALWAYS verify actions with tool output**
3. **REPORT actual results, not intentions**
4. **BE HONEST about what actually happened**

## Ground Truth Verification Rules

### File Operations
- ❌ **WRONG**: "Created the authentication service"
- ✅ **RIGHT**: "File auth.js created (verified: `ls -la src/auth.js` shows existence)"

### Code Implementation
- ❌ **WRONG**: "Implemented user login feature"
- ✅ **RIGHT**: "Added 45 lines to auth.js, tests pass (npm test: 15/15 passing)"

### Analysis Work
- ❌ **WRONG**: "Analyzed the system and identified issues"
- ✅ **RIGHT**: "Read 5 files, found 3 functions using deprecated API"

### Existing Work Discovery
- ❌ **WRONG**: "Created comprehensive dashboard component"
- ✅ **RIGHT**: "Found existing dashboard.js (created 2024-01-15), no new implementation needed"

## Mandatory Evidence Requirements

### Before ANY Claim, Ask:
1. **Did I actually touch the file system?** Check `git status`
2. **Did I actually run any commands?** Check command output
3. **Did I actually create new content?** Check file timestamps
4. **Am I describing existing work as new?** Check file history

### Required Evidence Patterns

**File Creation:**
```bash
# Prove it didn't exist:
ls -la path/to/file.js 2>/dev/null || echo "FILE NOT FOUND"

# Prove it exists now:
ls -la path/to/file.js
stat path/to/file.js
```

**Content Changes:**
```bash
# Show actual changes:
git diff --stat
git diff path/to/file.js
```

**Test Results:**
```bash
# Show real output:
npm test 2>&1 | head -10
echo "Tests run at: $(date)"
```

**Git Operations:**
```bash
# Show real commits:
git log --oneline -3
git log -1 --stat
```

## Forbidden Language Patterns

**NEVER use these phrases:**
- "I implemented..."
- "I created..."
- "I built..."
- "I developed..."
- "I wrote..."
- "The system now has..."
- "Successfully added..."
- "Completed the implementation..."

## Required Language Patterns

**ALWAYS use these instead:**
- "File X created (verified by...)"
- "Added N lines to Y (git diff shows...)"
- "Modified X function (see diff above)"
- "Analysis complete: found Z issues"
- "Existing implementation found in X"
- "No changes needed - feature already exists"

## Honesty Protocol

### When No Work Was Done:
**Say this**: "Analysis complete. No new implementation required as the functionality already exists in existing_file.js (created on DATE)."

**NOT this**: "I've successfully implemented the feature..."

### When Only Analysis Was Done:
**Say this**: "Read 3 files and documented their current state. No modifications made."

**NOT this**: "I've enhanced the system architecture..."

### When Existing Work Was Found:
**Say this**: "Discovered existing implementation in src/feature.js. The requested functionality is already present."

**NOT this**: "I created the feature implementation..."

## Reality Check Checklist

Before submitting ANY report, verify:

- [ ] **File System**: Did I actually create/modify files?
- [ ] **Git Evidence**: Do commits actually exist?
- [ ] **Test Output**: Did tests actually run?
- [ ] **Tool Output**: Can I show actual command results?
- [ ] **Timestamps**: Are claimed changes reflected in file timestamps?
- [ ] **Existing Work**: Am I describing existing files as new work?

## Reporting Templates

### Template 1: Actual Implementation Work
```
**Work Completed:**
- Created: src/new-feature.js (127 lines)
- Tests: test/new-feature.test.js (45 lines, 95% coverage)
- Verification: `npm test` output shows 127/127 passing
- Git: Commit ABC123 contains all changes
- Evidence: See command output above
```

### Template 2: Analysis Only
```
**Analysis Complete:**
- Reviewed: src/existing-feature.js, README.md, config.json
- Found: 3 functions using deprecated API
- State: No modifications made, documentation only
```

### Template 3: Existing Work Discovery
```
**Existing Implementation Found:**
- Location: src/feature.js (created 2024-01-15)
- Content: Contains requested functionality
- Action: No new code required
```

## Consequences for Violations

**If an agent violates this protocol:**
1. First offense: Protocol retraining
2. Second offense: Output verification lockdown
3. Third offense: Agent capability suspension

**ALL agents must verify claims before reporting. NO EXCEPTIONS.**