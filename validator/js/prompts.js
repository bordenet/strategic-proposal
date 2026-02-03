/**
 * Prompt generation for LLM-based Strategic Proposal scoring
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} proposalContent - The strategic proposal content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(proposalContent) {
  return `You are an expert Strategy Consultant evaluating a Strategic Proposal document.

Score this Strategic Proposal using the following rubric (0-100 points total):

## SCORING RUBRIC

### 1. Problem Statement (25 points)
- **Problem Definition (10 pts)**: Clear, specific problem or opportunity with dedicated section
- **Urgency (8 pts)**: Quantified urgency or timing - why action is needed now
- **Strategic Alignment (7 pts)**: Problem tied to organizational strategic goals

### 2. Proposed Solution (25 points)
- **Clear Approach (10 pts)**: Solution is well-defined with dedicated section
- **Actionable (8 pts)**: Specific action verbs and clear next steps
- **Rationale (7 pts)**: Justification for why this approach over alternatives

### 3. Business Impact (25 points)
- **Impact Definition (10 pts)**: Clear outcomes and expected results
- **Quantified Metrics (10 pts)**: Specific numbers, percentages, dollar amounts
- **Business Value (5 pts)**: Financial, competitive, or efficiency impact articulated

### 4. Implementation Plan (25 points)
- **Phased Approach (10 pts)**: Clear phases, milestones, and deliverables
- **Timeline (8 pts)**: Specific dates, quarters, or periods
- **Resources (7 pts)**: Ownership, team, and required resources defined

## CALIBRATION GUIDANCE
- Be HARSH. Most proposals score 40-60. Only exceptional ones score 80+.
- A score of 70+ means ready for executive decision-making.
- Strategic proposals should be concise and action-oriented.
- Deduct points for EVERY vague qualifier without metrics.
- Deduct points for weasel words ("should be able to", "might", "could potentially").
- Deduct points for marketing fluff ("best-in-class", "cutting-edge", "world-class").
- Reward specific timelines, budgets, and resource allocations.
- Reward quantified metrics and business impact.
- Deduct points for missing required sections.

## STRATEGIC PROPOSAL TO EVALUATE

\`\`\`
${proposalContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/100**

### Problem Statement: [X]/25
[2-3 sentence justification]

### Proposed Solution: [X]/25
[2-3 sentence justification]

### Business Impact: [X]/25
[2-3 sentence justification]

### Implementation Plan: [X]/25
[2-3 sentence justification]

### Top 3 Issues
1. [Most critical issue]
2. [Second issue]
3. [Third issue]

### Top 3 Strengths
1. [Strongest aspect]
2. [Second strength]
3. [Third strength]`;
}

/**
 * Generate critique prompt for detailed feedback
 * @param {string} proposalContent - The strategic proposal content to critique
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for critique
 */
export function generateCritiquePrompt(proposalContent, currentResult) {
  const issuesList = [
    ...(currentResult.problemStatement?.issues || []),
    ...(currentResult.proposedSolution?.issues || []),
    ...(currentResult.businessImpact?.issues || []),
    ...(currentResult.implementationPlan?.issues || [])
  ].slice(0, 5).map(i => `- ${i}`).join('\n');

  return `You are a senior Strategy Consultant providing detailed feedback on a Strategic Proposal.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- Problem Statement: ${currentResult.problemStatement?.score || 0}/25
- Proposed Solution: ${currentResult.proposedSolution?.score || 0}/25
- Business Impact: ${currentResult.businessImpact?.score || 0}/25
- Implementation Plan: ${currentResult.implementationPlan?.score || 0}/25

Key issues detected:
${issuesList || '- None detected by automated scan'}

## STRATEGIC PROPOSAL TO CRITIQUE

\`\`\`
${proposalContent}
\`\`\`

## YOUR TASK

Provide:
1. **Executive Summary** (2-3 sentences on overall proposal quality)
2. **Detailed Critique** by dimension:
   - What works well
   - What needs improvement
   - Specific suggestions with examples
3. **Revised Proposal** - A complete rewrite addressing all issues

Be specific. Show exact rewrites. Make it ready for executive decision-making.`;
}

/**
 * Generate rewrite prompt
 * @param {string} proposalContent - The strategic proposal content to rewrite
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(proposalContent, currentResult) {
  return `You are a senior Strategy Consultant rewriting a Strategic Proposal to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.totalScore}/100

## ORIGINAL STRATEGIC PROPOSAL

\`\`\`
${proposalContent}
\`\`\`

## REWRITE REQUIREMENTS

Create a complete, polished Strategic Proposal that:
1. Is concise and executive-focused
2. Has all required sections (Problem, Solution, Impact, Implementation, Resources, Risks, Metrics)
3. Includes clear urgency and strategic alignment
4. Has specific, quantified impact metrics (numbers, percentages, dollar amounts)
5. Provides actionable solutions with clear rationale
6. Defines ownership and required resources
7. Provides realistic timeline with phases/milestones
8. Identifies risks with mitigation strategies
9. Avoids vague qualifiers, weasel words, and marketing fluff
10. Includes SMART success metrics

Output ONLY the rewritten Strategic Proposal in markdown format. No commentary.`;
}

/**
 * Clean AI response to extract markdown content
 * @param {string} response - Raw AI response
 * @returns {string} Cleaned markdown content
 */
export function cleanAIResponse(response) {
  // Remove common prefixes
  let cleaned = response.replace(/^(Here's|Here is|I've|I have|Below is)[^:]*:\s*/i, '');
  
  // Extract content from markdown code blocks if present
  const codeBlockMatch = cleaned.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }
  
  return cleaned.trim();
}

