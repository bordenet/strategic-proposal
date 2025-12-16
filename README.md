# Strategic Proposal Generator

[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://bordenet.github.io/strategic-proposal/)
[![Dependabot](https://img.shields.io/badge/dependabot-enabled-025E8C?logo=dependabot)](https://github.com/bordenet/strategic-proposal/security/dependabot)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Generate compelling strategic proposals using AI-assisted adversarial review.

## Features

- **3-Phase Workflow**: Initial draft → Adversarial review → Final synthesis
- **100% Client-Side**: All data stored locally in your browser (IndexedDB)
- **Privacy-First**: No tracking, no analytics, no server communication
- **AI-Assisted**: Generates prompts for use with Claude and Gemini
- **Export/Import**: Backup and restore your proposals as JSON

## Quick Start

1. Open <https://bordenet.github.io/strategic-proposal/>
2. Click "New Proposal" and enter dealership information
3. Copy the generated prompt to Claude (Phase 1)
4. Paste the response and proceed through all 3 phases
5. Export your final proposal as Markdown

## Development

```bash
npm install
npm run lint
npm test
```

## Security Notice

This tool generates prompts for external AI services. For sensitive or proprietary data, use an internal AI tool (e.g., LibreGPT) instead of public services like Claude or Gemini.
