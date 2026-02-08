# Strategic Proposal Scoring Methods

This document describes the scoring methodology used by the Strategic Proposal Validator.

## Overview

The validator scores strategic proposals on a **100-point scale** across four equally-weighted dimensions. Strategic proposals are executive-facing documents for organizational or business decisions, with optional dealership-domain awareness.

## Scoring Taxonomy

| Dimension | Points | What It Measures |
|-----------|--------|------------------|
| **Problem Statement** | 25 | Clear problem definition, urgency, quantification |
| **Proposed Solution** | 25 | Actionable solution, alternatives, justification |
| **Business Impact** | 25 | Measurable outcomes, ROI, competitive advantage |
| **Implementation Plan** | 25 | Timeline, ownership, resources |

## Dimension Details

### 1. Problem Statement (25 pts)

**Scoring Breakdown:**
- Dedicated problem section: 8 pts
- Problem framing language: 4 pts
- Urgency/priority established: 5 pts
- Quantified metrics (3+): 5 pts
- Strategic alignment shown: 3 pts

**Detection Patterns:**
```javascript
problemSection: /^#+\s*(problem|challenge|issue|opportunity|context|current.?state)/im
problemLanguage: /problem|challenge|issue|opportunity|gap|limitation|pain.?point/gi
urgency: /urgent|critical|immediate|priority|time.sensitive|deadline|window/gi
quantified: /\d+\s*(%|million|thousand|hour|day|\$|dollar|user|customer|transaction)/gi
strategicAlignment: /strategic|mission|vision|objective|goal|priority|initiative/gi
```

### 2. Proposed Solution (25 pts)

**Scoring Breakdown:**
- Solution section present: 8 pts
- Actionable language (implement, execute, deploy): 5 pts
- Alternatives considered: 6 pts
- Justification/rationale: 6 pts

**Detection Patterns:**
```javascript
solutionSection: /^#+\s*(solution|proposal|approach|recommendation|strategy)/im
actionable: /implement|execute|deliver|launch|build|create|develop|establish|deploy|rollout/gi
alternatives: /alternative|option|approach|consider|evaluate|compare|trade.?off/gi
justification: /because|reason|rationale|why|justify|basis|evidence|data.shows|research/gi
```

### 3. Business Impact (25 pts)

**Scoring Breakdown:**
- Impact section present: 6 pts
- Impact language: 4 pts
- Quantified benefits (3+): 8 pts
- Financial terms (ROI, revenue, cost): 4 pts
- Competitive advantage: 3 pts

**Domain-Specific Impact (dealership):**
```javascript
dealershipImpact: /gross.?profit.*store|per.?store|per.?rooftop|call.?conversion|appointment.?rate|inbound.?call|outbound.?connection|missed.?opportunit|vendor.?switch/gi
```

**Standard Impact Patterns:**
```javascript
impactLanguage: /impact|benefit|value|roi|return|outcome|result|improvement|gain|savings/gi
financialTerms: /revenue|cost|savings|profit|margin|efficiency|productivity|reduction|increase/gi
competitiveTerms: /competitive|market|position|advantage|differentiat|leader|first.mover/gi
```

### 4. Implementation Plan (25 pts)

**Scoring Breakdown:**
- Implementation section present: 6 pts
- Phases/milestones: 5 pts
- Dates/timeline: 5 pts
- Ownership defined: 5 pts
- Resources/budget: 4 pts

**Detection Patterns:**
```javascript
implementationSection: /^#+\s*(implementation|plan|timeline|roadmap|execution|delivery)/im
phaseLanguage: /phase|stage|milestone|sprint|iteration|wave|release|v\d+/gi
datePatterns: /week|month|quarter|q[1-4]|year|fy\d+|\d{4}|jan|feb|mar|apr/gi
ownershipLanguage: /owner|lead|responsible|accountable|team|department|function/gi
resourceLanguage: /resource|budget|cost|investment|headcount|fte|capacity/gi
```

## Optional Scoring Dimensions

### Risks/Assumptions (up to +5 bonus)
- Risk section present: +2 pts
- Mitigation strategies: +3 pts

```javascript
riskSection: /^#+\s*(risk|assumption|dependency|constraint|challenge)/im
mitigationLanguage: /mitigat|contingency|fallback|plan.b|alternative|backup|workaround/gi
```

### Success Metrics (up to +5 bonus)
- Metrics section present: +2 pts
- Time-bound targets: +3 pts

```javascript
metricsSection: /^#+\s*(success|metric|kpi|measure|measurement)/im
timebound: /by|within|after|before|during|end.of|q[1-4]|fy\d+|month|quarter|year/gi
```

### Stakeholder Alignment (up to +5 bonus)
Extended stakeholder patterns (from business-justification adversarial review):

```javascript
stakeholderConcerns: /finance|fp&a|hr|people.?team|legal|compliance|cfo|cto|ceo|vp|director|gm|general.?manager/gi
```

## Adversarial Robustness

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| "Big opportunity" without numbers | Quantified pattern requires actual metrics |
| "We recommend this approach" without alternatives | Alternatives section/language required |
| Vague timeline ("coming months") | Date patterns require specifics (Q2, March, etc.) |
| "Team will execute" without owners | Ownership language requires named roles |
| Missing stakeholder concerns | Extended patterns check for FP&A, legal, C-suite |

## Calibration Notes

### Urgency Must Be Quantified
"This is urgent" means nothing. "We lose $50K/month every month we delay" creates urgency.

### Alternatives Show Rigor
Every strategic proposal should show why the proposed solution beats alternatives. Missing this = missing executive due diligence.

### Dealership Domain Awareness
For dealership proposals, domain-specific patterns (gross profit per store, call conversion rates) signal domain expertise.

## Score Interpretation

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| 80-100 | A | Executive-ready - clear problem, quantified impact, actionable plan |
| 60-79 | B | Good - needs impact quantification or timeline specifics |
| 40-59 | C | Incomplete - missing alternatives or weak justification |
| 20-39 | D | Weak - restart with executive lens |
| 0-19 | F | Not a proposal - missing structure entirely |

## LLM Scoring

The validator uses a **dual-scoring architecture**: JavaScript pattern matching provides fast, deterministic scoring, while LLM evaluation adds semantic understanding. Both systems use aligned rubrics but may diverge on edge cases.

### Three LLM Prompts

| Prompt | Purpose | When Used |
|--------|---------|-----------|
| **Scoring Prompt** | Evaluate proposal against rubric, return dimension scores | Initial validation |
| **Critique Prompt** | Generate clarifying questions to improve weak areas | After scoring |
| **Rewrite Prompt** | Produce improved proposal targeting 85+ score | User-requested rewrite |

### LLM Scoring Rubric

The LLM uses the same 4-dimension rubric as JavaScript, with identical point allocations:

| Dimension | Points | LLM Focus |
|-----------|--------|-----------|
| Problem Statement | 25 | Clear problem definition, quantified urgency, strategic alignment |
| Proposed Solution | 25 | Actionable approach, alternatives considered, clear rationale |
| Business Impact | 25 | Quantified metrics (numbers, %, $), financial terms, competitive advantage |
| Implementation Plan | 25 | Phased approach with milestones, specific dates, ownership and resources |

### LLM Calibration Guidance

The LLM prompt includes explicit calibration signals:

**Reward signals:**
- Specific timelines, budgets, and resource allocations
- Quantified metrics and business impact
- Alternatives with trade-off analysis
- Named ownership for each phase

**Penalty signals:**
- Every vague qualifier without metrics
- Weasel words: "should be able to", "might", "could potentially"
- Marketing fluff: "best-in-class", "cutting-edge", "world-class"
- Missing required sections

**Calibration baseline:** "Be HARSH. Most proposals score 40-60. Only exceptional ones score 80+."

### LLM Critique Prompt

The critique prompt receives the current JS validation scores and generates improvement questions:

```
Score Summary: [totalScore]/100
- Problem Statement: [X]/25
- Proposed Solution: [X]/25
- Business Impact: [X]/25
- Implementation Plan: [X]/25
```

Output includes:
- Top 3 issues (specific gaps)
- 3-5 clarifying questions focused on weakest dimensions
- Quick wins (fixes that don't require user input)
- Focus areas: problem quantification, solution specificity, ROI metrics

### LLM Rewrite Prompt

The rewrite prompt targets an 85+ score with specific requirements:
- Concise and executive-focused
- All required sections (Problem, Solution, Impact, Implementation, Resources, Risks, Metrics)
- Clear urgency and strategic alignment
- Specific, quantified impact metrics (numbers, percentages, dollar amounts)
- Actionable solutions with clear rationale
- Defined ownership and required resources
- Realistic timeline with phases/milestones
- Identified risks with mitigation strategies
- SMART success metrics
- No vague qualifiers, weasel words, or marketing fluff

### JS vs LLM Score Divergence

| Scenario | JS Score | LLM Score | Explanation |
|----------|----------|-----------|-------------|
| Urgency words without quantification | Higher | Lower | LLM requires "$X/month lost" not just "urgent" |
| Alternatives listed without analysis | May pass | Lower | LLM evaluates trade-off depth |
| Implementation details overload | May score high | Lower | LLM values executive-level clarity |
| Domain-specific jargon (dealership) | Domain bonus | Variable | LLM may not recognize domain expertise |

### LLM-Specific Adversarial Notes

| Gaming Attempt | Why LLM Catches It |
|----------------|-------------------|
| "Big opportunity" without numbers | LLM requires quantified impact |
| Generic "We recommend this" | LLM demands alternatives analysis |
| Vague timeline ("coming months") | LLM requires specific dates (Q2, March) |
| "Team will execute" | LLM requires named roles/ownership |

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/prompts.js` - LLM scoring prompt (aligned)
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)

