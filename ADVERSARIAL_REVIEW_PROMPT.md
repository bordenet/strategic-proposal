# Adversarial Review: Strategic Proposal Assistant

You are a meticulous QA engineer tasked with finding MISALIGNMENTS between 5 components that must be perfectly synchronized. Your job is to identify where these components contradict, diverge, or create scoring gaps.

## The 5-Component Chain

1. **phase1.md** - User-facing prompt that generates strategic proposal drafts
2. **phase2.md** - Adversarial review prompt (skeptical decision-maker perspective)
3. **phase3.md** - Synthesis prompt combining Phase 1 + Phase 2
4. **prompts.js** - LLM scoring rubric
5. **validator.js** - JavaScript heuristic scorer

## Your Mission

Find ALL misalignments across these categories:

### A. Dimension Weight Misalignments
- Do all components agree on the 4 dimensions and their weights?
  - Problem Statement: 25 pts
  - Proposed Solution: 25 pts
  - Business Impact: 25 pts
  - Implementation Plan: 25 pts

### B. Section Requirements Misalignments
- phase1.md defines specific sections (Strategic Context, Pain Points, Solutions, Financial Impact, Pricing, Conclusion)
- Does prompts.js mention the same sections?
- Does validator.js REQUIRED_SECTIONS array match?

### C. Terminology Inconsistencies
- Different names for the same concept across files
- Example: "Pain Points" vs "Problem Statement" vs "Current Situation"
- Example: "Financial Impact Modeling" vs "Business Impact" vs "ROI"

### D. Detection Pattern Gaps
- Things mentioned in phase1/2/3 that validator.js doesn't detect
- Things validator.js scores that prompts.js doesn't mention
- Scoring guidance in prompts.js without corresponding validator.js logic

### E. AI Slop Prevention Alignment
- phase1.md has extensive "Banned Vague Language" and "Banned Buzzwords" lists
- Does validator.js detect all these banned terms?
- Are penalty points consistent across components?

### F. Dealership Domain Patterns
- phase1.md is dealership-focused (gross profit per store, call conversion, etc.)
- Does validator.js have matching dealership-specific patterns?
- Does prompts.js mention dealership domain?

### G. Length Constraints
- phase1.md: 800-1000 words (2 pages)
- phase2.md: 800-1000 words (2 pages)
- phase3.md: 500-600 words (1.25 pages)
- Does validator.js enforce word count limits?

### H. Hedge Statement Requirement
- phase1.md requires: "Even if estimates are 50% high, ROI still exceeds..."
- Does validator.js detect hedge statements?
- Does prompts.js mention this requirement?

---

## COMPONENT 1: phase1.md (User-Facing Prompt)

Key requirements from phase1.md (162 lines):
- 6 main sections: Strategic Context, Pain Points, Solutions, Financial Impact, Pricing, Conclusion
- Style choice: Bullet-point OR Narrative
- Banned vague language: "improve", "enhance", "optimize", "significant ROI", "substantial savings", "better performance"
- Banned filler phrases: "It's important to note...", "In today's competitive market...", "At the end of the day..."
- Banned buzzwords: leverage, utilize, synergy, cutting-edge, game-changing, best-in-class, industry-leading, robust, seamless, comprehensive
- Financial Impact must include: Inbound call capture, Outbound connection rate, Accountability lift, "additional gross profit per store per month"
- Hedge statement required: "Even if estimates are 50% high..."
- Length: 800-1000 words max

---

## COMPONENT 2: phase2.md (Adversarial Review Prompt)

Key requirements from phase2.md (122 lines):
- Role: Skeptical decision-maker who controls budget
- 7 review areas: Financial Projections, Pain Point Validation, Solution Claims, Missing Information, Risk Analysis, Competitive Considerations, Timing/Urgency
- AI Slop Detection Checklist: Vague claims, filler phrases, buzzwords
- Output sections: Executive Summary, Strengths, Weaknesses, AI Slop Detected, Questions, Recommendation
- Length: 800-1000 words max

---

## COMPONENT 3: phase3.md (Synthesis Prompt)

Key requirements from phase3.md (119 lines):
- 5 synthesis tasks: Address criticisms, Strengthen projections, Fill gaps, Address risks, Maintain persuasion
- Zero Tolerance Patterns: vague metrics, filler phrases, buzzwords, hedges, superlatives
- Required Patterns: Specific dollar amounts, sensitivity analysis, baseline → target
- Output sections: Executive Summary, Current Situation, Proposed Solution, Financial Analysis, Risk Assessment, Pricing, Recommendation
- Length: 500-600 words max

---

## COMPONENT 4: prompts.js (LLM Scoring Prompt)

Scoring rubric from prompts.js (180 lines):
- Problem Statement (25 pts): Problem Definition 10, Urgency 8, Strategic Alignment 7
- Proposed Solution (25 pts): Clear Approach 10, Actionable 8, Rationale 7
- Business Impact (25 pts): Impact Definition 10, Quantified Metrics 10, Business Value 5
- Implementation Plan (25 pts): Phased Approach 10, Timeline 8, Resources 7

Calibration guidance mentions: vague qualifiers, weasel words, marketing fluff, specific timelines, quantified metrics

---

## COMPONENT 5: validator.js (JavaScript Scorer)

Key patterns from validator.js (578 lines):
- REQUIRED_SECTIONS: 7 sections (Problem, Solution, Impact, Implementation, Resources, Risks, Metrics)
- PROBLEM_PATTERNS: problemSection, problemLanguage, urgency, quantified, strategicAlignment
- SOLUTION_PATTERNS: solutionSection, solutionLanguage, actionable, alternatives, justification
- IMPACT_PATTERNS: impactSection, impactLanguage, quantified, financialTerms, competitiveTerms, dealershipImpact
- IMPLEMENTATION_PATTERNS: implementationSection, phaseLanguage, datePatterns, ownershipLanguage, resourceLanguage
- STAKEHOLDER_PATTERNS: Extended from business-justification adversarial review

Scoring functions:
- scoreProblemStatement(): 25 pts max (10 + 8 + 7)
- scoreProposedSolution(): 25 pts max (10 + 8 + 7)
- scoreBusinessImpact(): 25 pts max (10 + 10 + 5)
- scoreImplementationPlan(): 25 pts max (10 + 8 + 7)

---

## COMPONENT 6: Scoring_Methods.md (Reference Documentation)

Documents the scoring taxonomy (157 lines):
- 4 dimensions at 25 pts each
- Optional bonus dimensions: Risks (+5), Success Metrics (+5), Stakeholder Alignment (+5)
- Adversarial robustness patterns documented
- Calibration notes for urgency, alternatives, dealership domain

---

## YOUR TASK

Analyze all 6 components and produce a table of misalignments:

| Issue # | Component A | Component B | Misalignment Description | Severity (High/Med/Low) | Recommended Fix |
|---------|-------------|-------------|--------------------------|-------------------------|-----------------|
| 1 | phase1.md | validator.js | ... | ... | ... |

Focus on:
1. **Section name mismatches** - phase1.md sections vs validator.js REQUIRED_SECTIONS
2. **Missing patterns** - Banned terms in phase1.md not detected in validator.js
3. **Terminology drift** - Same concept, different names
4. **Penalty inconsistencies** - Different penalty amounts for same offense
5. **Word count enforcement** - phase1/2/3 have limits, does validator.js check?
6. **Hedge statement detection** - Required in phase1.md, detected in validator.js?
7. **Dealership domain gaps** - phase1.md is dealership-focused, is validator.js aligned?

**Be adversarial. Find every gap.**
