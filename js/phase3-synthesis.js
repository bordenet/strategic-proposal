/**
 * Phase 3 Synthesis Module
 * Synthesizes proposal with adversarial feedback into final document
 * @module phase3-synthesis
 */

/** @type {string} */
const PROPOSAL_TEMPLATE = `# Strategic Proposal: {{TITLE}}

## Executive Summary

{{SUMMARY}}

## Current Situation

**Dealership:** {{DEALERSHIP_NAME}}
**Location:** {{LOCATION}}
**Decision Maker:** {{DECISION_MAKER}}

### Identified Pain Points

{{PAIN_POINTS}}

## Proposed Solution

{{SOLUTION}}

## Financial Impact

{{FINANCIAL_IMPACT}}

### ROI Analysis

{{ROI_ANALYSIS}}

## Implementation Plan

### Timeline
{{TIMELINE}}

### Success Criteria
- [ ] Adoption targets met
- [ ] ROI validation at 90 days
- [ ] Team satisfaction benchmarks

## Risk Mitigation

As addressed in the adversarial review phase:

{{RISK_MITIGATION}}

## Pricing & Investment

{{PRICING}}

## Recommendation

{{RECOMMENDATION}}

---
*Last Updated: {{DATE}}*
`;

/**
 * Synthesize final proposal from project
 * @param {import('./types.js').Project} project - Project data
 * @returns {string} Synthesized proposal content
 */
function synthesizeProposal(project) {
  let proposal = PROPOSAL_TEMPLATE;

  // Replace placeholders with actual content
  proposal = proposal.replace('{{TITLE}}', project.title || 'Strategic Proposal');
  proposal = proposal.replace('{{DEALERSHIP_NAME}}', project.dealershipName || '[Dealership]');
  proposal = proposal.replace('{{LOCATION}}', project.dealershipLocation || '[Location]');
  proposal = proposal.replace('{{DECISION_MAKER}}', 
    `${project.decisionMakerName || '[Name]'} (${project.decisionMakerRole || '[Role]'})`);
  proposal = proposal.replace('{{SUMMARY}}', project.phase1_output?.substring(0, 500) || '[Summary not provided]');
  proposal = proposal.replace('{{PAIN_POINTS}}', project.painPoints || '[Pain points not documented]');
  proposal = proposal.replace('{{SOLUTION}}', '[Solution details from Phase 1]');
  proposal = proposal.replace('{{FINANCIAL_IMPACT}}', '[Financial projections from Phase 1]');
  proposal = proposal.replace('{{ROI_ANALYSIS}}', '[ROI analysis from synthesis]');
  proposal = proposal.replace('{{TIMELINE}}', '[Implementation timeline]');
  proposal = proposal.replace('{{RISK_MITIGATION}}', 
    project.phase2_output ? 'See adversarial review feedback for detailed risk analysis' : 'No risks documented');
  proposal = proposal.replace('{{PRICING}}', '[Pricing details]');
  proposal = proposal.replace('{{RECOMMENDATION}}', '[Final recommendation]');
  proposal = proposal.replace('{{DATE}}', new Date().toISOString().split('T')[0]);

  return proposal;
}

/**
 * Export proposal as markdown file
 * @param {string} proposal - Proposal content
 * @param {string} [filename='proposal.md'] - Output filename
 * @returns {void}
 */
function exportAsMarkdown(proposal, filename = 'proposal.md') {
  const attribution = '\n\n---\n\n*Generated with [Strategic Proposal Assistant](https://bordenet.github.io/strategic-proposal/)*';
  const content = proposal + attribution;
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export project as JSON file
 * @param {import('./types.js').Project} project - Project data
 * @returns {void}
 */
function exportAsJSON(project) {
  const data = {
    title: project.title,
    dealershipName: project.dealershipName,
    dealershipLocation: project.dealershipLocation,
    decisionMakerName: project.decisionMakerName,
    decisionMakerRole: project.decisionMakerRole,
    painPoints: project.painPoints,
    phase1_output: project.phase1_output,
    phase2_output: project.phase2_output,
    phase3_output: project.phase3_output,
    exportDate: new Date().toISOString()
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title || 'proposal'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export { synthesizeProposal, exportAsMarkdown, exportAsJSON };

