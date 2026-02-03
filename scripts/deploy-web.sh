#!/usr/bin/env bash
################################################################################
# deploy-web.sh - Deploy Strategic Proposal Generator to GitHub Pages
#
# SYNOPSIS
#     ./scripts/deploy-web.sh [OPTIONS]
#
# DESCRIPTION
#     Deploys the web application to GitHub Pages with quality checks.
#
#     Steps performed:
#     1. Run linting (npm run lint)
#     2. Run tests (npm test)
#     3. Commit and push to GitHub
#     4. Verify GitHub Pages deployment
#     5. Display deployment URL
#
# OPTIONS
#     --skip-tests    Skip running tests (NOT RECOMMENDED)
#     --skip-lint     Skip linting (NOT RECOMMENDED)
#     -v, --verbose   Show detailed output
#     -h, --help      Display this help message
#
# EXAMPLES
#     # Standard deployment
#     ./scripts/deploy-web.sh
#
#     # Verbose mode
#     ./scripts/deploy-web.sh --verbose
#
################################################################################

set -euo pipefail

# Determine repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

# Source common library
source "${SCRIPT_DIR}/lib/common.sh"

# shellcheck source=lib/symlinks.sh
source "${SCRIPT_DIR}/lib/symlinks.sh"

################################################################################
# Configuration
################################################################################

PROJECT_NAME="Strategic Proposal Generator"
GITHUB_USER="bordenet"
GITHUB_REPO="strategic-proposal"
GITHUB_PAGES_URL="https://bordenet.github.io/strategic-proposal/"

SKIP_TESTS=false
SKIP_LINT=false

################################################################################
# Functions
################################################################################

show_help() {
    sed -n '2,/^$/p' "$0" | sed 's/^# \?//'
}

run_lint() {
    log_step "Running linting checks"

    if [[ "$SKIP_LINT" == "true" ]]; then
        log_warning "Skipping linting (--skip-lint flag)"
        return 0
    fi

    if [[ "${VERBOSE:-false}" == "true" ]]; then
        npm run lint || { log_error "Linting failed"; return 1; }
    else
        npm run lint >/dev/null 2>&1 || { log_error "Linting failed. Run 'npm run lint' to see errors."; return 1; }
    fi

    log_step_done "Linting passed"
}

run_tests() {
    log_step "Running tests"

    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_warning "Skipping tests (--skip-tests flag)"
        return 0
    fi

    if [[ "${VERBOSE:-false}" == "true" ]]; then
        npm test || { log_error "Tests failed"; return 1; }
    else
        npm test >/dev/null 2>&1 || { log_error "Tests failed. Run 'npm test' to see errors."; return 1; }
    fi

    log_step_done "Tests passed"
}

deploy_to_github() {
    log_step "Deploying to GitHub"

    if git diff --quiet && git diff --cached --quiet; then
        log_info "No changes to commit"
    else
        git add . >/dev/null 2>&1
        local commit_msg="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
        git commit -m "$commit_msg" >/dev/null 2>&1 || true
    fi

    if [[ "${VERBOSE:-false}" == "true" ]]; then
        git push origin main || { log_error "Failed to push to GitHub"; return 1; }
    else
        git push origin main >/dev/null 2>&1 || { log_error "Failed to push to GitHub"; return 1; }
    fi

    log_step_done "Pushed to GitHub"
}

verify_deployment() {
    log_step "Verifying GitHub Pages deployment"
    
    log_info "Waiting for GitHub Pages to update..."
    sleep 10
    
    if curl -s -o /dev/null -w "%{http_code}" "$GITHUB_PAGES_URL" | grep -q "200"; then
        log_step_done "Deployment verified"
    else
        log_warning "Site may still be deploying. Check manually in a few minutes."
    fi
}

################################################################################
# Main
################################################################################

main() {
    log_header "Deploying $PROJECT_NAME to GitHub Pages"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests) SKIP_TESTS=true; shift ;;
            --skip-lint) SKIP_LINT=true; shift ;;
            -v|--verbose) export VERBOSE=true; shift ;;
            -h|--help) show_help; exit 0 ;;
            *) log_error "Unknown option: $1"; show_help; exit 1 ;;
        esac
    done

    start_timer
    run_lint || exit 1
    run_tests || exit 1

    # Replace symlinks with real files for GitHub Pages
    replace_symlinks_with_real_files || exit 1

    # Deploy (with trap to restore symlinks on failure)
    trap 'restore_symlinks' EXIT
    deploy_to_github || exit 1

    # Restore symlinks for local development
    restore_symlinks
    trap - EXIT

    verify_deployment
    stop_timer

    echo ""
    log_success "Deployment complete!"
    echo ""
    echo "  📦 Project: $PROJECT_NAME"
    echo "  🔗 URL: $GITHUB_PAGES_URL"
    echo "  ⏱️  Total time: $(format_duration $SECONDS)"
    echo ""
    log_info "Note: GitHub Pages may take 1-2 minutes to fully update."
    echo ""
}

main "$@"

