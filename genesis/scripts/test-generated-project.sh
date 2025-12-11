#!/usr/bin/env bash
#
# test-generated-project.sh
#
# Comprehensive test for generated projects to ensure they work on first try.
# This prevents the 7 critical issues from the power-statement-assistant reverse-integration.
#
# Usage:
#   ./scripts/test-generated-project.sh <project-directory>
#
# Exit codes:
#   0 - All tests passed
#   1 - One or more tests failed
#   2 - Invalid usage

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directory to test
PROJECT_DIR="${1:-.}"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: Directory not found: $PROJECT_DIR${NC}"
    exit 2
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Genesis Generated Project Test Suite${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Testing project: $PROJECT_DIR"
echo ""

FAILED_TESTS=0
PASSED_TESTS=0

# Helper function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Helper function to run a test with output
run_test_with_output() {
    local test_name="$1"
    local test_command="$2"
    
    echo "Testing: $test_name..."
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo ""
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo ""
        return 1
    fi
}

cd "$PROJECT_DIR"

echo -e "${YELLOW}Issue #3: Template Placeholder Validation${NC}"
run_test_with_output "No unreplaced {{VARIABLES}}" \
    "! grep -r '{{[A-Z_][A-Z0-9_]*}}' --include='*.js' --include='*.html' --include='*.css' --exclude='*-template.*' --exclude='*.test.js' --exclude-dir=node_modules --exclude-dir=tests --exclude-dir=coverage ."

echo -e "${YELLOW}Issue #2: HTML Element Consistency${NC}"
run_test "Container ID exists in HTML" \
    "grep -q 'id=\"app-container\"' index.html || grep -q 'id=\"app-container\"' docs/index.html"
run_test "Loading overlay exists" \
    "grep -q 'id=\"loading-overlay\"' index.html || grep -q 'id=\"loading-overlay\"' docs/index.html"
run_test "Toast container exists" \
    "grep -q 'id=\"toast-container\"' index.html || grep -q 'id=\"toast-container\"' docs/index.html"

echo ""
echo -e "${YELLOW}Issue #1: Storage Export Consistency${NC}"
run_test "Storage uses default export" \
    "grep -q 'export default new Storage()' js/storage.js || grep -q 'export default new Storage()' docs/js/storage.js"
run_test "Storage imports use default import" \
    "grep -q \"import storage from './storage.js'\" js/*.js || grep -q \"import storage from './storage.js'\" docs/js/*.js"

echo ""
echo -e "${YELLOW}Issue #7: Storage Methods Exist${NC}"
if [ -f "js/storage.js" ] || [ -f "docs/js/storage.js" ]; then
    STORAGE_FILE=$([ -f "js/storage.js" ] && echo "js/storage.js" || echo "docs/js/storage.js")
    run_test "getPrompt method exists" "grep -q 'getPrompt' $STORAGE_FILE"
    run_test "savePrompt method exists" "grep -q 'savePrompt' $STORAGE_FILE"
    run_test "getSetting method exists" "grep -q 'getSetting' $STORAGE_FILE"
    run_test "saveSetting method exists" "grep -q 'saveSetting' $STORAGE_FILE"
    run_test "getStorageEstimate method exists" "grep -q 'getStorageEstimate' $STORAGE_FILE"
fi

echo ""
echo -e "${YELLOW}Issue #4: Workflow Functions Exist${NC}"
if [ -f "js/workflow.js" ] || [ -f "docs/js/workflow.js" ]; then
    WORKFLOW_FILE=$([ -f "js/workflow.js" ] && echo "js/workflow.js" || echo "docs/js/workflow.js")
    run_test "getPhaseMetadata function exists" "grep -q 'export function getPhaseMetadata' $WORKFLOW_FILE"
    run_test "generatePromptForPhase function exists" "grep -q 'export.*function generatePromptForPhase' $WORKFLOW_FILE"
    run_test "exportFinalDocument function exists" "grep -q 'export function exportFinalDocument' $WORKFLOW_FILE"
fi

echo ""
echo -e "${YELLOW}Issue #5: Generic Naming (No PRD-specific names)${NC}"
run_test "No exportFinalPRD references" \
    "! grep -r 'exportFinalPRD' --include='*.js' --exclude-dir=node_modules ."
run_test "No export-prd-btn references" \
    "! grep -r 'export-prd-btn' --include='*.js' --include='*.html' --exclude-dir=node_modules ."

echo ""
echo -e "${YELLOW}Issue #6: Event Handlers Wired Up${NC}"
if [ -f "js/project-view.js" ] || [ -f "docs/js/project-view.js" ]; then
    PROJECT_VIEW_FILE=$([ -f "js/project-view.js" ] && echo "js/project-view.js" || echo "docs/js/project-view.js")
    run_test "Export button has event handler" \
        "grep -q 'export-document-btn.*addEventListener\\|addEventListener.*export-document-btn' $PROJECT_VIEW_FILE"
fi

echo ""
echo -e "${YELLOW}Package and Dependencies${NC}"
if [ -f "package.json" ]; then
    run_test "package.json exists" "test -f package.json"
    run_test "package.json is valid JSON" "jq empty package.json 2>/dev/null || python3 -m json.tool package.json > /dev/null"
    run_test "package.json has name field" "grep -q '\"name\"' package.json"
    run_test "package.json has version field" "grep -q '\"version\"' package.json"
fi

echo ""
echo -e "${YELLOW}File Structure${NC}"
run_test "index.html exists" "test -f index.html || test -f docs/index.html"
run_test "JavaScript directory exists" "test -d js || test -d docs/js"
run_test "CSS directory exists" "test -d css || test -d docs/css"
run_test "README.md exists" "test -f README.md"

echo ""
echo -e "${YELLOW}JavaScript Module Imports${NC}"
if [ -d "js" ] || [ -d "docs/js" ]; then
    JS_DIR=$([ -d "js" ] && echo "js" || echo "docs/js")

    # Check that all imports can be resolved
    for js_file in "$JS_DIR"/*.js; do
        if [ -f "$js_file" ]; then
            filename=$(basename "$js_file")
            # Extract import statements and check if imported files exist
            while IFS= read -r import_line; do
                # Extract the path from import statement
                import_path=$(echo "$import_line" | sed -n "s/.*from ['\"]\\(.*\\)['\"].*/\\1/p")
                if [ -n "$import_path" ] && [[ "$import_path" == ./* ]]; then
                    # Resolve relative path
                    import_file="$JS_DIR/${import_path#./}"
                    run_test "Import resolves: $filename -> $import_path" "test -f $import_file"
                fi
            done < <(grep "^import.*from" "$js_file" || true)
        fi
    done
fi

echo ""
echo -e "${YELLOW}Linting (if available)${NC}"
if [ -f "package.json" ] && grep -q '"lint"' package.json; then
    if [ -d "node_modules" ]; then
        run_test_with_output "ESLint passes" "npm run lint"
    else
        echo -e "${YELLOW}⚠ Skipping lint (node_modules not installed)${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}Tests (if available)${NC}"
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    if [ -d "node_modules" ]; then
        run_test_with_output "Tests pass" "npm test"
    else
        echo -e "${YELLOW}⚠ Skipping tests (node_modules not installed)${NC}"
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Test Results${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ SUCCESS: All tests passed!${NC}"
    echo ""
    echo "This project is ready to deploy and should work on first try."
    exit 0
else
    echo -e "${RED}✗ FAILURE: $FAILED_TESTS test(s) failed${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    echo "See genesis/TROUBLESHOOTING.md for common fixes."
    exit 1
fi
