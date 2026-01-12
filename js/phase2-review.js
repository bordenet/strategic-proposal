/**
 * Phase 2 Review Module
 * Generates adversarial reviews using same-LLM detection
 * @module phase2-review
 */

import { getAdversarialStrategy } from './same-llm-adversarial.js';

/**
 * Generate an adversarial review for Phase 2
 * @param {string} title - Proposal title
 * @param {string} context - Proposal context
 * @param {string} draft - Phase 1 draft
 * @param {string} [currentModel='Claude'] - Current LLM model
 * @returns {Promise<string>} Generated review
 */
async function generatePhase2Review(title, context, draft, currentModel = 'Claude') {
  const strategy = getAdversarialStrategy(currentModel);

  const critiques = [
    'Critical analysis: What are the hidden assumptions in this proposal?',
    'Risk assessment: What could go wrong with this recommendation?',
    'Evidence evaluation: Are the ROI projections adequately supported?',
    'Competitive analysis: Have alternatives been fairly considered?',
    'Decision-maker perspective: What objections might arise?',
    'Cost-benefit analysis: Is the value truly proportional to the investment?'
  ];

  const review = `
[ADVERSARIAL CRITIQUE - ${strategy}]

Proposal Being Reviewed: "${title}"

Context: ${context}

Draft Summary: ${draft?.substring(0, 500)}...

CRITICAL FEEDBACK:

${critiques.map((c, i) => `${i + 1}. ${c}`).join('\n')}

KEY CONCERNS:

1. Incomplete Information: The proposal may not account for [TBD] constraints.

2. Implementation Risk: Executing this recommendation will require [TBD] resources and commitment.

3. Alternative Approaches: Consider exploring these alternatives:
   - Option A: Phased rollout instead of full deployment
   - Option B: Pilot program at select locations
   - Option C: Hybrid approach with current vendor

4. Success Criteria: Success metrics should include:
   - Adoption rate targets
   - ROI validation milestones
   - Risk mitigation checkpoints

RECOMMENDATION:

Before proceeding, address the following:
- [ ] Validate all financial projections with actual data
- [ ] Document implementation timeline and dependencies
- [ ] Identify rollback/mitigation strategies
- [ ] Get stakeholder alignment on trade-offs

This adversarial review intentionally highlights potential weaknesses to ensure robust decision-making.
  `.trim();

  return review;
}

export { generatePhase2Review };

