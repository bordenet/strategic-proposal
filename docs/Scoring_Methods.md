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

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/prompts.js` - LLM scoring prompt (aligned)
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)

