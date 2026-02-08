# ADVERSARIAL REVIEW: strategic-proposal

## CONTEXT

You are an expert prompt engineer performing an **ADVERSARIAL review** of LLM prompts for a Strategic Proposal assistant tool. This tool generates vendor evaluation proposals for executive decision-makers.

This tool uses a **3-phase LLM chain** plus **dual scoring systems**:
1. **Phase 1 (Claude)** - Generates initial proposal draft
2. **Phase 2 (Gemini)** - Reviews for completeness and rigor
3. **Phase 3 (Claude)** - Synthesizes final proposal
4. **LLM Scoring (prompts.js)** - Sends document to LLM for evaluation
5. **JavaScript Scoring (validator.js)** - Deterministic regex/pattern matching

---

## ⚠️ CRITICAL ALIGNMENT CHAIN

These 5 components **MUST be perfectly aligned**:

| Component | Purpose | Risk if Misaligned |
|-----------|---------|-------------------|
| phase1.md | Generates proposal | LLM produces sections validator doesn't detect |
| phase2.md | Reviews for rigor | Different criteria than scoring rubric |
| phase3.md | Final synthesis | Quality gate doesn't match validator |
| prompts.js | LLM scoring rubric | Scores dimensions validator doesn't check |
| validator.js | JavaScript scoring | Misses patterns prompts.js rewards |

---

## CURRENT TAXONOMY (4 dimensions, 100 pts total)

| Dimension | prompts.js | validator.js | Weight Description |
|-----------|------------|--------------|-------------------|
| Problem Statement | 25 pts | 25 pts | Problem definition, urgency, strategic alignment |
| Proposed Solution | 25 pts | 25 pts | Clear approach, actionable, rationale |
| Business Impact | 25 pts | 25 pts | Impact definition, quantified metrics, business value |
| Implementation Plan | 25 pts | 25 pts | Phased approach, timeline, resources |

---

## COMPONENT 1: phase1.md (Claude - Initial Draft)

See: `shared/prompts/phase1.md` (162 lines)

**Key Elements:**
- CRITICAL: Use ONLY provided information (no hallucination)
- Strategic Context: Why this evaluation matters now
- Pain Points: Specific issues with current vendor/situation
- Proposed Solutions: Map pain points to vendor capabilities
- Financial Impact Modeling: Conservative projections with hedge statement
- Pricing Proposal: Monthly pricing, concessions, comparison
- Style choice: Bullet-point vs Narrative

---

## COMPONENT 4: prompts.js (LLM Scoring Rubric)

See: `validator/js/prompts.js` (180 lines)

**Scoring Rubric:**

### 1. Problem Statement (25 points)
- Problem Definition (10 pts): Clear, specific with dedicated section
- Urgency (8 pts): Quantified urgency - why action needed NOW
- Strategic Alignment (7 pts): Tied to organizational goals

### 2. Proposed Solution (25 points)
- Clear Approach (10 pts): Well-defined with dedicated section
- Actionable (8 pts): Specific action verbs and next steps
- Rationale (7 pts): Justification for why this over alternatives

### 3. Business Impact (25 points)
- Impact Definition (10 pts): Clear outcomes and expected results
- Quantified Metrics (10 pts): Numbers, percentages, dollar amounts
- Business Value (5 pts): Financial, competitive, or efficiency impact

### 4. Implementation Plan (25 points)
- Phased Approach (10 pts): Clear phases, milestones, deliverables
- Timeline (8 pts): Specific dates, quarters, periods
- Resources (7 pts): Ownership, team, required resources

---

# YOUR ADVERSARIAL REVIEW TASK

## SPECIFIC QUESTIONS TO ANSWER

### 1. PAIN POINT TO SOLUTION MAPPING
Phase1.md requires mapping pain points to vendor capabilities. Does validator.js:
- ✅ Detect pain point sections?
- ✅ Detect solution mapping?

### 2. FINANCIAL IMPACT MODELING
Phase1.md requires conservative projections with hedge statement. Does validator.js:
- ✅ Detect financial projections?
- ✅ Detect hedge language ("Even if estimates are 50% high...")?

Look for: `ROI`, `gross profit`, `additional`, `conservative`, `hedge`

### 3. URGENCY DETECTION
prompts.js allocates 8 pts for urgency. Does validator.js detect:
- Budget timing?
- Contract renewal?
- Competitive pressure?

Look for: `urgent`, `now`, `immediate`, `deadline`, `expir`

### 4. PHASED APPROACH
prompts.js allocates 10 pts for phased approach. Does validator.js detect:
- Phase 1, Phase 2, Phase 3?
- Milestones?
- Deliverables?

### 5. WEASEL WORD DETECTION
prompts.js penalizes "should be able to", "might", "could potentially". Does validator.js detect?

### 6. SLOP DETECTION
Does validator.js import and apply slop penalties?

```bash
grep -n "getSlopPenalty\|calculateSlopScore\|slop" validator.js
```

---

## DELIVERABLES

### 1. CRITICAL FAILURES
For each issue: Issue, Severity, Evidence, Fix

### 2. ALIGNMENT TABLE
| Component | Dimension | Weight | Aligned? | Issue |

### 3. GAMING VULNERABILITIES
- Fake financial projections
- Generic pain points
- Missing hedge statements

### 4. RECOMMENDED FIXES (P0/P1/P2)

---

**VERIFY CLAIMS. Evidence before assertions.**

