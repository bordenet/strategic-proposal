# CLAUDE.md - Strategic Proposal Generator

## Project Overview

This is a **Genesis-bootstrapped project** for creating strategic sales proposals. Unlike standard Genesis projects, this tool:

1. **Accepts attachments** - Call logs, CRM data, conversation transcripts
2. **Supports working drafts** - Users can paste/edit an existing proposal draft
3. **Generates strategic proposals** - Not just structured documents, but persuasive sales materials

## Mandatory Workflow

**Every code change must follow this sequence:**

```
1. lint  →  2. test  →  3. proactively communicate what's left
```

- Run `npm run lint` before committing
- Run `npm test` to verify all tests pass
- Communicate any remaining work to the user

## Project Structure

```
strategic-proposal/
├── index.html              # Main web app
├── js/                     # JavaScript modules
│   ├── app.js              # Application entry point
│   ├── storage.js          # IndexedDB persistence
│   ├── workflow.js         # 3-phase workflow logic
│   ├── ui.js               # UI utilities
│   └── ...
├── css/                    # Stylesheets
├── prompts/                # LLM prompt templates
│   ├── phase1.md           # Initial draft generation
│   ├── phase2.md           # Adversarial review
│   └── phase3.md           # Final synthesis
├── templates/              # Document templates
├── tests/                  # Jest test files
├── DO_NOT_COMMIT/          # Sensitive sample docs (gitignored)
└── genesis/                # Template system (delete after setup)
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

