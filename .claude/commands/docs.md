---
name: docs
description: Documentation validation, generation, and maintenance operations
agent: DOC-KEEPER
category: documentation
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash]
argument-hint: "<validate|generate|update|fix> [--scope=<path>]"
---

# /docs - Documentation Operations

Invokes the DOC-KEEPER agent for documentation validation, generation, and maintenance tasks.

## Usage

```bash
/docs <operation> [options]
```

## Operations

### validate
Validate documentation for accuracy, broken links, and code examples.

**Usage**:
```bash
/docs validate [--scope=<scope>] [--fix]
```

**Options**:
- `--scope=all` - Validate all documentation (default)
- `--scope=links` - Only validate links
- `--scope=examples` - Only validate code examples
- `--scope=xrefs` - Only validate cross-references
- `--fix` - Automatically fix simple issues

**Examples**:
```bash
# Validate all documentation
/docs validate

# Only check for broken links
/docs validate --scope=links

# Validate and auto-fix simple issues
/docs validate --fix
```

**What It Does**:
1. Scans all markdown files in the project
2. Validates links (internal and external)
3. Tests code examples for correctness
4. Checks cross-references between documents
5. Reports issues or creates Linear tasks
6. Auto-fixes simple issues if --fix is specified

**Output**:
```
📊 Documentation Validation Report

✅ Link Health: 98.5% (197/200 valid)
   ❌ 3 broken links found:
      - docs/api/legacy-api.md:45 → /old-endpoint (404)
      - README.md:120 → #missing-anchor (anchor not found)
      - .claude/agents/auditor.md:89 → ../docs/old-guide.md (file not found)

✅ Code Examples: 100% (45/45 passed)

⚠️  Cross-References: 95% (38/40 valid)
   ❌ 2 inconsistencies found:
      - docs/workflow.md claims "5 agents" but system has 23
      - README.md mentions "Python 3.9+" but requirements.txt shows ">=3.10"

📋 Created 3 Linear tasks: DOC-15, DOC-16, DOC-17
```

---

### generate
Generate documentation from code, workflows, or patterns.

**Usage**:
```bash
/docs generate <type> [--output=<path>]
```

**Types**:
- `api` - Generate API reference from agent specifications
- `tutorial` - Generate tutorial from workflow YAML
- `changelog` - Generate changelog from git commits
- `reference` - Generate command reference
- `glossary` - Generate glossary from terminology

**Examples**:
```bash
# Generate API documentation for all agents
/docs generate api

# Generate tutorial from specific workflow
/docs generate tutorial --workflow=tdd-cycle

# Generate changelog since last release
/docs generate changelog --since=v1.0.0

# Generate command reference
/docs generate reference
```

**What It Does**:
1. Parses source files (agent specs, workflows, commits)
2. Extracts relevant information
3. Applies documentation templates
4. Generates well-formatted markdown
5. Updates cross-references
6. Creates or updates target files

**Output**:
```
📝 Documentation Generated

Generated API Reference:
  ✅ docs/api-reference/index.md (new)
  ✅ docs/api-reference/agents/auditor.md (new)
  ✅ docs/api-reference/agents/executor.md (new)
  ... (21 more files)

Cross-references updated:
  ✅ Updated 15 links in existing documentation
  ✅ Added to navigation index

📊 Stats:
  - Total pages: 23
  - Total lines: 2,847
  - Commands documented: 180
  - Examples included: 95
```

---

### audit
Perform comprehensive documentation quality audit.

**Usage**:
```bash
/docs audit [--comprehensive] [--report=<format>]
```

**Options**:
- `--comprehensive` - Full audit including metrics and analysis
- `--report=json` - Export report as JSON (default: markdown)
- `--report=html` - Export report as HTML

**Examples**:
```bash
# Quick audit
/docs audit

# Comprehensive audit with HTML report
/docs audit --comprehensive --report=html
```

**What It Does**:
1. Runs all validation checks
2. Analyzes documentation coverage
3. Checks freshness and staleness
4. Measures quality metrics
5. Identifies gaps and opportunities
6. Generates comprehensive report

**Output**:
```
📊 Documentation Audit Report

Coverage Analysis:
  ✅ Agent Commands: 98% (176/180 documented)
  ✅ Configuration Options: 95% (38/40 documented)
  ⚠️  Error Codes: 72% (58/80 documented)
  ❌ Workflow Steps: 65% (78/120 documented)

Quality Metrics:
  ✅ Link Health: 98.5%
  ✅ Example Success Rate: 100%
  ⚠️  Average Freshness: 45 days (target: <30)
  ✅ User Satisfaction: 96%

Issues Found:
  - 12 pages not updated in 60+ days
  - 22 error codes lack documentation
  - 42 workflow steps need better explanations
  - 3 deprecated features still documented

Recommendations:
  1. Update stale documentation (12 pages)
  2. Document remaining error codes (22 codes)
  3. Expand workflow documentation (42 steps)
  4. Remove deprecated feature docs (3 features)

📋 Created 4 Linear tasks: DOC-18, DOC-19, DOC-20, DOC-21
Full report: docs/audit-report-2025-01-15.html
```

---

### update
Update specific documentation based on code changes.

**Usage**:
```bash
/docs update <target> [--auto-commit]
```

**Targets**:
- `agent:<name>` - Update specific agent documentation
- `workflow:<name>` - Update specific workflow documentation
- `changelog` - Update changelog with recent changes
- `all` - Update all documentation

**Examples**:
```bash
# Update specific agent documentation
/docs update agent:executor

# Update workflow documentation
/docs update workflow:tdd-cycle

# Update changelog
/docs update changelog

# Update all documentation
/docs update all --auto-commit
```

**What It Does**:
1. Detects changes in code/specifications
2. Updates corresponding documentation
3. Validates changes don't break links
4. Tests updated code examples
5. Optionally creates git commit

**Output**:
```
📝 Documentation Updated

Updated Files:
  ✅ docs/api-reference/agents/executor.md
     - Updated command parameters
     - Added 2 new examples
     - Fixed 1 broken link

Validation:
  ✅ All links valid
  ✅ All code examples tested
  ✅ Cross-references updated

💾 Changes committed: docs: update executor agent documentation
```

---

### coverage
Analyze documentation coverage for features, commands, and errors.

**Usage**:
```bash
/docs coverage [--type=<type>] [--threshold=<percent>]
```

**Options**:
- `--type=features` - Check feature documentation coverage
- `--type=commands` - Check command documentation coverage
- `--type=errors` - Check error code documentation coverage
- `--type=all` - Check all coverage types (default)
- `--threshold=95` - Minimum acceptable coverage (default: 95%)

**Examples**:
```bash
# Check all coverage
/docs coverage

# Check only command coverage
/docs coverage --type=commands

# Check with custom threshold
/docs coverage --threshold=90
```

**What It Does**:
1. Scans codebase for features/commands/errors
2. Checks if each item is documented
3. Calculates coverage percentages
4. Identifies gaps
5. Creates Linear tasks for missing docs

**Output**:
```
📊 Documentation Coverage Report

Agent Commands:
  ✅ 176/180 documented (98%)
  Missing:
    - AUDITOR:analyze-dependencies
    - GUARDIAN:predict-failure
    - SCHOLAR:trend-analysis
    - TESTER:fuzz-testing

Configuration Options:
  ✅ 38/40 documented (95%)
  Missing:
    - MAX_RETRY_ATTEMPTS
    - ENABLE_EXPERIMENTAL_FEATURES

Error Codes:
  ⚠️  58/80 documented (72%) - BELOW THRESHOLD
  Missing (22 codes):
    - ERR_001, ERR_005, ERR_012, ERR_015 ... [18 more]

Workflows:
  ⚠️  78/120 steps documented (65%) - BELOW THRESHOLD
  Missing (42 steps):
    - tdd-cycle: steps 5-8
    - lint-and-format: steps 3, 7-9
    - deployment-gates: steps 4, 10-12
    ... [32 more]

Overall Coverage: 87% (target: 95%)

📋 Created 3 Linear tasks to document missing items
```

---

### fix
Fix documentation issues automatically.

**Usage**:
```bash
/docs fix <issue-type> [--dry-run]
```

**Issue Types**:
- `broken-links` - Fix broken internal links
- `formatting` - Fix markdown formatting issues
- `examples` - Fix code example syntax
- `xrefs` - Fix cross-reference inconsistencies
- `all` - Fix all auto-fixable issues

**Examples**:
```bash
# Fix broken links (dry run first)
/docs fix broken-links --dry-run

# Actually fix broken links
/docs fix broken-links

# Fix all issues
/docs fix all
```

**What It Does**:
1. Identifies fixable issues
2. Shows planned changes (if --dry-run)
3. Applies automated fixes
4. Validates fixes don't break anything
5. Creates git commit with changes

**Output**:
```
🔧 Documentation Fixes Applied

Broken Links Fixed (3):
  ✅ docs/api/legacy-api.md:45
     Changed: /old-endpoint → /api/v2/endpoint
  ✅ README.md:120
     Changed: #missing-anchor → #quick-start
  ✅ .claude/agents/auditor.md:89
     Changed: ../docs/old-guide.md → ../docs/user-guide.md

Formatting Fixed (7):
  ✅ Fixed heading hierarchy in 3 files
  ✅ Fixed code block language identifiers in 4 files

Validation:
  ✅ All fixes validated
  ✅ No broken links remain
  ✅ All examples still valid

💾 Changes committed: docs: auto-fix broken links and formatting
```

---

### search
Search documentation for specific content or patterns.

**Usage**:
```bash
/docs search "<query>" [--scope=<scope>]
```

**Options**:
- `--scope=all` - Search all documentation (default)
- `--scope=user` - Search user documentation only
- `--scope=api` - Search API reference only
- `--scope=agents` - Search agent specifications only

**Examples**:
```bash
# Search for "TDD cycle"
/docs search "TDD cycle"

# Search only in API reference
/docs search "mcp__linear" --scope=api

# Search in agent specs
/docs search "sequential-thinking" --scope=agents
```

**What It Does**:
1. Searches all specified documentation
2. Returns ranked results
3. Shows context around matches
4. Provides direct links to files
5. Suggests related documentation

**Output**:
```
🔍 Documentation Search Results for "TDD cycle"

Found 15 matches across 8 documents:

📄 docs/WORKFLOW-TDD-PROTOCOL.md (5 matches)
   Line 45: The TDD cycle consists of three phases: RED→GREEN→REFACTOR
   Line 89: Every fix must follow the TDD cycle strictly
   Line 132: Skipping the TDD cycle is not permitted
   [2 more matches]

📄 .claude/agents/executor.md (4 matches)
   Line 23: Enforces strict TDD cycle for all implementations
   Line 156: Phase 1 (RED): Write failing test for TDD cycle
   [2 more matches]

📄 .claude/workflows/tdd-cycle.yaml (3 matches)
   Line 1: name: tdd-cycle
   Line 3: description: Strict TDD cycle enforcement workflow
   [1 more match]

... [5 more files]

Related Documentation:
  → docs/tutorials/tdd-tutorial.md
  → .claude/docs/TDD-WORKFLOW.md
  → docs/api-reference/commands/by-category.md#testing
```

---

## Common Workflows

### Daily Documentation Validation
```bash
# Quick validation of all docs
/docs validate

# If issues found, fix automatically
/docs fix all

# Commit fixes
git add -A && git commit -m "docs: daily validation fixes"
```

### After Code Changes
```bash
# Update affected documentation
/docs update all

# Validate changes
/docs validate

# Check coverage hasn't decreased
/docs coverage
```

### Before Release
```bash
# Comprehensive audit
/docs audit --comprehensive

# Generate updated API reference
/docs generate api

# Update changelog
/docs generate changelog --since=v1.0.0

# Final validation
/docs validate --fix
```

### Monthly Review
```bash
# Full audit with report
/docs audit --comprehensive --report=html

# Check coverage against targets
/docs coverage --threshold=95

# Identify stale content
/docs validate --scope=freshness
```

## Integration with Other Commands

### Works Well With

**`/assess`** - Document quality issues found during code assessment
```bash
# Assess code quality
/assess

# Document any quality standards found
/docs update all
```

**`/fix`** - Document fixes implemented
```bash
# Implement fix
/fix TASK-123

# Update documentation
/docs update agent:executor
```

**`/learn`** - Document patterns discovered
```bash
# Extract patterns
/learn

# Generate pattern documentation
/docs generate patterns
```

## Linear Task Integration

DOC-KEEPER creates these task types in Linear:

- **DOC-BROKEN-LINK** - Broken link found (Priority: P1)
- **DOC-OUTDATED** - Content doesn't match code (Priority: P2)
- **DOC-MISSING** - Feature lacks documentation (Priority: P2)
- **DOC-QUALITY** - Quality improvement needed (Priority: P3)
- **DOC-EXAMPLE** - Code example issue (Priority: P2)

## Best Practices

1. **Run validation daily** - Catch issues early
2. **Update docs with code** - Never let them drift
3. **Test examples** - Ensure all code runs
4. **Fix broken links immediately** - They block users
5. **Generate don't write** - Automate what you can
6. **Monitor coverage** - Keep above 95%
7. **Review quarterly** - Keep content fresh

## Troubleshooting

**Problem**: Validation takes too long
**Solution**: Use `--scope` to limit validation area

**Problem**: Too many false positives for external links
**Solution**: Configure link whitelist in `.docs-config.json`

**Problem**: Code examples keep failing
**Solution**: Use `--fix` to auto-correct simple syntax issues

**Problem**: Coverage reports missing items
**Solution**: Ensure code includes proper documentation annotations

## Configuration

Create `.docs-config.json` in project root:

```json
{
  "validation": {
    "check_external_links": true,
    "external_link_timeout": 5000,
    "ignore_link_patterns": ["^https://example.com/beta/.*"]
  },
  "coverage": {
    "threshold": 95,
    "ignore_patterns": ["**/archive/**", "**/deprecated/**"]
  },
  "generation": {
    "api_output": "docs/api-reference",
    "tutorial_output": "docs/tutorials"
  }
}
```

## See Also

- `/assess` - Code quality assessment (includes doc quality)
- `/learn` - Pattern learning (generates pattern docs)
- Agent Specifications: `.claude/agents/doc-keeper.md`
- Documentation Guide: `.claude/docs/USER-GUIDE.md`