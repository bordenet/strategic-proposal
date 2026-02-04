# Strategic Proposal Assistant

Write strategic proposals with AI. Three phases: draft, review, refine.

[![Star this repo](https://img.shields.io/github/stars/bordenet/strategic-proposal?style=social)](https://github.com/bordenet/strategic-proposal)

**Try it**: [Assistant](https://bordenet.github.io/strategic-proposal/) · [Validator](https://bordenet.github.io/strategic-proposal/validator/)

> **What is a Strategic Proposal?** A strategic proposal presents a recommended course of action with supporting analysis. It defines the problem, evaluates options, recommends a solution, and outlines implementation. Used for budget requests, organizational changes, and major initiatives.

[![CI](https://github.com/bordenet/strategic-proposal/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/strategic-proposal/actions)
[![codecov](https://codecov.io/gh/bordenet/strategic-proposal/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/strategic-proposal)

---

## Quick Start

1. Open the [demo](https://bordenet.github.io/strategic-proposal/)
2. Enter proposal context, objectives, constraints
3. Copy prompt → paste into Claude → paste response back
4. Repeat for review (Gemini) and synthesis (Claude)
5. Export as Markdown

## What It Does

- **Draft → Review → Synthesize**: Claude writes, Gemini critiques, Claude refines
- **Browser storage**: Data stays in IndexedDB, nothing leaves your machine
- **No login**: Just open and use
- **Dark mode**: Toggle in the UI

## How the Phases Work

**Phase 1** — You describe the proposal. Claude drafts it.

**Phase 2** — Gemini reviews: What's the weakest argument? What's missing? What won't survive scrutiny?

**Phase 3** — Claude takes the draft plus critique and produces a final version.

## Usage

1. Open the app
2. Click "New Project", fill in your inputs
3. Copy each phase's prompt to the appropriate AI, paste responses back
4. Export when done

**Mock mode**: On localhost, toggle "AI Mock Mode" (bottom-right) to skip the copy/paste loop. Useful for testing.

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

Built with [Genesis](https://github.com/bordenet/genesis). Related tools:

- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Security

This tool generates prompts you copy to external AI services. Don't paste confidential data into public AI tools.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
