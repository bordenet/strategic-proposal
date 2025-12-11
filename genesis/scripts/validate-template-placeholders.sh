#!/usr/bin/env bash
#
# validate-template-placeholders.sh
# 
# Validates that all template placeholders have been replaced in generated projects.
# This prevents Issue #3 from the power-statement-assistant reverse-integration notes.
#
# Usage:
#   ./scripts/validate-template-placeholders.sh [directory]
#
# Exit codes:
#   0 - No unreplaced placeholders found
#   1 - Unreplaced placeholders found
#   2 - Invalid usage

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default directory to scan
SCAN_DIR="${1:-.}"

# Directories and files to exclude from scanning
# These are template/documentation directories that SHOULD contain {{VARIABLES}}
EXCLUDE_DIRS=(
    "node_modules"
    ".git"
    "coverage"
    "genesis/templates"
    "genesis/examples"
    "genesis/docs"
    "genesis/validation"
    "docs/plans"
    "docs/testing"
)

EXCLUDE_FILES=(
    "*.test.js"
    "*.test-template.js"
    "*-template.*"
    "validate-template-placeholders.sh"
    "REVERSE-INTEGRATION-NOTES.md"
    "REVERSE-INTEGRATION-NOTES-template.md"
    "SESSION-CHECKPOINT.md"
    "CLAUDE.md.template"
    # Genesis documentation files that explain how to use templates
    "START-HERE.md"
    "00-*.md"
    "01-*.md"
    "02-*.md"
    "03-*.md"
    "04-*.md"
    "*-GUIDE.md"
    "*-CHECKLIST.md"
    "*-PROCEDURE.md"
    "TROUBLESHOOTING.md"
    "CHANGELOG.md"
    "REFERENCE-IMPLEMENTATIONS.md"
)

# Special case: if scanning from genesis repo root, exclude genesis/ directory
if [[ "$SCAN_DIR" == "." ]] && [[ -d "genesis" ]]; then
    EXCLUDE_DIRS+=("genesis")
fi

echo "🔍 Scanning for unreplaced template placeholders in: $SCAN_DIR"
echo ""

# Find all files with {{VARIABLE}} patterns
# Exclude template files, node_modules, .git, etc.
FOUND_ISSUES=0
ISSUE_FILES=()

# Helper function to check if path should be excluded
should_exclude() {
    local path="$1"

    # Check directory exclusions
    for dir in "${EXCLUDE_DIRS[@]}"; do
        if [[ "$path" == *"$dir"* ]]; then
            return 0  # true - should exclude
        fi
    done

    # Check file pattern exclusions
    local filename=$(basename "$path")
    for pattern in "${EXCLUDE_FILES[@]}"; do
        # Convert glob pattern to regex
        if [[ "$filename" == $pattern ]]; then
            return 0  # true - should exclude
        fi
    done

    return 1  # false - should not exclude
}

while IFS= read -r -d '' file; do
    # Skip if file should be excluded
    if should_exclude "$file"; then
        continue
    fi
    
    # Check if file contains {{VARIABLE}} patterns
    if grep -q '{{[A-Z_][A-Z0-9_]*}}' "$file" 2>/dev/null; then
        FOUND_ISSUES=$((FOUND_ISSUES + 1))
        ISSUE_FILES+=("$file")
        
        echo -e "${RED}✗${NC} Found unreplaced placeholders in: ${YELLOW}$file${NC}"
        
        # Show the specific lines with placeholders
        grep -n '{{[A-Z_][A-Z0-9_]*}}' "$file" | while IFS= read -r line; do
            echo "    $line"
        done
        echo ""
    fi
done < <(find "$SCAN_DIR" -type f \( -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.md" -o -name "*.json" \) -print0)

# Report results
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FOUND_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ SUCCESS${NC}: No unreplaced template placeholders found!"
    echo ""
    exit 0
else
    echo -e "${RED}✗ FAILURE${NC}: Found unreplaced placeholders in $FOUND_ISSUES file(s)"
    echo ""
    echo "Files with issues:"
    for file in "${ISSUE_FILES[@]}"; do
        echo "  - $file"
    done
    echo ""
    echo "Common placeholders that should be replaced:"
    echo "  {{PROJECT_NAME}}, {{PROJECT_TITLE}}, {{DB_NAME}}, {{STORE_NAME}}"
    echo "  {{DOCUMENT_TYPE}}, {{PHASE_COUNT}}, {{PROJECT_DESCRIPTION}}"
    echo ""
    echo "This usually means the template generation script didn't complete successfully."
    echo "Please check the generation logs and re-run the generation process."
    echo ""
    exit 1
fi

