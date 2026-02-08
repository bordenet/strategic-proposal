/**
 * Strategic Proposal Validator - Scoring Logic
 *
 * Scoring Dimensions:
 * 1. Problem Statement (25 pts) - Clear problem definition
 * 2. Proposed Solution (25 pts) - Actionable solution
 * 3. Business Impact (25 pts) - Measurable outcomes
 * 4. Implementation Plan (25 pts) - Timeline and resources
 */

import { getSlopPenalty, calculateSlopScore } from './slop-detection.js';

// ============================================================================
// Constants
// ============================================================================

// ALIGNED WITH Phase1.md sections - expanded patterns for dealership domain
const REQUIRED_SECTIONS = [
  // Problem/Pain Points - matches Phase1 "Document Current Pain Points"
  { pattern: /^#+\s*(problem|challenge|issue|opportunity|context|pain.?point|current.?pain)/im, name: 'Problem Statement', weight: 2 },
  // Solution - matches Phase1 "Present Proposed Solutions"
  { pattern: /^#+\s*(solution|proposal|approach|recommendation|strategy)/im, name: 'Proposed Solution', weight: 2 },
  // Business Impact - matches Phase1 "Financial Impact Modeling"
  { pattern: /^#+\s*(impact|benefit|outcome|value|roi|return|financial.?impact|gross.?profit|revenue)/im, name: 'Business Impact', weight: 2 },
  // Implementation - matches Phase1 "Timeline" subsection
  { pattern: /^#+\s*(implementation|plan|timeline|roadmap|execution|next.?steps)/im, name: 'Implementation Plan', weight: 2 },
  // Resources/Pricing - matches Phase1 "Pricing Proposal"
  { pattern: /^#+\s*(resource|budget|cost|investment|team|pricing|price|subscription|commercials)/im, name: 'Resources/Budget', weight: 1 },
  // Risks - optional but scored
  { pattern: /^#+\s*(risk|assumption|dependency|constraint)/im, name: 'Risks/Assumptions', weight: 1 },
  // Success Metrics - optional but scored
  { pattern: /^#+\s*(success|metric|kpi|measure|objective)/im, name: 'Success Metrics', weight: 1 }
];

// Problem statement patterns
const PROBLEM_PATTERNS = {
  problemSection: /^#+\s*(problem|challenge|issue|opportunity|context|current.?state)/im,
  problemLanguage: /\b(problem|challenge|issue|opportunity|gap|limitation|constraint|blocker|barrier|pain.?point)\b/gi,
  urgency: /\b(urgent|critical|immediate|priority|time.sensitive|deadline|window|opportunity.cost)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction)/gi,
  strategicAlignment: /\b(strategic|mission|vision|objective|goal|priority|initiative|pillar)\b/gi
};

// Solution patterns
const SOLUTION_PATTERNS = {
  solutionSection: /^#+\s*(solution|proposal|approach|recommendation|strategy)/im,
  solutionLanguage: /\b(solution|approach|proposal|strategy|plan|initiative|program|project)\b/gi,
  actionable: /\b(implement|execute|deliver|launch|build|create|develop|establish|deploy|rollout)\b/gi,
  alternatives: /\b(alternative|option|approach|consider|evaluate|compare|trade.?off)\b/gi,
  justification: /\b(because|reason|rationale|why|justify|basis|evidence|data.shows|research)\b/gi
};

// Business impact patterns - DEALERSHIP DOMAIN AWARE
const IMPACT_PATTERNS = {
  impactSection: /^#+\s*(impact|benefit|outcome|value|roi|return|business.case|financial.?impact)/im,
  impactLanguage: /\b(impact|benefit|value|roi|return|outcome|result|improvement|gain|savings)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|revenue)/gi,
  financialTerms: /\b(revenue|cost|savings|profit|margin|efficiency|productivity|reduction|increase)\b/gi,
  competitiveTerms: /\b(competitive|market|position|advantage|differentiat|leader|first.mover)\b/gi,
  // Dealership-specific impact patterns from Phase1.md
  dealershipImpact: /\b(gross.?profit.*store|per.?store|per.?rooftop|call.?conversion|appointment.?rate|inbound.?call|outbound.?connection|missed.?opportunit|vendor.?switch)\b/gi
};

// Implementation patterns
const IMPLEMENTATION_PATTERNS = {
  implementationSection: /^#+\s*(implementation|plan|timeline|roadmap|execution|delivery)/im,
  phaseLanguage: /\b(phase|stage|milestone|sprint|iteration|wave|release|v\d+)\b/gi,
  datePatterns: /\b(week|month|quarter|q[1-4]|year|fy\d+|\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi,
  ownershipLanguage: /\b(owner|lead|responsible|accountable|team|department|function)\b/gi,
  resourceLanguage: /\b(resource|budget|cost|investment|headcount|fte|capacity)\b/gi
};

// Risk patterns
const RISK_PATTERNS = {
  riskSection: /^#+\s*(risk|assumption|dependency|constraint|challenge)/im,
  riskLanguage: /\b(risk|assumption|dependency|constraint|blocker|obstacle|challenge|unknown)\b/gi,
  mitigationLanguage: /\b(mitigat|contingency|fallback|plan.b|alternative|backup|workaround)\b/gi
};

// Success metrics patterns
const METRICS_PATTERNS = {
  metricsSection: /^#+\s*(success|metric|kpi|measure|measurement)/im,
  metricsLanguage: /\b(metric|kpi|measure|indicator|target|benchmark|baseline|track)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer)/gi,
  timebound: /\b(by|within|after|before|during|end.of|q[1-4]|fy\d+|month|quarter|year)\b/gi
};

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect problem statement in text
 * @param {string} text - Text to analyze
 * @returns {Object} Problem detection results
 */
export function detectProblemStatement(text) {
  const hasProblemSection = PROBLEM_PATTERNS.problemSection.test(text);
  const problemMatches = text.match(PROBLEM_PATTERNS.problemLanguage) || [];
  const urgencyMatches = text.match(PROBLEM_PATTERNS.urgency) || [];
  const quantifiedMatches = text.match(PROBLEM_PATTERNS.quantified) || [];
  const strategicMatches = text.match(PROBLEM_PATTERNS.strategicAlignment) || [];

  return {
    hasProblemSection,
    hasProblemLanguage: problemMatches.length > 0,
    hasUrgency: urgencyMatches.length > 0,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasStrategicAlignment: strategicMatches.length > 0,
    indicators: [
      hasProblemSection && 'Dedicated problem section',
      problemMatches.length > 0 && 'Problem framing language',
      urgencyMatches.length > 0 && 'Urgency/priority established',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      strategicMatches.length > 0 && 'Strategic alignment shown'
    ].filter(Boolean)
  };
}

/**
 * Detect urgency in text (replaces cost of inaction for strategic proposals)
 * @param {string} text - Text to analyze
 * @returns {Object} Urgency detection results
 */
export function detectUrgency(text) {
  const urgencyMatches = text.match(PROBLEM_PATTERNS.urgency) || [];
  const quantifiedMatches = text.match(PROBLEM_PATTERNS.quantified) || [];
  const hasUrgencySection = /^#+\s*(urgency|priority|why.now|timing|window)/im.test(text);

  return {
    hasUrgencyLanguage: urgencyMatches.length > 0,
    urgencyCount: urgencyMatches.length,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasUrgencySection,
    indicators: [
      urgencyMatches.length > 0 && `${urgencyMatches.length} urgency/priority references`,
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified values`,
      hasUrgencySection && 'Dedicated urgency/timing section'
    ].filter(Boolean)
  };
}

/**
 * Detect solution in text
 * @param {string} text - Text to analyze
 * @returns {Object} Solution detection results
 */
export function detectSolution(text) {
  const hasSolutionSection = SOLUTION_PATTERNS.solutionSection.test(text);
  const solutionMatches = text.match(SOLUTION_PATTERNS.solutionLanguage) || [];
  const actionableMatches = text.match(SOLUTION_PATTERNS.actionable) || [];
  const alternativesMatches = text.match(SOLUTION_PATTERNS.alternatives) || [];
  const justificationMatches = text.match(SOLUTION_PATTERNS.justification) || [];

  return {
    hasSolutionSection,
    hasSolutionLanguage: solutionMatches.length > 0,
    hasActionable: actionableMatches.length > 0,
    hasAlternatives: alternativesMatches.length > 0,
    hasJustification: justificationMatches.length > 0,
    indicators: [
      hasSolutionSection && 'Dedicated solution section',
      solutionMatches.length > 0 && 'Solution language present',
      actionableMatches.length > 0 && 'Actionable verbs used',
      alternativesMatches.length > 0 && 'Alternatives considered',
      justificationMatches.length > 0 && 'Rationale provided'
    ].filter(Boolean)
  };
}

/**
 * Detect business impact in text
 * @param {string} text - Text to analyze
 * @returns {Object} Business impact detection results
 */
export function detectBusinessImpact(text) {
  const hasImpactSection = IMPACT_PATTERNS.impactSection.test(text);
  const impactMatches = text.match(IMPACT_PATTERNS.impactLanguage) || [];
  const quantifiedMatches = text.match(IMPACT_PATTERNS.quantified) || [];
  const financialMatches = text.match(IMPACT_PATTERNS.financialTerms) || [];
  const competitiveMatches = text.match(IMPACT_PATTERNS.competitiveTerms) || [];

  return {
    hasImpactSection,
    hasImpactLanguage: impactMatches.length > 0,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasFinancialTerms: financialMatches.length > 0,
    hasCompetitiveTerms: competitiveMatches.length > 0,
    indicators: [
      hasImpactSection && 'Dedicated impact/value section',
      impactMatches.length > 0 && 'Impact language present',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      financialMatches.length > 0 && 'Financial terms used',
      competitiveMatches.length > 0 && 'Competitive advantage mentioned'
    ].filter(Boolean)
  };
}

/**
 * Detect implementation plan in text
 * @param {string} text - Text to analyze
 * @returns {Object} Implementation detection results
 */
export function detectImplementation(text) {
  const hasImplementationSection = IMPLEMENTATION_PATTERNS.implementationSection.test(text);
  const phaseMatches = text.match(IMPLEMENTATION_PATTERNS.phaseLanguage) || [];
  const dateMatches = text.match(IMPLEMENTATION_PATTERNS.datePatterns) || [];
  const ownerMatches = text.match(IMPLEMENTATION_PATTERNS.ownershipLanguage) || [];
  const resourceMatches = text.match(IMPLEMENTATION_PATTERNS.resourceLanguage) || [];

  return {
    hasImplementationSection,
    hasPhases: phaseMatches.length > 0,
    phaseCount: phaseMatches.length,
    hasTimeline: dateMatches.length > 0,
    dateCount: dateMatches.length,
    hasOwnership: ownerMatches.length > 0,
    hasResources: resourceMatches.length > 0,
    indicators: [
      hasImplementationSection && 'Dedicated implementation section',
      phaseMatches.length > 0 && `${phaseMatches.length} phases/milestones`,
      dateMatches.length > 0 && `${dateMatches.length} timeline references`,
      ownerMatches.length > 0 && 'Ownership defined',
      resourceMatches.length > 0 && 'Resources identified'
    ].filter(Boolean)
  };
}

/**
 * Detect risks in text
 * @param {string} text - Text to analyze
 * @returns {Object} Risk detection results
 */
export function detectRisks(text) {
  const hasRiskSection = RISK_PATTERNS.riskSection.test(text);
  const riskMatches = text.match(RISK_PATTERNS.riskLanguage) || [];
  const mitigationMatches = text.match(RISK_PATTERNS.mitigationLanguage) || [];

  return {
    hasRiskSection,
    hasRisks: riskMatches.length > 0,
    riskCount: riskMatches.length,
    hasMitigation: mitigationMatches.length > 0,
    mitigationCount: mitigationMatches.length,
    indicators: [
      hasRiskSection && 'Dedicated risk section',
      riskMatches.length > 0 && `${riskMatches.length} risks identified`,
      mitigationMatches.length > 0 && 'Mitigation strategies included'
    ].filter(Boolean)
  };
}

/**
 * Detect success metrics in text
 * @param {string} text - Text to analyze
 * @returns {Object} Success metrics detection results
 */
export function detectSuccessMetrics(text) {
  const hasMetricsSection = METRICS_PATTERNS.metricsSection.test(text);
  const metricsMatches = text.match(METRICS_PATTERNS.metricsLanguage) || [];
  const quantifiedMatches = text.match(METRICS_PATTERNS.quantified) || [];
  const timeboundMatches = text.match(METRICS_PATTERNS.timebound) || [];

  return {
    hasMetricsSection,
    hasMetrics: metricsMatches.length > 0,
    metricsCount: metricsMatches.length,
    hasQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasTimebound: timeboundMatches.length > 0,
    indicators: [
      hasMetricsSection && 'Dedicated metrics section',
      metricsMatches.length > 0 && `${metricsMatches.length} metric references`,
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      timeboundMatches.length > 0 && 'Time-bound targets specified'
    ].filter(Boolean)
  };
}

/**
 * Detect sections in text
 * @param {string} text - Text to analyze
 * @returns {Object} Sections found and missing
 */
export function detectSections(text) {
  const found = [];
  const missing = [];

  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(text)) {
      found.push({ name: section.name, weight: section.weight });
    } else {
      missing.push({ name: section.name, weight: section.weight });
    }
  }

  return { found, missing };
}

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Score problem statement (25 pts max)
 * @param {string} text - Strategic proposal content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreProblemStatement(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Problem statement exists and is specific (0-10 pts)
  const problemDetection = detectProblemStatement(text);
  if (problemDetection.hasProblemSection && problemDetection.hasProblemLanguage) {
    score += 10;
    strengths.push('Clear problem statement with dedicated section');
  } else if (problemDetection.hasProblemLanguage) {
    score += 5;
    issues.push('Problem mentioned but lacks dedicated section');
  } else {
    issues.push('Problem statement missing - define the specific challenge or opportunity');
  }

  // Urgency/priority established (0-8 pts)
  const urgencyDetection = detectUrgency(text);
  if (urgencyDetection.hasUrgencyLanguage && urgencyDetection.isQuantified) {
    score += 8;
    strengths.push('Urgency quantified with specific metrics');
  } else if (urgencyDetection.hasUrgencyLanguage) {
    score += 4;
    issues.push('Urgency mentioned but not quantified - add timeframes or costs');
  } else {
    issues.push('Missing urgency - explain why this needs action now');
  }

  // Strategic alignment shown (0-7 pts)
  if (problemDetection.hasStrategicAlignment) {
    score += 7;
    strengths.push('Problem tied to strategic objectives');
  } else {
    issues.push('Add strategic alignment - connect to organizational goals');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score proposed solution (25 pts max)
 * @param {string} text - Strategic proposal content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreProposedSolution(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Solution section with clear approach (0-10 pts)
  const solutionDetection = detectSolution(text);
  if (solutionDetection.hasSolutionSection && solutionDetection.hasSolutionLanguage) {
    score += 10;
    strengths.push('Clear solution with dedicated section');
  } else if (solutionDetection.hasSolutionLanguage) {
    score += 5;
    issues.push('Solution mentioned but lacks dedicated section');
  } else {
    issues.push('Solution section missing or unclear');
  }

  // Actionable with clear verbs (0-8 pts)
  if (solutionDetection.hasActionable) {
    score += 8;
    strengths.push('Solution is actionable with clear next steps');
  } else {
    issues.push('Add action verbs - specify what will be done');
  }

  // Rationale provided (0-7 pts)
  if (solutionDetection.hasJustification) {
    score += 7;
    strengths.push('Solution includes rationale/justification');
  } else {
    issues.push('Add rationale - explain why this approach');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score business impact (25 pts max)
 * @param {string} text - Strategic proposal content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreBusinessImpact(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Impact section with clear outcomes (0-10 pts)
  const impactDetection = detectBusinessImpact(text);
  if (impactDetection.hasImpactSection && impactDetection.hasImpactLanguage) {
    score += 10;
    strengths.push('Clear impact section with defined outcomes');
  } else if (impactDetection.hasImpactLanguage) {
    score += 5;
    issues.push('Impact mentioned but lacks dedicated section');
  } else {
    issues.push('Impact section missing - define expected outcomes');
  }

  // Quantified with specific metrics (0-10 pts)
  if (impactDetection.isQuantified && impactDetection.quantifiedCount >= 2) {
    score += 10;
    strengths.push('Impact quantified with multiple metrics');
  } else if (impactDetection.isQuantified) {
    score += 5;
    issues.push('Add more quantified metrics for impact');
  } else {
    issues.push('Quantify impact - add specific numbers, percentages, or dollar amounts');
  }

  // Financial or competitive terms (0-5 pts)
  if (impactDetection.hasFinancialTerms || impactDetection.hasCompetitiveTerms) {
    score += 5;
    strengths.push('Business value articulated (financial/competitive)');
  } else {
    issues.push('Add business value - revenue, cost, efficiency, or competitive impact');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score implementation plan (25 pts max)
 * @param {string} text - Strategic proposal content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreImplementationPlan(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Implementation section with phases (0-10 pts)
  const implDetection = detectImplementation(text);
  if (implDetection.hasImplementationSection && implDetection.hasPhases) {
    score += 10;
    strengths.push('Clear implementation plan with phases');
  } else if (implDetection.hasImplementationSection) {
    score += 5;
    issues.push('Implementation section exists but lacks clear phases');
  } else {
    issues.push('Add implementation plan - define phases and milestones');
  }

  // Timeline with dates (0-8 pts)
  if (implDetection.hasTimeline && implDetection.dateCount >= 2) {
    score += 8;
    strengths.push('Timeline includes specific dates/periods');
  } else if (implDetection.hasTimeline) {
    score += 4;
    issues.push('Add more timeline specificity');
  } else {
    issues.push('Add timeline - specify when activities will occur');
  }

  // Ownership and resources (0-7 pts)
  const riskDetection = detectRisks(text);
  if (implDetection.hasOwnership && implDetection.hasResources) {
    score += 7;
    strengths.push('Ownership and resources clearly defined');
  } else if (implDetection.hasOwnership || implDetection.hasResources) {
    score += 3;
    issues.push('Define both ownership and required resources');
  } else {
    issues.push('Add ownership and resources - who and what is needed');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a strategic proposal and return comprehensive scoring results
 * @param {string} text - Strategic proposal content
 * @returns {Object} Complete validation results
 */
export function validateStrategicProposal(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      problemStatement: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      proposedSolution: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      businessImpact: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      implementationPlan: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] }
    };
  }

  const problemStatement = scoreProblemStatement(text);
  const proposedSolution = scoreProposedSolution(text);
  const businessImpact = scoreBusinessImpact(text);
  const implementationPlan = scoreImplementationPlan(text);

  // AI slop detection
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  const totalScore = Math.max(0,
    problemStatement.score + proposedSolution.score + businessImpact.score + implementationPlan.score - slopDeduction
  );

  return {
    totalScore,
    problemStatement,
    proposedSolution,
    businessImpact,
    implementationPlan,
    // Dimension mappings for app.js compatibility
    dimension1: problemStatement,
    dimension2: proposedSolution,
    dimension3: businessImpact,
    dimension4: implementationPlan,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}

