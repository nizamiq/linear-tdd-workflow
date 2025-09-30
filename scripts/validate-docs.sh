#!/usr/bin/env bash
set -euo pipefail

# Documentation Validation Script
# Used by DOC-KEEPER agent for comprehensive documentation validation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORT_DIR="$PROJECT_ROOT/docs/validation-reports"
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_LINKS=0
BROKEN_LINKS=0
TOTAL_EXAMPLES=0
FAILED_EXAMPLES=0
TOTAL_FILES=0
ISSUES_FOUND=0

# Options
CHECK_LINKS=true
CHECK_EXAMPLES=true
CHECK_XREFS=true
CHECK_FORMATTING=true
FIX_ISSUES=false
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --check-links)
      CHECK_LINKS=true
      CHECK_EXAMPLES=false
      CHECK_XREFS=false
      CHECK_FORMATTING=false
      shift
      ;;
    --check-examples)
      CHECK_LINKS=false
      CHECK_EXAMPLES=true
      CHECK_XREFS=false
      CHECK_FORMATTING=false
      shift
      ;;
    --check-xrefs)
      CHECK_LINKS=false
      CHECK_EXAMPLES=false
      CHECK_XREFS=true
      CHECK_FORMATTING=false
      shift
      ;;
    --fix)
      FIX_ISSUES=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --report)
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Create report directory
mkdir -p "$REPORT_DIR"
REPORT_FILE="$REPORT_DIR/validation-$TIMESTAMP.json"

# Initialize report
cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_files": 0,
  "issues": [],
  "summary": {}
}
EOF

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# Find all markdown files
find_markdown_files() {
  find "$PROJECT_ROOT" -type f -name "*.md" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/archive/*" | sort
}

# Extract all links from a markdown file
extract_links() {
  local file=$1
  grep -oP '\[([^\]]+)\]\(([^)]+)\)' "$file" | sed -n 's/.*(\([^)]*\)).*/\1/p' || true
}

# Check if internal link is valid
check_internal_link() {
  local file=$1
  local link=$2
  local base_dir=$(dirname "$file")

  # Remove anchor
  local path=${link%%#*}

  # If link is just an anchor, check in same file
  if [[ $link == \#* ]]; then
    local anchor=${link#\#}
    if grep -q "^#.*${anchor}" "$file" || grep -q "id=\"${anchor}\"" "$file"; then
      return 0
    else
      return 1
    fi
  fi

  # Check if file exists (relative to current file)
  if [[ -f "$base_dir/$path" ]] || [[ -f "$PROJECT_ROOT/$path" ]]; then
    # If link has anchor, check anchor exists
    if [[ $link == *#* ]]; then
      local anchor=${link##*#}
      local target_file
      if [[ -f "$base_dir/$path" ]]; then
        target_file="$base_dir/$path"
      else
        target_file="$PROJECT_ROOT/$path"
      fi

      if grep -q "^#.*${anchor}" "$target_file" || grep -q "id=\"${anchor}\"" "$target_file"; then
        return 0
      else
        return 1
      fi
    fi
    return 0
  else
    return 1
  fi
}

# Check if external link is valid
check_external_link() {
  local link=$1
  local status

  # Timeout after 5 seconds
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$link" 2>/dev/null || echo "000")

  if [[ $status == "200" ]] || [[ $status == "301" ]] || [[ $status == "302" ]]; then
    return 0
  else
    return 1
  fi
}

# Validate links in documentation
validate_links() {
  log_info "Validating documentation links..."

  local files=$(find_markdown_files)

  while IFS= read -r file; do
    ((TOTAL_FILES++)) || true

    if [[ $VERBOSE == true ]]; then
      log_info "Checking links in: $file"
    fi

    local links=$(extract_links "$file")

    while IFS= read -r link; do
      [[ -z $link ]] && continue
      ((TOTAL_LINKS++)) || true

      # Check if internal or external link
      if [[ $link == http* ]]; then
        # External link
        if ! check_external_link "$link"; then
          ((BROKEN_LINKS++)) || true
          ((ISSUES_FOUND++)) || true
          log_error "Broken external link in $file: $link"

          # Add to report
          echo "  Broken link: $file -> $link" >> "$REPORT_DIR/links-broken.txt"
        fi
      else
        # Internal link
        if ! check_internal_link "$file" "$link"; then
          ((BROKEN_LINKS++)) || true
          ((ISSUES_FOUND++)) || true
          log_error "Broken internal link in $file: $link"

          # Add to report
          echo "  Broken link: $file -> $link" >> "$REPORT_DIR/links-broken.txt"
        fi
      fi
    done <<< "$links"

  done <<< "$files"

  # Summary
  local valid_links=$((TOTAL_LINKS - BROKEN_LINKS))
  local success_rate=0
  if [[ $TOTAL_LINKS -gt 0 ]]; then
    success_rate=$(awk "BEGIN {printf \"%.1f\", ($valid_links / $TOTAL_LINKS) * 100}")
  fi

  log_info ""
  log_info "Link Validation Summary:"
  log_info "  Total links: $TOTAL_LINKS"
  log_success "  Valid: $valid_links ($success_rate%)"

  if [[ $BROKEN_LINKS -gt 0 ]]; then
    log_error "  Broken: $BROKEN_LINKS"
    log_info "  See: $REPORT_DIR/links-broken.txt"
  else
    log_success "  No broken links found!"
  fi
}

# Extract code blocks from markdown
extract_code_blocks() {
  local file=$1
  local language=$2

  awk -v lang="$language" '
    BEGIN { in_block=0; block="" }
    /^```/ {
      if (in_block) {
        print block
        block=""
        in_block=0
      } else {
        if ($0 ~ "```" lang) {
          in_block=1
        }
      }
      next
    }
    in_block { block = block $0 "\n" }
  ' "$file"
}

# Validate code examples
validate_examples() {
  log_info "Validating code examples..."

  local files=$(find_markdown_files)
  local temp_js="/tmp/doc-example-$$.js"
  local temp_sh="/tmp/doc-example-$$.sh"

  while IFS= read -r file; do
    if [[ $VERBOSE == true ]]; then
      log_info "Checking examples in: $file"
    fi

    # Check JavaScript/TypeScript examples
    local js_examples=$(extract_code_blocks "$file" "javascript\|typescript\|js\|ts")
    if [[ -n $js_examples ]]; then
      ((TOTAL_EXAMPLES++)) || true
      echo "$js_examples" > "$temp_js"

      if ! node --check "$temp_js" 2>/dev/null; then
        ((FAILED_EXAMPLES++)) || true
        ((ISSUES_FOUND++)) || true
        log_error "Invalid JavaScript example in $file"
        echo "  Invalid JS: $file" >> "$REPORT_DIR/examples-failed.txt"
      fi
    fi

    # Check Bash examples
    local sh_examples=$(extract_code_blocks "$file" "bash\|sh\|shell")
    if [[ -n $sh_examples ]]; then
      ((TOTAL_EXAMPLES++)) || true
      echo "$sh_examples" > "$temp_sh"

      if ! bash -n "$temp_sh" 2>/dev/null; then
        ((FAILED_EXAMPLES++)) || true
        ((ISSUES_FOUND++)) || true
        log_error "Invalid Bash example in $file"
        echo "  Invalid Bash: $file" >> "$REPORT_DIR/examples-failed.txt"
      fi
    fi

  done <<< "$files"

  # Cleanup
  rm -f "$temp_js" "$temp_sh"

  # Summary
  local valid_examples=$((TOTAL_EXAMPLES - FAILED_EXAMPLES))
  local success_rate=0
  if [[ $TOTAL_EXAMPLES -gt 0 ]]; then
    success_rate=$(awk "BEGIN {printf \"%.1f\", ($valid_examples / $TOTAL_EXAMPLES) * 100}")
  fi

  log_info ""
  log_info "Example Validation Summary:"
  log_info "  Total examples: $TOTAL_EXAMPLES"
  log_success "  Valid: $valid_examples ($success_rate%)"

  if [[ $FAILED_EXAMPLES -gt 0 ]]; then
    log_error "  Failed: $FAILED_EXAMPLES"
    log_info "  See: $REPORT_DIR/examples-failed.txt"
  else
    log_success "  All examples valid!"
  fi
}

# Validate cross-references
validate_xrefs() {
  log_info "Validating cross-references..."

  # Check for common inconsistencies
  local agent_count=$(find .claude/agents -name "*.md" -not -name "index.md" -not -name "CLAUDE.md" | wc -l | tr -d ' ')

  # Check if documentation mentions correct agent count
  local incorrect_refs=$(grep -r "agents" --include="*.md" . 2>/dev/null | \
    grep -E "[0-9]+ agents" | \
    grep -v "$agent_count agents" || true)

  if [[ -n $incorrect_refs ]]; then
    log_warning "Found references to incorrect agent count:"
    echo "$incorrect_refs" | while IFS= read -r line; do
      log_warning "  $line"
      ((ISSUES_FOUND++)) || true
    done
  fi

  log_success "Cross-reference validation complete"
}

# Main execution
main() {
  log_info "=== Documentation Validation ==="
  log_info "Timestamp: $(date)"
  log_info ""

  # Clear previous reports
  rm -f "$REPORT_DIR"/*.txt

  # Run checks
  if [[ $CHECK_LINKS == true ]]; then
    validate_links
    echo ""
  fi

  if [[ $CHECK_EXAMPLES == true ]]; then
    validate_examples
    echo ""
  fi

  if [[ $CHECK_XREFS == true ]]; then
    validate_xrefs
    echo ""
  fi

  # Final summary
  log_info "=== Final Summary ==="
  log_info "  Files checked: $TOTAL_FILES"
  log_info "  Issues found: $ISSUES_FOUND"

  if [[ $ISSUES_FOUND -eq 0 ]]; then
    log_success ""
    log_success "✓ All documentation validation checks passed!"
    exit 0
  else
    log_error ""
    log_error "✗ Documentation validation found $ISSUES_FOUND issues"
    log_info "Reports saved to: $REPORT_DIR/"
    exit 1
  fi
}

# Run main
main