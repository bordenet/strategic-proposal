/**
 * Inline Strategic Proposal Validator for Assistant UI
 * @module validator-inline
 *
 * Lightweight validation for inline scoring after Phase 3 completion.
 * Scoring Dimensions:
 * 1. Problem Statement (25 pts) - Clear problem definition
 * 2. Proposed Solution (25 pts) - Actionable solution
 * 3. Business Impact (25 pts) - Measurable outcomes
 * 4. Implementation Plan (25 pts) - Timeline and resources
 */

const PROBLEM_PATTERNS = {
  section: /^#+\s*(problem|challenge|issue|opportunity|context)/im,
  language: /\b(problem|challenge|issue|opportunity|gap|limitation|constraint|blocker|pain.?point)\b/gi,
  urgency: /\b(urgent|critical|immediate|priority|time.sensitive|deadline)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$)/gi
};

const SOLUTION_PATTERNS = {
  section: /^#+\s*(solution|proposal|approach|recommendation|strategy)/im,
  language: /\b(solution|approach|proposal|strategy|plan|initiative|program|project)\b/gi,
  actionable: /\b(implement|execute|deliver|launch|build|create|develop|establish|deploy)\b/gi
};

const IMPACT_PATTERNS = {
  section: /^#+\s*(impact|benefit|outcome|value|roi|return)/im,
  language: /\b(impact|benefit|value|roi|return|outcome|result|improvement|gain|savings)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|revenue)/gi,
  financial: /\b(revenue|cost|savings|profit|margin|efficiency|productivity)\b/gi
};

const IMPLEMENTATION_PATTERNS = {
  section: /^#+\s*(implementation|plan|timeline|roadmap|execution)/im,
  phases: /\b(phase|stage|milestone|sprint|iteration|wave|release)\b/gi,
  dates: /\b(week|month|quarter|q[1-4]|year|fy\d+|\d{4})\b/gi,
  resources: /\b(resource|budget|cost|investment|headcount|team)\b/gi
};

function scoreProblemStatement(text) {
  let score = 0;
  const issues = [];

  // Has problem section (8 pts)
  if (PROBLEM_PATTERNS.section.test(text)) score += 8;
  else issues.push('Add a Problem Statement section');

  // Problem language (8 pts)
  const problemMatches = (text.match(PROBLEM_PATTERNS.language) || []).length;
  if (problemMatches >= 3) score += 8;
  else if (problemMatches >= 1) { score += 4; issues.push('Define the problem more clearly'); }
  else issues.push('Clearly define the problem');

  // Quantified (5 pts)
  if (PROBLEM_PATTERNS.quantified.test(text)) score += 5;
  else issues.push('Quantify the problem impact');

  // Urgency (4 pts)
  if (PROBLEM_PATTERNS.urgency.test(text)) score += 4;
  else issues.push('Explain why this is urgent');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

function scoreProposedSolution(text) {
  let score = 0;
  const issues = [];

  // Has solution section (8 pts)
  if (SOLUTION_PATTERNS.section.test(text)) score += 8;
  else issues.push('Add a Proposed Solution section');

  // Solution language (8 pts)
  const solutionMatches = (text.match(SOLUTION_PATTERNS.language) || []).length;
  if (solutionMatches >= 3) score += 8;
  else if (solutionMatches >= 1) { score += 4; issues.push('Describe the solution more clearly'); }
  else issues.push('Describe the proposed solution');

  // Actionable (9 pts)
  const actionMatches = (text.match(SOLUTION_PATTERNS.actionable) || []).length;
  if (actionMatches >= 3) score += 9;
  else if (actionMatches >= 1) { score += 5; issues.push('Make the solution more actionable'); }
  else issues.push('Add actionable steps');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

function scoreBusinessImpact(text) {
  let score = 0;
  const issues = [];

  // Has impact section (7 pts)
  if (IMPACT_PATTERNS.section.test(text)) score += 7;
  else issues.push('Add a Business Impact section');

  // Impact language (6 pts)
  const impactMatches = (text.match(IMPACT_PATTERNS.language) || []).length;
  if (impactMatches >= 3) score += 6;
  else if (impactMatches >= 1) { score += 3; issues.push('Describe business impact more clearly'); }
  else issues.push('Describe the business impact');

  // Quantified impact (7 pts)
  if (IMPACT_PATTERNS.quantified.test(text)) score += 7;
  else issues.push('Quantify the expected impact');

  // Financial terms (5 pts)
  if (IMPACT_PATTERNS.financial.test(text)) score += 5;
  else issues.push('Include financial impact');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

function scoreImplementationPlan(text) {
  let score = 0;
  const issues = [];

  // Has implementation section (7 pts)
  if (IMPLEMENTATION_PATTERNS.section.test(text)) score += 7;
  else issues.push('Add an Implementation Plan section');

  // Phases/milestones (6 pts)
  const phaseMatches = (text.match(IMPLEMENTATION_PATTERNS.phases) || []).length;
  if (phaseMatches >= 2) score += 6;
  else if (phaseMatches >= 1) { score += 3; issues.push('Add more milestones'); }
  else issues.push('Define phases or milestones');

  // Timeline (6 pts)
  const dateMatches = (text.match(IMPLEMENTATION_PATTERNS.dates) || []).length;
  if (dateMatches >= 2) score += 6;
  else if (dateMatches >= 1) { score += 3; issues.push('Add more timeline details'); }
  else issues.push('Include a timeline');

  // Resources (6 pts)
  if (IMPLEMENTATION_PATTERNS.resources.test(text)) score += 6;
  else issues.push('Identify required resources');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

export function validateStrategicProposal(text) {
  if (!text || typeof text !== 'string' || text.trim().length < 50) {
    return {
      totalScore: 0,
      problemStatement: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      proposedSolution: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      businessImpact: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      implementationPlan: { score: 0, maxScore: 25, issues: ['No content to validate'] }
    };
  }

  const problemStatement = scoreProblemStatement(text);
  const proposedSolution = scoreProposedSolution(text);
  const businessImpact = scoreBusinessImpact(text);
  const implementationPlan = scoreImplementationPlan(text);

  return {
    totalScore: problemStatement.score + proposedSolution.score + businessImpact.score + implementationPlan.score,
    problemStatement, proposedSolution, businessImpact, implementationPlan
  };
}

export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}

