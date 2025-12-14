# CLAUDE.md - Strategic Proposal Generator

## Project Overview

A tool for creating strategic sales proposals using AI-assisted adversarial review.

**Key Features:**

- **Accepts attachments** - Call logs, CRM data, conversation transcripts
- **Supports working drafts** - Users can paste/edit an existing proposal draft
- **Generates strategic proposals** - Persuasive sales materials, not just structured documents

## Mandatory Workflow

**Every code change must follow this sequence:**

```text
1. lint  →  2. test  →  3. proactively communicate what's left
```

- Run `npm run lint` before committing
- **ALWAYS fix lint warnings immediately** - no exceptions, fix in the same commit
- Run `npm test` to verify all tests pass
- Communicate any remaining work to the user

## Project Structure

```text
strategic-proposal/
├── index.html              # Main web app
├── js/                     # JavaScript modules
│   ├── app.js              # Application entry point
│   ├── storage.js          # IndexedDB persistence
│   ├── workflow.js         # 3-phase workflow logic
│   ├── ui.js               # UI utilities
│   ├── views.js            # View rendering
│   ├── projects.js         # Project CRUD operations
│   ├── project-view.js     # Project detail view
│   └── router.js           # Client-side routing
├── css/                    # Stylesheets
├── prompts/                # LLM prompt templates
│   ├── phase1.md           # Initial draft generation
│   ├── phase2.md           # Adversarial review
│   └── phase3.md           # Final synthesis
├── tests/                  # Vitest test files
├── scripts/                # Deployment and utility scripts
└── DO_NOT_COMMIT/          # Sensitive sample docs (gitignored)
```

## Key Differentiators

### Input Types

- **Dealership Info**: Name, location, store count, current vendor
- **Conversation Data**: Pasted call transcripts, meeting notes
- **Attachments**: PDF uploads (converted to text)
- **Working Draft**: Existing proposal draft to refine

### 3-Phase Adversarial Workflow

1. **Phase 1 (Claude)**: Generate initial proposal from inputs
2. **Phase 2 (Gemini)**: Critique as a shrewd decision-maker
3. **Phase 3 (Claude)**: Synthesize final compelling proposal

## Quality Standards

- 85% code coverage minimum
- All tests must pass
- No TODO/FIXME comments in production code
- Professional, factual language (no hyperbole)
