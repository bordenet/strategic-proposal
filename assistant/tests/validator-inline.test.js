/**
 * Tests for validator-inline.js - Strategic Proposal
 *
 * Comprehensive tests for all scoring functions:
 * - Problem Statement (25 pts)
 * - Proposed Solution (25 pts)
 * - Business Impact (25 pts)
 * - Implementation Plan (25 pts)
 */

import {
  validateDocument,
  getScoreColor,
  getScoreLabel,
  scoreProblemStatement,
  scoreProposedSolution,
  scoreBusinessImpact,
  scoreImplementationPlan,
  detectProblemStatement,
  detectUrgency,
  detectSolution,
  detectBusinessImpact,
  detectImplementation,
  detectRisks,
  detectSuccessMetrics
} from '../../shared/js/validator-inline.js';

describe('Inline Strategic Proposal Validator', () => {
  describe('validateDocument', () => {
    test('should return zero scores for empty content', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
      expect(result.problemStatement.score).toBe(0);
      expect(result.proposedSolution.score).toBe(0);
      expect(result.businessImpact.score).toBe(0);
      expect(result.implementationPlan.score).toBe(0);
    });

    test('should return zero scores for short content', () => {
      const result = validateDocument('Too short');
      expect(result.totalScore).toBe(0);
    });

    test('should return zero scores for null', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });

    test('should score a well-structured strategic proposal', () => {
      const goodProposal = `
# Problem Statement
Our operations team spends 500+ hours monthly on manual data entry.
This critical issue costs $50,000 annually and creates urgent bottlenecks.
The problem has been escalating for 6 months.

# Proposed Solution
We will implement an automated data pipeline to execute our strategy.
This approach will build a system to deliver measurable improvements.

# Business Impact
Expected ROI of 300% with $150,000 annual revenue improvement.
Cost savings of $50,000 and productivity gains of 40%.

# Implementation Plan
Phase 1 (Q1 2024): Initial deployment
Phase 2 (Q2 2024): Full rollout
Budget required: $25,000
Team: 2 engineers for 3 months
      `.repeat(2);
      const result = validateDocument(goodProposal);
      expect(result.totalScore).toBeGreaterThan(50);
      expect(result.problemStatement.score).toBeGreaterThan(10);
      expect(result.proposedSolution.score).toBeGreaterThan(10);
      expect(result.businessImpact.score).toBeGreaterThan(10);
      expect(result.implementationPlan.score).toBeGreaterThan(10);
    });

    test('should return issues for poor quality content', () => {
      const poorProposal = 'This is just a short paragraph without proper sections or structure.'.repeat(10);
      const result = validateDocument(poorProposal);
      // Issues are returned inside each dimension, not at top level
      const totalIssues = [
        ...result.problemStatement.issues,
        ...result.proposedSolution.issues,
        ...result.businessImpact.issues,
        ...result.implementationPlan.issues
      ];
      expect(totalIssues.length).toBeGreaterThan(0);
    });
  });

  describe('getScoreColor', () => {
    test('should return green for high scores', () => {
      const color = getScoreColor(85);
      expect(color).toMatch(/green|#[0-9a-fA-F]{3,6}/);
    });

    test('should return yellow/orange for medium scores', () => {
      const color = getScoreColor(55);
      expect(color).toBeDefined();
    });

    test('should return red for low scores', () => {
      const color = getScoreColor(25);
      expect(color).toMatch(/red|#[0-9a-fA-F]{3,6}/);
    });
  });

  describe('getScoreLabel', () => {
    test('should return positive label for high scores', () => {
      const label = getScoreLabel(85);
      expect(label.toLowerCase()).toMatch(/excellent|good|great|strong/);
    });

    test('should return label for medium scores', () => {
      const label = getScoreLabel(55);
      expect(label).toBeDefined();
      expect(label.length).toBeGreaterThan(0);
    });

    test('should return improvement label for low scores', () => {
      const label = getScoreLabel(25);
      expect(label).toBeDefined();
    });
  });

  describe('branch coverage', () => {
    test('should score partial problem language', () => {
      const content = `
# Problem Statement
There is a challenge we need to address.
This is a long enough document to pass validation.
`.repeat(5);
      const result = validateDocument(content);
      expect(result.problemStatement.score).toBeGreaterThan(0);
    });

    test('should score partial solution language', () => {
      const content = `
# Proposed Solution
We will implement a new approach.
This is a long enough document to pass validation.
`.repeat(5);
      const result = validateDocument(content);
      expect(result.proposedSolution.score).toBeGreaterThan(0);
    });

    test('should score partial action items', () => {
      const content = `
# Proposed Solution
We will build a system to address this.
This is a long enough document to pass validation.
`.repeat(5);
      const result = validateDocument(content);
      expect(result.proposedSolution.score).toBeGreaterThan(0);
    });

    test('should score partial impact language', () => {
      const content = `
# Business Impact
This will improve our operations.
This is a long enough document to pass validation.
`.repeat(5);
      const result = validateDocument(content);
      expect(result.businessImpact.score).toBeGreaterThan(0);
    });

    test('should score partial timeline', () => {
      const content = `
# Implementation Plan
Phase 1 will begin next month.
This is a long enough document to pass validation.
`.repeat(5);
      const result = validateDocument(content);
      expect(result.implementationPlan.score).toBeGreaterThan(0);
    });

    test('should score partial resources', () => {
      const content = `
# Implementation Plan
We need a team of engineers.
This is a long enough document to pass validation.
`.repeat(5);
      const result = validateDocument(content);
      expect(result.implementationPlan.score).toBeGreaterThan(0);
    });

    test('should score single actionable item in solution', () => {
      const content = `
# Proposed Solution
We will build a new system.
This is a long enough document to pass validation.
`.repeat(5);
      const result = validateDocument(content);
      expect(result.proposedSolution.score).toBeGreaterThan(0);
    });

    test('should score single phase in implementation', () => {
      const content = `
# Implementation Plan
Phase 1: Initial setup
This is a long enough document to pass validation.
`.repeat(5);
      const result = validateDocument(content);
      expect(result.implementationPlan.score).toBeGreaterThan(0);
    });

    test('should score single date in implementation', () => {
      const content = `
# Implementation Plan
Starting Q1 2024
This is a long enough document to pass validation.
`.repeat(5);
      const result = validateDocument(content);
      expect(result.implementationPlan.score).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Scoring Function Tests
// ============================================================================

describe('scoreProblemStatement', () => {
  test('should detect problem section', () => {
    const content = `
# Problem Statement
Our team faces significant challenges with current workflow.
`.repeat(3);
    const result = scoreProblemStatement(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should detect urgency language', () => {
    const content = `
# Problem
This is a critical issue that requires urgent attention.
The situation has been escalating for months.
`.repeat(2);
    const result = scoreProblemStatement(content);
    expect(result.score).toBeGreaterThan(5);
  });

  test('should return issues for missing problem', () => {
    const content = `
# Solution
We will implement a new system.
`.repeat(3);
    const result = scoreProblemStatement(content);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

describe('scoreProposedSolution', () => {
  test('should detect solution section', () => {
    const content = `
# Proposed Solution
We will implement an automated system to address this.
`.repeat(3);
    const result = scoreProposedSolution(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should detect action items', () => {
    const content = `
# Solution
We will build a new platform.
We will implement automation.
We will deliver measurable improvements.
`.repeat(2);
    const result = scoreProposedSolution(content);
    expect(result.score).toBeGreaterThan(5);
  });

  test('should return issues for missing solution', () => {
    const content = `
# Problem
There is a problem.
`.repeat(3);
    const result = scoreProposedSolution(content);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

describe('scoreBusinessImpact', () => {
  test('should detect business impact section', () => {
    const content = `
# Business Impact
This will improve our revenue by 25%.
`.repeat(3);
    const result = scoreBusinessImpact(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should detect ROI and financial metrics', () => {
    const content = `
# Impact
Expected ROI of 300%.
Cost savings of $100,000 annually.
Revenue improvement of 40%.
`.repeat(2);
    const result = scoreBusinessImpact(content);
    expect(result.score).toBeGreaterThan(5);
  });

  test('should return issues for missing impact', () => {
    const content = `
# Solution
We will do something.
`.repeat(3);
    const result = scoreBusinessImpact(content);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

describe('scoreImplementationPlan', () => {
  test('should detect implementation section', () => {
    const content = `
# Implementation Plan
Phase 1 will begin in Q1.
`.repeat(3);
    const result = scoreImplementationPlan(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should detect timeline and resources', () => {
    const content = `
# Implementation
Phase 1 (Q1): Design
Phase 2 (Q2): Development
Budget: $50,000
Team: 3 engineers
`.repeat(2);
    const result = scoreImplementationPlan(content);
    expect(result.score).toBeGreaterThan(5);
  });

  test('should return issues for missing plan', () => {
    const content = `
# Problem
There is a problem.
`.repeat(3);
    const result = scoreImplementationPlan(content);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Detection Function Tests
// ============================================================================

describe('Detection Functions', () => {
  describe('detectProblemStatement', () => {
    test('should detect problem section', () => {
      const content = '# Problem\\nThere is a challenge.';
      const result = detectProblemStatement(content);
      expect(result.hasProblemSection).toBe(true);
    });

    test('should detect problem language', () => {
      const content = 'We face challenges and struggle with this issue daily.';
      const result = detectProblemStatement(content);
      expect(result.hasProblemLanguage).toBe(true);
    });
  });

  describe('detectUrgency', () => {
    test('should detect urgency markers', () => {
      const content = 'This is a critical and urgent matter that requires immediate attention.';
      const result = detectUrgency(content);
      expect(result.hasUrgencyLanguage).toBe(true);
    });
  });

  describe('detectSolution', () => {
    test('should detect solution section', () => {
      const content = '# Solution\\nWe will implement a new system.';
      const result = detectSolution(content);
      expect(result.hasSolutionSection).toBe(true);
    });

    test('should detect solution language', () => {
      const content = 'We will build and implement a solution to deliver value.';
      const result = detectSolution(content);
      expect(result.hasSolutionLanguage).toBe(true);
    });
  });

  describe('detectBusinessImpact', () => {
    test('should detect impact language', () => {
      const content = 'This will have a major impact and deliver significant benefit and value.';
      const result = detectBusinessImpact(content);
      expect(result.hasImpactLanguage).toBe(true);
    });

    test('should detect financial terms', () => {
      const content = 'ROI of 200%, cost savings of $50,000, revenue growth of 30%.';
      const result = detectBusinessImpact(content);
      expect(result.hasFinancialTerms).toBe(true);
    });
  });

  describe('detectImplementation', () => {
    test('should detect implementation section', () => {
      const content = '# Implementation\\nPhase 1 starts Q1.';
      const result = detectImplementation(content);
      expect(result.hasImplementationSection).toBe(true);
    });

    test('should detect timeline', () => {
      const content = 'Phase 1 in Q1 2024, Phase 2 in Q2 2024.';
      const result = detectImplementation(content);
      expect(result.hasTimeline).toBe(true);
    });
  });

  describe('detectRisks', () => {
    test('should detect risk section', () => {
      const content = '# Risks\\nThere are integration risks.';
      const result = detectRisks(content);
      expect(result.hasRiskSection).toBe(true);
    });
  });

  describe('detectSuccessMetrics', () => {
    test('should detect metrics section', () => {
      const content = '# Success Metrics\\n- 99% uptime';
      const result = detectSuccessMetrics(content);
      expect(result.hasMetricsSection).toBe(true);
    });

    test('should detect quantified metrics', () => {
      const content = 'Target: 95% accuracy, 200ms response, $100K savings.';
      const result = detectSuccessMetrics(content);
      expect(result.hasQuantified).toBe(true);
    });
  });
});
