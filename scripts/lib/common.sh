#!/usr/bin/env bash
################################################################################
# Common Shell Script Library
################################################################################
# PURPOSE: Reusable functions for all Strategic Proposal Generator scripts
# USAGE: source "$(dirname "$0")/lib/common.sh"
################################################################################

# Prevent multiple sourcing
[[ -n "${COMMON_LIB_LOADED:-}" ]] && return 0
readonly COMMON_LIB_LOADED=1

################################################################################
# Repository Root Detection
################################################################################

if [[ -z "${REPO_ROOT:-}" ]]; then
    COMMON_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    REPO_ROOT="$(cd "${COMMON_LIB_DIR}/../.." && pwd)"
fi
readonly REPO_ROOT

################################################################################
# ANSI Color Codes
################################################################################

if [[ -t 1 ]]; then
    readonly COLOR_RED='\033[0;31m'
    readonly COLOR_GREEN='\033[0;32m'
    readonly COLOR_YELLOW='\033[1;33m'
    readonly COLOR_BLUE='\033[0;34m'
    readonly COLOR_BOLD='\033[1m'
    readonly COLOR_RESET='\033[0m'
    readonly ERASE_LINE='\033[2K'
else
    readonly COLOR_RED=''
    readonly COLOR_GREEN=''
    readonly COLOR_YELLOW=''
    readonly COLOR_BLUE=''
    readonly COLOR_BOLD=''
    readonly COLOR_RESET=''
    readonly ERASE_LINE=''
fi

################################################################################
# Logging Functions
################################################################################

VERBOSE=${VERBOSE:-false}

log_info() {
    [[ "$VERBOSE" != "true" ]] && return 0
    echo -e "${COLOR_BLUE}[INFO]${COLOR_RESET} $*"
}

log_success() {
    echo -e "${COLOR_GREEN}[✓]${COLOR_RESET} $*"
}

log_warning() {
    echo -e "${COLOR_YELLOW}[⚠]${COLOR_RESET} $*" >&2
}

log_error() {
    echo -e "${COLOR_RED}[✗]${COLOR_RESET} $*" >&2
}

log_step() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo ""
        echo -e "${COLOR_BOLD}▶${COLOR_RESET} $*"
        echo ""
    else
        echo -ne "\r${ERASE_LINE}▶ $*"
    fi
}

log_step_done() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${COLOR_GREEN}[✓]${COLOR_RESET} $*"
    else
        echo -e "\r${ERASE_LINE}▶ $*\t\t${COLOR_GREEN}[✓]${COLOR_RESET}"
    fi
}

log_header() {
    echo ""
    echo -e "${COLOR_BOLD}========================================${COLOR_RESET}"
    echo -e "${COLOR_BOLD}$*${COLOR_RESET}"
    echo -e "${COLOR_BOLD}========================================${COLOR_RESET}"
    echo ""
}

################################################################################
# Utility Functions
################################################################################

die() {
    log_error "$*"
    exit 1
}

require_command() {
    local cmd="$1"
    local install_hint="${2:-}"
    
    if ! command -v "$cmd" &> /dev/null; then
        log_error "Required command not found: $cmd"
        [[ -n "$install_hint" ]] && log_info "Install with: $install_hint"
        return 1
    fi
}

format_duration() {
    local seconds=$1
    local hours=$((seconds / 3600))
    local minutes=$(((seconds % 3600) / 60))
    local secs=$((seconds % 60))
    printf "%02d:%02d:%02d" "$hours" "$minutes" "$secs"
}

# Timer tracking
SECONDS=0

start_timer() {
    SECONDS=0
}

stop_timer() {
    : # Timer stops automatically
}

