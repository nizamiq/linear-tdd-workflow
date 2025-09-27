# Linear Standardization & Validation Framework

## Objective
Audit, validate, and update existing Linear issues to ensure conformance with project specifications, eliminate duplicates, and maintain data integrity using direct Linear MCP tool integration.

## Execution Parameters
```yaml
project_name: "[TO BE PROVIDED]"
audit_scope: "[all/mvp/current-cycle/specific-label]"
dry_run: [true/false - preview changes without applying]
update_mode: "[aggressive/conservative/interactive]"
duplicate_handling: "[merge/flag/archive]"
```

## Phase 1: Discovery and Analysis

### Step 1.1: Fetch Existing Issues
```python
# Retrieve all issues in project
all_issues = Linear:list_issues(
    project=project_name,
    includeArchived=false,
    limit=250
)

# Get additional context
project_info = Linear:get_project(query=project_name)
team_info = Linear:get_team(query=all_issues[0].team)
existing_labels = Linear:list_issue_labels(team=team_info.name)
current_cycle = Linear:list_cycles(teamId=team_info.id, type="current")
```

### Step 1.2: Build Issue Inventory
```python
issue_inventory = {
    "total_count": len(all_issues),
    "by_state": group_by_state(all_issues),
    "by_priority": group_by_priority(all_issues),
    "missing_estimates": filter_missing_estimates(all_issues),
    "missing_descriptions": filter_empty_descriptions(all_issues),
    "orphaned": filter_no_parent_or_project(all_issues),
    "unlabeled": filter_no_labels(all_issues),
    "potential_duplicates": identify_duplicates(all_issues)
}

print(f"""
Initial Assessment for Project: {project_name}
================================================
Total Issues: {issue_inventory['total_count']}
Missing Estimates: {len(issue_inventory['missing_estimates'])}
Missing Descriptions: {len(issue_inventory['missing_descriptions'])}
Orphaned Issues: {len(issue_inventory['orphaned'])}
Unlabeled Issues: {len(issue_inventory['unlabeled'])}
Potential Duplicates: {len(issue_inventory['potential_duplicates'])}
""")
```

## Phase 2: Validation Rules

### Step 2.1: Format Compliance Checks
```python
def validate_issue_format(issue):
    violations = []
    
    # Title checks
    if len(issue.title) > 60:
        violations.append({"field": "title", "issue": "exceeds_60_chars"})
    if not issue.title[0].isupper():
        violations.append({"field": "title", "issue": "not_capitalized"})
    if not starts_with_verb(issue.title):
        violations.append({"field": "title", "issue": "missing_action_verb"})
    
    # Description checks
    if not issue.description or len(issue.description) < 10:
        violations.append({"field": "description", "issue": "missing_or_minimal"})
    if is_user_story(issue) and not has_story_format(issue.description):
        violations.append({"field": "description", "issue": "missing_story_format"})
    if not has_acceptance_criteria(issue.description):
        violations.append({"field": "description", "issue": "missing_acceptance_criteria"})
    
    # Metadata checks
    if not issue.estimate:
        violations.append({"field": "estimate", "issue": "missing"})
    if issue.estimate and issue.estimate > 13:
        violations.append({"field": "estimate", "issue": "too_large_needs_breakdown"})
    if not issue.priority:
        violations.append({"field": "priority", "issue": "missing"})
    if not issue.labels or len(issue.labels) == 0:
        violations.append({"field": "labels", "issue": "missing"})
    
    # Required labels check
    type_labels = ["feature", "bug", "task", "improvement", "spike"]
    if not any(label in issue.labels for label in type_labels):
        violations.append({"field": "labels", "issue": "missing_type_label"})
    
    return violations
```

### Step 2.2: Content Quality Checks
```python
def validate_issue_content(issue):
    quality_issues = []
    
    # Check for placeholder content
    placeholder_patterns = ["TBD", "TODO", "FIXME", "XXX", "[PLACEHOLDER]"]
    for pattern in placeholder_patterns:
        if pattern in issue.description:
            quality_issues.append({"type": "placeholder", "pattern": pattern})
    
    # Check for missing technical details
    if issue.type == "bug" and not has_reproduction_steps(issue.description):
        quality_issues.append({"type": "missing_repro_steps"})
    
    # Check for vague descriptions
    vague_words = ["various", "multiple", "some", "etc", "and so on"]
    for word in vague_words:
        if word in issue.description.lower():
            quality_issues.append({"type": "vague_description", "word": word})
    
    return quality_issues
```

### Step 2.3: Duplicate Detection
```python
def find_duplicates(issues):
    duplicates = []
    
    for i, issue1 in enumerate(issues):
        for issue2 in issues[i+1:]:
            # Title similarity
            title_similarity = calculate_similarity(issue1.title, issue2.title)
            if title_similarity > 0.85:
                duplicates.append({
                    "issues": [issue1.id, issue2.id],
                    "similarity": title_similarity,
                    "type": "title_match"
                })
            
            # Description similarity (if both have descriptions)
            if issue1.description and issue2.description:
                desc_similarity = calculate_similarity(
                    issue1.description[:200], 
                    issue2.description[:200]
                )
                if desc_similarity > 0.80:
                    duplicates.append({
                        "issues": [issue1.id, issue2.id],
                        "similarity": desc_similarity,
                        "type": "description_match"
                    })
    
    return duplicates
```

## Phase 3: Standardization Actions

### Step 3.1: Auto-Fix Title Format
```python
def standardize_title(issue):
    updates = {}
    original_title = issue.title
    new_title = original_title
    
    # Ensure starts with capital
    new_title = new_title[0].upper() + new_title[1:]
    
    # Add action verb if missing
    if not starts_with_verb(new_title):
        # Infer action based on type
        verb_map = {
            "feature": "Implement",
            "bug": "Fix",
            "task": "Complete",
            "improvement": "Improve",
            "spike": "Investigate"
        }
        issue_type = get_issue_type_from_labels(issue.labels)
        new_title = f"{verb_map.get(issue_type, 'Handle')} {new_title.lower()}"
    
    # Truncate if too long
    if len(new_title) > 60:
        new_title = new_title[:57] + "..."
    
    if new_title != original_title:
        updates["title"] = new_title
        
    return updates
```

### Step 3.2: Enhance Description Format
```python
def standardize_description(issue):
    current_desc = issue.description or ""
    new_desc = current_desc
    
    # Add user story format if applicable
    if is_user_facing_feature(issue) and not has_story_format(current_desc):
        story_template = f"""## User Story
As a [user type]
I want {extract_want_from_title(issue.title)}
So that [business value]

## Original Description
{current_desc}
"""
        new_desc = story_template
    
    # Add acceptance criteria section if missing
    if not has_acceptance_criteria(current_desc):
        ac_template = """

## Acceptance Criteria
- [ ] [Criterion based on title/description]
- [ ] [Quality checks pass]
- [ ] [Documentation updated]
"""
        new_desc += ac_template
    
    # Add technical section for bugs
    if "bug" in issue.labels and not has_technical_section(current_desc):
        bug_template = """

## Technical Details
**Environment**: [Production/Staging/Dev]
**Severity**: [Critical/High/Medium/Low]
**Component**: [Frontend/Backend/API/Database]
**First Seen**: [Date]
"""
        new_desc += bug_template
    
    return new_desc if new_desc != current_desc else None
```

### Step 3.3: Apply Required Labels
```python
def standardize_labels(issue, existing_labels):
    current_labels = issue.labels or []
    new_labels = current_labels.copy()
    
    # Ensure type label exists
    type_labels = ["feature", "bug", "task", "improvement", "spike"]
    if not any(label in current_labels for label in type_labels):
        # Infer type from title/description
        inferred_type = infer_issue_type(issue)
        new_labels.append(inferred_type)
    
    # Add priority label if missing
    priority_labels = ["p0-urgent", "p1-high", "p2-medium", "p3-low"]
    if not any(label in current_labels for label in priority_labels):
        # Map Linear priority to label
        priority_map = {
            1: "p0-urgent",
            2: "p1-high", 
            3: "p2-medium",
            4: "p3-low"
        }
        if issue.priority in priority_map:
            new_labels.append(priority_map[issue.priority])
    
    # Add area label based on content
    area = infer_area_from_content(issue)
    if area and area not in current_labels:
        new_labels.append(area)
    
    # Add MVP label if in current/next cycle
    if issue.cycle and "mvp" not in current_labels:
        new_labels.append("mvp")
    
    return list(set(new_labels)) if new_labels != current_labels else None
```

### Step 3.4: Set Missing Estimates
```python
def estimate_story_points(issue):
    if issue.estimate:
        return None
    
    # Basic heuristic based on type and description
    estimate_map = {
        "spike": 3,  # Research tasks typically medium
        "bug": 2,    # Most bugs are small
        "task": 3,   # Generic tasks medium
        "improvement": 5,  # Improvements often larger
        "feature": 8  # Features typically large
    }
    
    issue_type = get_issue_type_from_labels(issue.labels)
    base_estimate = estimate_map.get(issue_type, 3)
    
    # Adjust based on complexity indicators
    if issue.description:
        if "refactor" in issue.description.lower():
            base_estimate *= 1.5
        if "integration" in issue.description.lower():
            base_estimate *= 1.5
        if "simple" in issue.description.lower():
            base_estimate *= 0.5
    
    # Round to Fibonacci
    fibonacci = [1, 2, 3, 5, 8, 13]
    return min(fibonacci, key=lambda x: abs(x - base_estimate))
```

## Phase 4: Duplicate Resolution

### Step 4.1: Merge Duplicate Issues
```python
def merge_duplicates(issue1, issue2):
    # Determine primary (keep) and secondary (archive)
    primary = issue1 if issue1.createdAt < issue2.createdAt else issue2
    secondary = issue2 if primary == issue1 else issue1
    
    # Merge descriptions
    merged_description = f"""{primary.description}

---
## Merged from {secondary.identifier}
{secondary.description}
"""
    
    # Combine labels
    merged_labels = list(set(primary.labels + secondary.labels))
    
    # Keep higher priority
    merged_priority = min(primary.priority, secondary.priority)
    
    # Update primary issue
    Linear:update_issue(
        id=primary.id,
        description=merged_description,
        labels=merged_labels,
        priority=merged_priority
    )
    
    # Add comment about merge
    Linear:create_comment(
        issueId=primary.id,
        body=f"Merged duplicate issue {secondary.identifier} into this issue"
    )
    
    # Archive secondary issue
    Linear:update_issue(
        id=secondary.id,
        state="canceled"
    )
    
    return primary.id
```

## Phase 5: Execution Workflow

### Step 5.1: Batch Processing
```python
def process_issues_batch(issues, dry_run=False):
    report = {
        "processed": 0,
        "updated": 0,
        "skipped": 0,
        "errors": [],
        "changes": []
    }
    
    for issue in issues:
        try:
            # Get full issue details
            full_issue = Linear:get_issue(id=issue.id)
            
            # Validate format
            violations = validate_issue_format(full_issue)
            
            if violations:
                updates = {}
                
                # Generate fixes
                if "title" in [v["field"] for v in violations]:
                    title_updates = standardize_title(full_issue)
                    if title_updates:
                        updates.update(title_updates)
                
                if "description" in [v["field"] for v in violations]:
                    new_desc = standardize_description(full_issue)
                    if new_desc:
                        updates["description"] = new_desc
                
                if "labels" in [v["field"] for v in violations]:
                    new_labels = standardize_labels(full_issue, existing_labels)
                    if new_labels:
                        updates["labels"] = new_labels
                
                if "estimate" in [v["field"] for v in violations]:
                    estimate = estimate_story_points(full_issue)
                    if estimate:
                        updates["estimate"] = estimate
                
                if updates:
                    if dry_run:
                        report["changes"].append({
                            "issue": full_issue.identifier,
                            "updates": updates
                        })
                        print(f"[DRY RUN] Would update {full_issue.identifier}: {updates.keys()}")
                    else:
                        Linear:update_issue(id=issue.id, **updates)
                        print(f"✓ Updated {full_issue.identifier}: {updates.keys()}")
                        report["updated"] += 1
                else:
                    report["skipped"] += 1
            else:
                report["skipped"] += 1
                
            report["processed"] += 1
            
        except Exception as e:
            report["errors"].append({
                "issue": issue.identifier,
                "error": str(e)
            })
            print(f"✗ Error processing {issue.identifier}: {e}")
    
    return report
```

### Step 5.2: Interactive Mode
```python
def process_interactive(issue, violations):
    print(f"\nIssue: {issue.identifier} - {issue.title}")
    print(f"Violations found: {len(violations)}")
    
    for v in violations:
        print(f"  - {v['field']}: {v['issue']}")
    
    action = input("\nAction? [f]ix-all / [s]elective / [v]iew / [k]skip: ").lower()
    
    if action == 'f':
        return apply_all_fixes(issue, violations)
    elif action == 's':
        return selective_fixes(issue, violations)
    elif action == 'v':
        print_issue_details(issue)
        return process_interactive(issue, violations)
    else:
        return None
```

## Phase 6: Reporting and Verification

### Step 6.1: Generate Audit Report
```python
def generate_audit_report(project_name, initial_state, final_state):
    report = f"""
# Linear Project Standardization Report
**Project**: {project_name}
**Date**: {datetime.now().isoformat()}
**Mode**: {update_mode}

## Summary Statistics
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total Issues | {initial_state['total']} | {final_state['total']} | {final_state['total'] - initial_state['total']} |
| With Estimates | {initial_state['with_estimates']} | {final_state['with_estimates']} | +{final_state['with_estimates'] - initial_state['with_estimates']} |
| With Descriptions | {initial_state['with_descriptions']} | {final_state['with_descriptions']} | +{final_state['with_descriptions'] - initial_state['with_descriptions']} |
| Properly Labeled | {initial_state['labeled']} | {final_state['labeled']} | +{final_state['labeled'] - initial_state['labeled']} |
| Duplicates | {initial_state['duplicates']} | {final_state['duplicates']} | -{initial_state['duplicates'] - final_state['duplicates']} |

## Issues Updated
{list_updated_issues}

## Duplicates Resolved
{list_merged_duplicates}

## Remaining Issues
- [ ] Manual review needed: {manual_review_count}
- [ ] Complex duplicates: {complex_duplicates}
- [ ] Blocked items: {blocked_count}

## Recommendations
1. Review large issues (>13 points) for breakdown
2. Assign owners to orphaned issues
3. Schedule grooming for unlabeled items
4. Update cycle assignments for MVP items
"""
    return report
```

### Step 6.2: Verification Queries
```python
def verify_standardization(project_name):
    # Re-fetch all issues
    updated_issues = Linear:list_issues(
        project=project_name,
        includeArchived=false
    )
    
    verification = {
        "all_have_estimates": all(i.estimate for i in updated_issues),
        "all_have_descriptions": all(i.description for i in updated_issues),
        "all_have_type_labels": all(has_type_label(i) for i in updated_issues),
        "no_oversized_stories": all(i.estimate <= 13 for i in updated_issues if i.estimate),
        "no_orphaned": all(i.projectId or i.parentId for i in updated_issues)
    }
    
    print("\nVerification Results:")
    for check, result in verification.items():
        status = "✅" if result else "❌"
        print(f"{status} {check}: {result}")
    
    return verification
```

---

## Input Section

```yaml
STANDARDIZATION_CONFIGURATION:
  project_name: "[REQUIRED - Linear project to audit]"
  audit_scope: "[all/mvp/current-cycle/label:specific-label]"
  dry_run: [true/false - recommend true for first run]
  update_mode: 
    # aggressive: Auto-fix all issues
    # conservative: Only fix critical issues
    # interactive: Prompt for each change
  duplicate_handling: "[merge/flag/archive]"
  
VALIDATION_RULES:
  enforce_story_format: [true/false]
  require_acceptance_criteria: [true/false]
  require_estimates: [true/false]
  maximum_story_points: [13/21/custom]
  required_labels: ["type", "priority", "area"]
  
CUSTOM_PATTERNS:
"""
[Any project-specific patterns, naming conventions, or rules]
"""

EXCLUDE_PATTERNS:
"""
[Issues to skip - e.g., archived, specific labels, old cycles]
"""
```

## Execution Instructions for Claude

1. **Start with dry run** - Always recommend dry_run=true first
2. **Report initial state** - Show what needs fixing before changes
3. **Process in batches** - Handle 10-20 issues at a time
4. **Validate after updates** - Confirm each change was applied
5. **Handle errors gracefully** - Log but continue processing
6. **Generate final report** - Detailed summary with metrics

## Success Criteria
- ✅ All issues have required fields (title, description, estimate)
- ✅ All issues follow naming conventions
- ✅ All issues have appropriate labels
- ✅ No unresolved duplicates remain
- ✅ All MVP items properly tagged and assigned
- ✅ Parent-child relationships maintained
- ✅ No orphaned issues
- ✅ Audit trail via comments for major changes

## Safety Measures
- 🔒 Never delete issues (archive instead)
- 🔒 Preserve original content in comments
- 🔒 Maintain change log
- 🔒 Respect "do-not-modify" label
- 🔒 Skip in-progress items by default

