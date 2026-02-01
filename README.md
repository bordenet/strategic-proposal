# Strategic Proposal Assistant

Generate compelling strategic proposals using a three-phase AI workflow.

**Live Demo**: [bordenet.github.io/strategic-proposal](https://bordenet.github.io/strategic-proposal/)

[![CI](https://github.com/bordenet/strategic-proposal/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/strategic-proposal/actions)
[![codecov](https://codecov.io/gh/bordenet/strategic-proposal/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/strategic-proposal)
[![Linting: ESLint](https://img.shields.io/badge/linting-ESLint-4B32C3)](https://eslint.org/)
[![Code Style: ESLint](https://img.shields.io/badge/code%20style-ESLint-4B32C3)](https://eslint.org/)
[![Dependabot](https://img.shields.io/badge/dependabot-enabled-025E8C?logo=dependabot)](https://github.com/bordenet/strategic-proposal/security/dependabot)

---

## Quick Start

1. Visit the [live demo](https://bordenet.github.io/strategic-proposal/)
2. Fill in your proposal context, objectives, and constraints
3. Copy the generated prompt and paste into Claude
4. Paste the AI response back, then proceed through review and synthesis phases
5. Export your completed proposal as Markdown

## Features

- **Three-Phase AI Workflow**: Initial draft → Adversarial review → Synthesis
- **Privacy-First**: All data stored locally in your browser (IndexedDB)
- **No Account Required**: Works immediately, no signup needed
- **Export to Markdown**: Download your completed proposal
- **Dark Mode**: Toggle between light and dark themes
- **Project Management**: Create, save, and manage multiple proposals

## Workflow

### Phase 1: Initial Draft
Enter your proposal context, objectives, and constraints. Copy the generated prompt to Claude to create an initial strategic proposal draft.

### Phase 2: Adversarial Review
The initial draft is critically reviewed by Gemini to identify gaps, weaknesses, missing considerations, and areas for improvement.

### Phase 3: Synthesis
Claude synthesizes the initial draft with the adversarial feedback to produce a final, balanced strategic proposal.

## Usage

1. **Open the application** - Visit the [live demo](https://bordenet.github.io/strategic-proposal/) or run locally
2. **Create a new project** - Click "New Project" and fill in proposal context, objectives, and constraints
3. **Phase 1: Initial Draft** - Copy the generated prompt to Claude, paste the response back
4. **Phase 2: Adversarial Review** - Copy the Phase 2 prompt to Gemini, paste the review back
5. **Phase 3: Synthesis** - Copy the Phase 3 prompt to Claude for final synthesis
6. **Export** - Download your completed proposal as Markdown

### AI Mock Mode

For testing without an AI:
1. Enable "AI Mock Mode" toggle (bottom-right, localhost only)
2. Mock responses are generated automatically
3. No need to copy/paste to real AI

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/bordenet/strategic-proposal.git
cd strategic-proposal
npm install
```

### Testing

```bash
npm test        # Run all tests
npm run lint    # Run linting
npm run lint:fix # Fix lint issues
```

### Local Development

```bash
npm run serve   # Start local server at http://localhost:8000
```

## Project Structure

```
strategic-proposal/
├── js/                    # JavaScript modules
│   ├── app.js            # Main application entry
│   ├── workflow.js       # Phase orchestration
│   ├── storage.js        # IndexedDB operations
│   └── ...
├── tests/                 # Jest test files
├── prompts/              # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
└── index.html            # Main HTML file
```

## Part of Genesis Tools

This project is generated and maintained using [Genesis](https://github.com/bordenet/genesis), ensuring consistency across all document-generation tools:

- [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record)
- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal) ← You are here

## Security Notice

This tool generates prompts for external AI services. For sensitive or proprietary data, use an internal AI tool instead of public services like Claude or Gemini.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
