# Genesis Checklist

**Purpose**: Single consolidated checklist for AI assistants creating projects from Genesis templates.

> **Note**: This consolidates the former `00-AI-MUST-READ-FIRST.md`, `GENESIS-SUCCESS-CHECKLIST.md`, and `FIRST-RUN-CHECKLIST.md` into one document.

---

## 🚨 BEFORE YOU START

### Essential Reading (in order):
1. **[`docs/AI-QUICK-REFERENCE.md`](docs/AI-QUICK-REFERENCE.md)** - Cheat sheet (~130 lines)
2. **[`docs/ADVERSARIAL-WORKFLOW-PATTERN.md`](docs/ADVERSARIAL-WORKFLOW-PATTERN.md)** - The 7-step pattern
3. **[`docs/ANTI-PATTERNS.md`](docs/ANTI-PATTERNS.md)** - What NOT to do

### Reference Implementation:
Study https://github.com/bordenet/product-requirements-assistant - especially:
- `js/workflow.js` - Phase architecture
- `prompts/phase1.md` - Prompt template pattern
- `docs/index.html` lines 9-15 - Tailwind dark mode config

### Key Concepts:
| Concept | Summary |
|---------|---------|
| 7-Step Workflow | User Input → Prompt → Claude → Prompt → Gemini → Prompt → Claude |
| Apps generate PROMPTS | NOT AI responses - user copies to external AI |
| Template variables | `{project_name}`, `{phase1_output}`, `{phase2_output}` |
| Dark mode | Tailwind `darkMode: 'class'` + loadTheme() in head |
| Event handlers | Wire ALL buttons immediately after rendering |

---

## ✅ SUCCESS CRITERIA

A Genesis project is complete when:
- [ ] All tests pass with ≥70% coverage
- [ ] All linting passes with zero errors
- [ ] Pre-commit hooks installed and working
- [ ] GitHub Actions CI/CD passes
- [ ] Web app loads without console errors
- [ ] No template variables remain (`{{...}}`)
- [ ] `genesis/` directory deleted

---

## 📋 PHASE-BY-PHASE CHECKLIST

### Phase 1: Requirements
- [ ] Asked user for: project name, title, description, GitHub user/repo
- [ ] Asked user for: document type, peer site navigation, GitHub Pages architecture
- [ ] Did NOT ask questions answered by reference implementation

### Phase 2: Copy Templates
- [ ] Copied all core files (.gitignore, CLAUDE.md, README.md, package.json, etc.)
- [ ] Copied all web app files (index.html, js/*.js, css/*.css)
- [ ] Copied all test files (tests/*.test.js)
- [ ] Copied all prompt files (prompts/*.md)
- [ ] Copied all scripts (scripts/*.sh, scripts/lib/*.sh)
- [ ] Made all scripts executable: `chmod +x scripts/*.sh scripts/lib/*.sh`

### Phase 3: Variable Replacement
- [ ] Replaced ALL `{{VARIABLES}}` in all files
- [ ] Verified: `grep -r "{{" . --exclude-dir=node_modules --exclude-dir=genesis` returns nothing

### Phase 4: Install & Test
- [ ] Ran `npm install`
- [ ] Ran `./scripts/install-hooks.sh`
- [ ] Ran `npm run lint` - zero errors
- [ ] Ran `npm test` - all pass, ≥70% coverage

### Phase 5: Git & GitHub
- [ ] `git init && git add . && git commit -m "Initial commit from Genesis"`
- [ ] Created GitHub repo and pushed
- [ ] Enabled GitHub Pages (Settings → Pages → Branch: main)

### Phase 6: Cleanup
- [ ] `rm -rf genesis/`
- [ ] `git add . && git commit -m "Remove genesis template directory" && git push`

### Phase 7: Final Verification
- [ ] App works at `https://USER.github.io/REPO/`
- [ ] Deployment script works: `./scripts/deploy-web.sh`
- [ ] No `node_modules/` or `coverage/` in git
- [ ] Created `REVERSE-INTEGRATION-NOTES.md` documenting Genesis gaps

---

## 🚨 ADVERSARIAL WORKFLOW REQUIREMENTS

**Your app MUST implement all 7 steps:**
1. [ ] Gather input from user via form
2. [ ] Generate prompt for Claude with "ask questions" instruction
3. [ ] Collect markdown from Claude (user copies/pastes)
4. [ ] Generate adversarial prompt for Gemini with "critique + improve" instruction
5. [ ] Collect improved markdown from Gemini (user copies/pastes)
6. [ ] Generate synthesis prompt for Claude with BOTH previous drafts
7. [ ] Collect final synthesized document from Claude

**Verification:**
- [ ] App has "Copy Prompt" buttons (NOT "Generate with AI")
- [ ] Different AIs used: Phase 1 (Claude) → Phase 2 (Gemini) → Phase 3 (Claude)
- [ ] Each prompt includes previous phase outputs
- [ ] App stores user's pasted responses (doesn't generate them)

---

## 🚨 COMMON PITFALLS

| Pitfall | Prevention |
|---------|------------|
| Template variables not replaced | Run `grep -r "{{" .` before committing |
| Pre-commit hooks not installed | Run `./scripts/install-hooks.sh` after git init |
| Scripts not executable | Run `chmod +x scripts/*.sh scripts/lib/*.sh` |
| Low test coverage | Write tests alongside features |
| Console errors in web app | Test in browser before committing |
| .env file committed | Ensure `.env` in `.gitignore` BEFORE creating |
| Buttons without handlers | Wire `addEventListener()` immediately after render |

---

## 📝 HANDOFF TO USER

When complete, tell the user:
```
✅ Your project is ready!

📦 Repository: https://github.com/{user}/{repo}
🌐 Live App: https://{user}.github.io/{repo}/
📋 Next Steps: Review CLAUDE.md for development guidance
📊 Quality: All tests pass (X% coverage), linting clean, CI/CD configured

Use ./scripts/deploy-web.sh for future deployments.
```

---

## 🔄 REVERSE-INTEGRATION

Before finishing:
- [ ] Created `REVERSE-INTEGRATION-NOTES.md` documenting what Genesis is missing
- [ ] Counted references to product-requirements-assistant (if many → Genesis gap!)
- [ ] Told user: "📝 Created [N] reverse-integration notes for Genesis improvements"

