# /assess - Clean Code Assessment

Perform comprehensive code quality assessment and create Linear tasks for issues found.

## Usage
```
/assess [--scope=full|changed] [--depth=shallow|deep]
```

## Script Entrypoints
```bash
# Via Makefile (recommended)
make assess SCOPE=full

# Direct journey execution
node .claude/journeys/jr2-assessment.js

# Via CLI
npm run agent:invoke AUDITOR:assess-code -- --scope full
```

## Parameters
- `--scope`: Assessment scope
  - `full`: Entire codebase (default)
  - `changed`: Only changed files since main branch
- `--depth`: Analysis depth
  - `deep`: Comprehensive analysis (default)
  - `shallow`: Quick scan

## Linear Integration
- **Creates**: CLEAN-XXX issues automatically
- **Priority mapping**:
  - P0: Critical security/data loss
  - P1: Major bugs/performance
  - P2: Code quality issues
  - P3: Minor improvements
  - P4: Nice-to-have refactoring
- **Labels**: `clean-code`, `technical-debt`, `auto-generated`
- **Assignment**: Unassigned (STRATEGIST will coordinate)

## MCP Tools Used
- `mcp__linear-server__create_issue` - Create Linear tasks
- `mcp__linear-server__list_issues` - Check for duplicates
- `sequential-thinking` - Complex code analysis
- `context7` - Library documentation lookup

## Agents Involved
- **Primary**: AUDITOR - Performs assessment
- **Secondary**: STRATEGIST - Prioritizes findings
- **Support**: SCHOLAR - Provides pattern insights

## Output
1. **Assessment Report** (`reports/assessment-YYYYMMDD-HHMMSS.json`)
2. **Linear Tasks** (CLEAN-001 through CLEAN-XXX)
3. **Summary** in console with:
   - Total issues found
   - Issues by severity
   - Estimated fix effort (hours)
   - Linear task links

## SLAs
- Quick scan: ≤5 minutes
- Full scan: ≤12 minutes for 150k LOC
- Linear task creation: ≤2 minutes

## Example Workflow
```bash
# 1. Run assessment
/assess --scope=full

# 2. Review created Linear tasks
# Output: Created 15 Linear tasks (3 P1, 7 P2, 5 P3)

# 3. Execute fixes
/fix CLEAN-001
/fix CLEAN-002
```

## TDD Integration
Assessment identifies missing tests and creates tasks:
- CLEAN-XXX: "Add tests for uncovered function"
- CLEAN-XXX: "Increase coverage from 65% to 80%"

## Notes
- Runs automatically on push to main (via CI)
- Can be scheduled nightly for continuous monitoring
- Respects `.claudeignore` for excluded paths
- Deduplicates issues (won't create duplicates in Linear)