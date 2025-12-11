# Genesis Troubleshooting Guide

Common issues when creating projects from Genesis templates and how to fix them.

---

## 🚨 Critical Issues (Reverse-Integration Findings)

**Source**: Power Statement Assistant project (2024-12-09)
**Status**: All 7 issues have been fixed in Genesis templates as of 2024-12-09

These were the most common issues that prevented generated apps from working immediately after generation. They have all been fixed in the templates, but this section documents them for reference and troubleshooting.

### Quick Validation

Run these scripts to validate your generated project:

```bash
# Check for unreplaced template placeholders (Issue #3)
./genesis/scripts/validate-template-placeholders.sh .

# Comprehensive test suite (all 7 issues)
./genesis/scripts/test-generated-project.sh .
```

### Issue #1: Storage Export Mismatch ✅ FIXED

**Symptom**: `TypeError: storage.saveProject is not a function`

**Cause**: Template used named export (`export const storage = new Storage()`) but imports expected default export (`import storage from './storage.js'`)

**Fix**: Changed to `export default new Storage()` in storage-template.js

### Issue #2: HTML Element ID Mismatch ✅ FIXED

**Symptom**: `Cannot read properties of null (reading 'appendChild')`

**Cause**: JavaScript referenced `app-container` but HTML used different ID

**Fix**: Standardized on `id="app-container"` throughout templates

### Issue #3: Unreplaced Template Placeholders ✅ VALIDATION ADDED

**Symptom**: App shows `{{PROJECT_NAME}}` or `{{DB_NAME}}` in UI or code

**Cause**: Template generation script didn't replace all variables

**Fix**: Created `validate-template-placeholders.sh` script that runs automatically

### Issue #4: Missing Workflow Functions ✅ FIXED

**Symptom**: `ReferenceError: getPhaseMetadata is not defined`

**Cause**: project-view.js expected standalone functions but workflow.js only had class methods

**Fix**: Added standalone exported functions to workflow-template.js:
- `getPhaseMetadata(phaseNumber)`
- `generatePromptForPhase(project, phaseNumber)`
- `exportFinalDocument(project)`

### Issue #5: PRD-Specific Naming ✅ FIXED

**Symptom**: Generated app references "PRD" instead of generic document type

**Cause**: Template used `exportFinalPRD` instead of generic name

**Fix**: Changed to `exportFinalDocument` and `export-document-btn` throughout

### Issue #6: Missing HTML Elements ✅ FIXED

**Symptom**: `Cannot read properties of null (reading 'classList')`

**Cause**: JavaScript referenced `loading-overlay` or `toast-container` but HTML didn't have them

**Fix**: Added both elements to index-template.html

### Issue #7: Missing Storage Methods ✅ FIXED

**Symptom**: `TypeError: storage.getPrompt is not a function`

**Cause**: app.js and other files called methods that didn't exist in Storage class

**Fix**: Added missing methods to storage-template.js:
- `getPrompt(phase)`
- `savePrompt(phase, content)`
- `getSetting(key)`
- `saveSetting(key, value)`
- `getStorageEstimate()` (alias for getStorageInfo)

---

## Table of Contents

1. [Critical Issues (Reverse-Integration Findings)](#-critical-issues-reverse-integration-findings)
2. [Module System Errors (require is not defined)](#module-system-errors-require-is-not-defined)
3. [Node.js Globals in Browser (process is not defined)](#nodejs-globals-in-browser-process-is-not-defined)
4. [Template Variables Not Replaced](#template-variables-not-replaced)
5. [Badges Show "Unknown"](#badges-show-unknown)
6. [GitHub Actions Workflow Fails](#github-actions-workflow-fails)
7. [npm install Fails](#npm-install-fails)
8. [Linting Errors](#linting-errors)
9. [Tests Fail](#tests-fail)
10. [Dark Mode Doesn't Work](#dark-mode-doesnt-work)
11. [GitHub Pages 404 Error](#github-pages-404-error)
12. [Missing Files](#missing-files)
13. [Deployment Script Fails](#deployment-script-fails)
14. [Event Listeners Not Working](#event-listeners-not-working)

---

## Module System Errors (require is not defined)

### Symptoms
- Browser console shows: `Uncaught ReferenceError: require is not defined`
- Browser console shows: `Uncaught ReferenceError: module is not defined`
- JavaScript files don't load in the browser
- App doesn't initialize

### Cause
JavaScript files are using CommonJS syntax (`require()`, `module.exports`) instead of ES6 modules (`import`, `export`). Browsers only support ES6 modules when using `<script type="module">`.

### Solution

**1. Run the module system validator**:
```bash
./scripts/validate-module-system.sh js/
```

**2. Replace CommonJS with ES6 modules**:

❌ **WRONG (CommonJS - doesn't work in browsers)**:
```javascript
// storage.js
const { showToast } = require('./ui.js');
module.exports = { storage };
```

✅ **CORRECT (ES6 modules - works in browsers)**:
```javascript
// storage.js
import { showToast } from './ui.js';
export const storage = new Storage();
```

**3. Common replacements**:

| CommonJS (❌ Wrong) | ES6 Modules (✅ Correct) |
|---------------------|--------------------------|
| `const { x } = require('./file.js')` | `import { x } from './file.js'` |
| `const x = require('./file.js')` | `import x from './file.js'` |
| `module.exports = { x }` | `export { x }` |
| `module.exports.x = ...` | `export const x = ...` |
| `exports.x = ...` | `export const x = ...` |

**4. Verify HTML uses `type="module"`**:
```html
<!-- ✅ CORRECT -->
<script type="module" src="js/app.js"></script>

<!-- ❌ WRONG -->
<script src="js/app.js"></script>
```

**5. Always include `.js` extension in imports**:
```javascript
// ✅ CORRECT
import { storage } from './storage.js';

// ❌ WRONG (works in Node.js, not browsers)
import { storage } from './storage';
```

### Prevention
- Use the Genesis templates (already use ES6 modules)
- Run `./scripts/validate-module-system.sh` before deployment
- Check browser console for errors during development

### Reference
- See: `REFERENCE-IMPLEMENTATIONS.md` (Module System section)
- See: `01-AI-INSTRUCTIONS.md` (Module System Validation section)

---

## Node.js Globals in Browser (process is not defined)

### Symptoms
- Browser console shows: `Uncaught ReferenceError: process is not defined`
- Browser console shows: `Uncaught ReferenceError: __dirname is not defined`
- Browser console shows: `Uncaught ReferenceError: __filename is not defined`
- Code works in Node.js but fails in browser

### Cause
JavaScript files are using Node.js-specific globals (`process`, `__dirname`, `__filename`, etc.) that don't exist in browsers. These globals are only available in Node.js environments.

### Solution

**1. Run the module system validator**:
```bash
./scripts/validate-module-system.sh js/
```

**2. Replace Node.js globals with browser-safe alternatives**:

#### Problem: process.env

❌ **WRONG (breaks in browser)**:
```javascript
const AI_MODE = process.env.AI_MODE || "mock";
const API_KEY = process.env.API_KEY;
```

✅ **CORRECT (works everywhere)**:
```javascript
// Helper function for environment variables
const getEnvVar = (key, defaultValue = null) => {
    // Check if running in Node.js
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    // Check if running in browser with window.AI_CONFIG
    if (typeof window !== 'undefined' && window.AI_CONFIG && window.AI_CONFIG[key]) {
        return window.AI_CONFIG[key];
    }
    // Fallback to default
    return defaultValue;
};

const AI_MODE = getEnvVar('AI_MODE', 'mock');
const API_KEY = getEnvVar('API_KEY');
```

#### Problem: __dirname and __filename

❌ **WRONG (breaks in browser)**:
```javascript
const configPath = path.join(__dirname, 'config.json');
const currentFile = __filename;
```

✅ **CORRECT (works in browsers)**:
```javascript
// Use import.meta.url for ES6 modules
const currentModuleUrl = import.meta.url;

// Or use relative paths directly
const configPath = './config.json';
```

#### Problem: Other Node.js globals

| Node.js Global | Browser Alternative |
|----------------|---------------------|
| `process.cwd()` | Use relative paths or `window.location` |
| `process.platform` | Use `navigator.platform` or `navigator.userAgent` |
| `Buffer` | Use `Uint8Array` or `TextEncoder/TextDecoder` |
| `global` | Use `window` or `globalThis` |
| `require.resolve()` | Use relative import paths |

**3. Configure environment in HTML (for browser deployments)**:

```html
<!-- index.html -->
<script>
    // Define browser-accessible config
    window.AI_CONFIG = {
        AI_MODE: 'mock',
        API_ENDPOINT: 'https://api.example.com',
        // Add other config here
    };
</script>
<script type="module" src="js/app.js"></script>
```

**4. Or use localStorage for persistent config**:

```javascript
// Set config
localStorage.setItem('AI_MODE', 'mock');

// Get config
const AI_MODE = localStorage.getItem('AI_MODE') || 'mock';
```

### Prevention
- Never use Node.js globals directly in browser code
- Always guard with `typeof process !== 'undefined'` checks
- Use browser-safe alternatives (window, localStorage, HTML data attributes)
- Run `./scripts/validate-module-system.sh` before deployment
- Test in actual browser, not just Node.js

### Reference
- See: `01-AI-INSTRUCTIONS.md` (STEP 4: Never Use Node.js Globals Directly)
- See: `templates/web-app/js/same-llm-adversarial-template.js` (getEnvVar pattern)

---

## Template Variables Not Replaced

### Symptoms
- Files contain `{{PROJECT_NAME}}` or other `{{VARIABLES}}`
- npm commands fail with syntax errors
- Linting shows errors in template syntax

### Cause
Forgot to replace template variables with actual values

### Solution

1. **Find all unreplaced variables**:
   ```bash
   grep -r "{{" . --exclude-dir=node_modules --exclude-dir=genesis
   ```

2. **Replace each variable**:
   - `{{PROJECT_NAME}}` → your project name (e.g., "my-app")
   - `{{PROJECT_TITLE}}` → your project title (e.g., "My App")
   - `{{PROJECT_DESCRIPTION}}` → your description
   - `{{GITHUB_USER}}` → your GitHub username
   - `{{GITHUB_REPO}}` → your repository name
   - `{{GITHUB_PAGES_URL}}` → https://USERNAME.github.io/REPO/
   - `{{HEADER_EMOJI}}` → emoji for header (e.g., "🚀")
   - `{{FAVICON_EMOJI}}` → emoji for favicon (e.g., "🚀")
   - `{{DEPLOY_FOLDER}}` → "." for root or "docs" for docs folder

3. **Verify all replaced**:
   ```bash
   grep -r "{{" . --exclude-dir=node_modules --exclude-dir=genesis
   # Should return NO results
   ```

---

## Badges Show "Unknown"

### Symptoms
- README badges show "unknown" or "no status"
- Clicking badge shows 404 error

### Cause
GitHub Actions workflow hasn't run yet, or workflow file is missing

### Solution

1. **Verify workflow file exists**:
   ```bash
   ls -la .github/workflows/ci.yml
   ```

2. **If missing, copy from template**:
   ```bash
   mkdir -p .github/workflows
   cp genesis/templates/github/workflows/ci-template.yml .github/workflows/ci.yml
   ```

3. **Replace {{DEPLOY_FOLDER}} in ci.yml**:
   ```bash
   # Change line 105: path: '{{DEPLOY_FOLDER}}'
   # To: path: '.'  (for root deployment)
   ```

4. **Push to GitHub to trigger workflow**:
   ```bash
   git add .github/workflows/ci.yml
   git commit -m "Add CI/CD workflow"
   git push
   ```

5. **Wait 2-3 minutes** for workflow to run

6. **Check Actions tab**: https://github.com/USERNAME/REPO/actions

---

## GitHub Actions Workflow Fails

### Symptoms
- Workflow shows red X in Actions tab
- Deployment doesn't happen automatically

### Common Causes & Solutions

#### Cause 1: GitHub Pages not configured correctly

**Solution**:
1. Go to: https://github.com/USERNAME/REPO/settings/pages
2. Source: **GitHub Actions** (NOT "Deploy from a branch")
3. Save

#### Cause 2: {{DEPLOY_FOLDER}} not replaced

**Solution**:
```bash
# Edit .github/workflows/ci.yml
# Line 105: path: '{{DEPLOY_FOLDER}}'
# Change to: path: '.'
```

#### Cause 3: Test job removed but coverage job still references it

**Solution**:
```bash
# Edit .github/workflows/ci.yml
# If you removed the test job (lines 32-56), also remove the coverage job (lines 58-85)
```

#### Cause 4: Missing CODECOV_TOKEN secret

**Solution**:
- Either remove the coverage job from ci.yml
- Or add CODECOV_TOKEN to repository secrets

---

## npm install Fails

### Symptoms
- `npm install` shows errors
- Dependencies don't install

### Cause
Template variables in package.json not replaced

### Solution

1. **Check package.json**:
   ```bash
   grep "{{" package.json
   ```

2. **Replace all variables**:
   - `{{PROJECT_NAME}}` → "my-app"
   - `{{PROJECT_DESCRIPTION}}` → "My app description"
   - `{{GITHUB_USER}}` → your username
   - `{{GITHUB_REPO}}` → your repo name
   - `{{GITHUB_PAGES_URL}}` → https://USERNAME.github.io/REPO/

3. **Try again**:
   ```bash
   npm install
   ```

---

## Linting Errors

### Symptoms
- `npm run lint` shows errors
- Pre-commit hook blocks commits

### Common Causes & Solutions

#### Cause 1: Template variables in JS files

**Solution**:
```bash
# Find all {{VARIABLES}} in JS files
grep -r "{{PROJECT_NAME}}" js/ tests/

# Replace with actual project name
```

#### Cause 2: Syntax errors in customized code

**Solution**:
```bash
# Run linter with auto-fix
npm run lint -- --fix

# Check remaining errors
npm run lint
```

---

## Tests Fail

### Symptoms
- `npm test` shows failures
- Coverage below threshold

### Common Causes & Solutions

#### Cause 1: Template variables in test files

**Solution**:
```bash
grep "{{PROJECT_NAME}}" tests/
# Replace all occurrences with actual project name
```

#### Cause 2: Tests not customized for your workflow

**Solution**:
```bash
# Edit tests/workflow.test.js
# Update test cases to match your actual workflow phases and form fields
```

#### Cause 3: Missing test dependencies

**Solution**:
```bash
npm install
```

---

## Dark Mode Doesn't Work

### Symptoms
- Dark mode toggle button doesn't change theme
- Theme stuck in light or dark mode

### Cause
Missing Tailwind dark mode configuration

### Solution

1. **Check index.html** (lines 10-18):
   ```html
   <script>
       tailwind.config = {
           darkMode: 'class'
       }
   </script>
   ```

2. **If missing, add after Tailwind CDN**:
   ```html
   <script src="https://cdn.tailwindcss.com"></script>
   <script>
       tailwind.config = {
           darkMode: 'class'
       }
   </script>
   ```

---

## GitHub Pages 404 Error

### Symptoms
- Site shows 404 Not Found
- https://USERNAME.github.io/REPO/ doesn't load

### Common Causes & Solutions

#### Cause 1: GitHub Pages not enabled

**Solution**:
1. Go to: https://github.com/USERNAME/REPO/settings/pages
2. Source: GitHub Actions
3. Save
4. Wait 2 minutes

#### Cause 2: index.html not in root

**Solution**:
```bash
ls -la index.html
# Should exist in root directory
```

#### Cause 3: Workflow hasn't run yet

**Solution**:
1. Go to: https://github.com/USERNAME/REPO/actions
2. Check if workflow ran successfully
3. If not, push a commit to trigger it

---

## Missing Files

### Symptoms
- Reference errors in console
- 404 errors for CSS/JS files
- Features don't work

### Solution

Run verification:
```bash
# Check critical files
ls -la .gitignore CLAUDE.md README.md package.json .eslintrc.json
ls -la .github/workflows/ci.yml
ls -la index.html css/styles.css .nojekyll
ls -la js/app.js js/workflow.js js/storage.js
ls -la tests/ai-mock.test.js prompts/phase1.md
ls -la scripts/deploy-web.sh scripts/install-hooks.sh
```

If any missing, copy from Genesis templates:
```bash
cp genesis/templates/PATH/TO/FILE-template DESTINATION
```

---

## Deployment Script Fails

### Symptoms
- `./scripts/deploy-web.sh` shows errors
- Deployment doesn't complete

### Common Causes & Solutions

#### Cause 1: Script not executable

**Solution**:
```bash
chmod +x scripts/*.sh scripts/lib/*.sh
```

#### Cause 2: Template variables not replaced

**Solution**:
```bash
grep "{{" scripts/deploy-web.sh
# Replace all variables with actual values
```

#### Cause 3: Linting or tests failing

**Solution**:
```bash
# Fix linting errors
npm run lint -- --fix

# Fix test failures
npm test

# Then try deployment again
./scripts/deploy-web.sh
```

---

## Still Having Issues?

1. **Check Genesis documentation**:
   - `genesis/START-HERE.md`
   - `genesis/CHECKLIST.md`
   - `genesis/TESTING-PROCEDURE.md`

2. **Compare with reference implementations**:
   - [one-pager](https://github.com/bordenet/one-pager)
   - [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)

3. **Run verification scripts**:
   ```bash
   ./genesis/scripts/verify-templates.sh
   ./genesis/scripts/test-genesis.sh
   ```

4. **Create an issue**: Document the problem with steps to reproduce

---

## Event Listeners Not Working

### Symptoms
- Buttons don't respond to clicks
- Dark mode toggle doesn't work
- Dropdowns don't open
- No errors in browser console
- Functions are defined but not executing

### Cause
Event listener functions are defined but never attached to DOM elements with `addEventListener()`.

### Solution

**1. Check if event listeners are attached**:

❌ **WRONG (function defined but not attached)**:
```javascript
// ui.js
export function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}
// Missing: addEventListener() call - button won't work!
```

✅ **CORRECT (function defined AND attached)**:
```javascript
// ui.js
export function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

// Attach listener immediately
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
```

**2. Verify DOM elements exist**:
```javascript
// Always check element exists before attaching
const button = document.getElementById('my-button');
if (button) {
    button.addEventListener('click', handleClick);
} else {
    console.warn('Button #my-button not found in DOM');
}
```

**3. Check timing (DOM must be loaded first)**:
```javascript
// ✅ CORRECT - Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// ❌ WRONG - Might run before DOM loads
setupEventListeners();
```

**4. Use browser DevTools to debug**:
```javascript
// Add console.log to verify function is called
function toggleTheme() {
    console.log('toggleTheme called');  // Debug line
    document.documentElement.classList.toggle('dark');
}
```

### Common Patterns

**Pattern 1: Centralized setup function**:
```javascript
// app.js
function setupGlobalEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', setupGlobalEventListeners);
```

**Pattern 2: Module-level attachment**:
```javascript
// ui.js
export function toggleTheme() { /* ... */ }

// Attach immediately (if DOM already loaded)
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
```

### Prevention
- Use Genesis templates (include proper event listener setup)
- Test all UI interactions in browser
- Check browser console for warnings
- Use `setupGlobalEventListeners()` pattern from templates

### Reference
- See: `templates/web-app/js/app-template.js` (lines 50-141)
- See: `REFERENCE-IMPLEMENTATIONS.md` (Event Listener section)

---

