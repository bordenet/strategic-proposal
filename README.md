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

---

## Scoring Methodology

The validator scores strategic proposals on a 100-point scale across four dimensions. This scoring system enforces the principle that proposals must be actionable—vague recommendations without implementation paths receive low scores regardless of strategic insight.

### Scoring Taxonomy

| Category | Weight | Rationale |
|----------|--------|-----------|
| **Problem Statement** | 25 pts | Validates problem definition, urgency, and strategic alignment |
| **Proposed Solution** | 25 pts | Ensures clear approach with rationale for chosen path |
| **Business Impact** | 25 pts | Requires quantified outcomes and business value articulation |
| **Implementation Plan** | 25 pts | Enforces phased approach with timeline and resources |

### Why These Weights?

**Problem Statement (25 pts)** establishes the foundation for strategic proposals. Without clear problem framing, the proposal is a solution in search of a problem:
- **Problem definition** (10 pts): Clear, specific problem or opportunity with dedicated section
- **Urgency** (8 pts): Quantified urgency or timing—why action is needed now, not later
- **Strategic alignment** (7 pts): Problem tied to organizational strategic goals

**Proposed Solution (25 pts)** validates the recommended course of action:
- **Clear approach** (10 pts): Solution is well-defined with dedicated section
- **Actionable** (8 pts): Specific action verbs and clear next steps
- **Rationale** (7 pts): Justification for why this approach over alternatives

**Business Impact (25 pts)** ensures the proposal articulates value in terms approvers understand:
- **Impact definition** (10 pts): Clear outcomes and expected results
- **Quantified metrics** (10 pts): Specific numbers, percentages, dollar amounts
- **Business value** (5 pts): Financial, competitive, or efficiency impact articulated

**Implementation Plan (25 pts)** separates actionable proposals from wish lists:
- **Phased approach** (10 pts): Clear phases, milestones, and deliverables
- **Timeline** (8 pts): Specific dates, quarters, or periods
- **Resources** (7 pts): Ownership, team, and required resources defined

### Adversarial Robustness

The scoring system addresses common strategic proposal failures:

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| Vague problem statements | Problem definition requires specific, clear description |
| Missing urgency case | Urgency requires quantified timing rationale |
| Solution without alternatives considered | Rationale must justify "why this over alternatives" |
| Impact claims without numbers | Quantified metrics require specific values |
| No implementation timeline | Timeline requires specific dates or quarters |

### Calibration Notes

The **equal weighting** (25 pts each) reflects the interdependence of proposal components. A brilliant solution without implementation path fails equally to a detailed plan for the wrong problem. Each dimension is necessary; none is sufficient alone.

The **urgency requirement** (8 pts) addresses proposal timing. Strategic proposals often languish because they lack urgency framing. "This is a good idea" scores lower than "This is a good idea, and delaying 6 months costs us $500K in market opportunity."

The **phased approach** (10 pts) prevents "big bang" proposals. Research on initiative success shows that phased rollouts with clear milestones outperform all-at-once implementations. The validator rewards proposals that define Phase 1/Phase 2/Phase 3 with deliverables.

---

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

- [Acceptance Criteria Assistant](https://github.com/bordenet/acceptance-criteria-assistant)
- [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record)
- [Business Justification Assistant](https://github.com/bordenet/business-justification-assistant)
- [JD Assistant](https://github.com/bordenet/jd-assistant)
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
