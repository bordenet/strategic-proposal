# AI Assistant Instructions for strategic-proposal

**Project Status**: Production-ready. Live at https://bordenet.github.io/strategic-proposal/

**📐 Design Patterns**: See [DESIGN-PATTERNS.md](./DESIGN-PATTERNS.md) for architecture and coding patterns used across all genesis-tools repos.

---

## ⚠️ CRITICAL: Fix ALL Linting Issues Immediately

**MANDATE**: When you detect ANY linting issue in a file you're working with, you MUST fix it immediately - regardless of whether it was pre-existing or newly introduced.

- Do NOT note that issues are "pre-existing" and move on
- Do NOT defer fixing to a later step
- Do NOT push code with known linting issues
- Fix ALL issues in the file before committing

**Rationale**: Linting issues indicate code quality problems. Ignoring them because they existed before your changes still means shipping low-quality code. Every touch point is an opportunity to improve the codebase.

---

## 🎯 Core Principles

### 0. **MANDATORY: Reference Known-Good Implementations FIRST**

**⚠️ BEFORE implementing ANY feature, reference these working examples:**

#### Primary References:
1. **[architecture-decision-record](https://github.com/bordenet/architecture-decision-record)** ⭐ **PRIMARY**
   - Canonical implementation for all genesis-tools
   - 3-phase workflow architecture
   - Form-to-prompt pattern
   - Deployment scripts

2. **[product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)** ⭐ **SECONDARY**
   - Dark mode toggle patterns
   - Setup scripts (fast, resumable, smart caching)

### 1. **MANDATORY: Manual Deployment After CI Passes**

**ALL deployments MUST follow this 3-step process:**

```bash
# Step 1: Push changes to GitHub
git add .
git commit -m "feat: description of changes"
git push origin main

# Step 2: WAIT for CI to pass
# Check: https://github.com/bordenet/strategic-proposal/actions
# ⚠️ DO NOT PROCEED until all checks are GREEN

# Step 3: Deploy ONLY after CI passes
./scripts/deploy-web.sh
```

**Why**:
- CI runs comprehensive quality gates (lint, test, coverage)
- Deploying before CI passes can ship broken code
- CI is the single source of truth for code quality

#### If CI Fails:
1. Fix the issues locally
2. Push fixes
3. Wait for CI to pass
4. THEN deploy

### 2. **ALWAYS Complete the Full Workflow**
When asked to do a task, you MUST:
1. ✅ Complete the work
2. ✅ Lint the code (`npm run lint` or `npm run lint:fix`)
3. ✅ Run tests (`npm test`)
4. ✅ Verify tests pass
5. ✅ **PROACTIVELY tell the user what's left**

---

## 🏗️ Project Structure

### Main Application
- `index.html` - Main application (3-phase workflow)
- `css/` - Styles (Tailwind + custom)
- `js/` - JavaScript modules (ES6)
- `tests/` - Jest unit tests

### Scripts
- **`scripts/setup-macos.sh`** - Install ALL dependencies
- **`scripts/deploy-web.sh`** - Deploy to GitHub Pages

### Configuration
- `package.json` - Dependencies and scripts
- `jest.config.js` - Test configuration
- `eslint.config.js` - Linting rules

---

## 🧪 Testing Standards

### Coverage Requirements
- **Target**: 40% minimum (statements, branches, functions, lines)

### Test Commands
```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage
npm run lint          # Run linter
npm run lint:fix      # Fix linting errors
```

---

## 🚫 What NOT to Do

### NEVER
- ❌ **Deploy using manual git commands** (ALWAYS use `./scripts/deploy-web.sh`)
- ❌ **Tell users to run `npm install`** (ALWAYS use setup scripts)
- ❌ Create files without linting them
- ❌ Create tests without running them
- ❌ Commit `node_modules/` or build artifacts

### ALWAYS
- ✅ **Use `./scripts/deploy-web.sh` for ALL deployments**
- ✅ **Use `./scripts/setup-macos.sh` for ALL setup instructions**
- ✅ Lint after creating/modifying code
- ✅ Run tests after creating/modifying tests
- ✅ Proactively communicate what's left

---

## 📐 Coding Standards

### JavaScript Style Guide
- Use ES6+ features (const/let, arrow functions, async/await)
- Single quotes for strings
- 2-space indentation
- Semicolons required
- JSDoc comments for all functions

### Testing Standards
- ≥40% code coverage
- Test all public functions
- Test error cases
- Use descriptive test names

---

## 📝 Communication Style

### Status Update Template
```
✅ Completed:
- [Specific action 1]
- [Specific action 2]

✅ Quality Checks:
- Linting: PASSED (0 errors)
- Tests: PASSED (149/149)

✅ What's Left:
- [Specific remaining task 1]
```

---

**Remember**: Match the user's high standards for professionalism and completeness.

