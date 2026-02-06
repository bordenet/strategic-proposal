/**
 * Strategic Proposal Validator tests - Comprehensive scoring tests
 * Tests all exported functions for scoring strategic proposal documents
 */

import {
  validateStrategicProposal,
  scoreProblemStatement,
  scoreProposedSolution,
  scoreBusinessImpact,
  scoreImplementationPlan,
  detectProblemStatement,
  detectSolution,
  detectBusinessImpact,
  detectImplementation,
  detectSuccessMetrics,
  detectSections
} from '../js/validator.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixtures = JSON.parse(
  readFileSync(join(__dirname, '../testdata/scoring-fixtures.json'), 'utf-8')
);

// ============================================================================
// validateStrategicProposal tests
// ============================================================================
describe('validateStrategicProposal', () => {
  describe('empty/invalid input', () => {
    test('returns zero score for empty string', () => {
      const result = validateStrategicProposal('');
      expect(result.totalScore).toBe(0);
    });

    test('returns zero score for null', () => {
      const result = validateStrategicProposal(null);
      expect(result.totalScore).toBe(0);
    });

    test('returns zero score for undefined', () => {
      const result = validateStrategicProposal(undefined);
      expect(result.totalScore).toBe(0);
    });

    test('returns all dimensions with issues for empty input', () => {
      const result = validateStrategicProposal('');
      expect(result.problemStatement.issues).toContain('No content to validate');
      expect(result.proposedSolution.issues).toContain('No content to validate');
      expect(result.businessImpact.issues).toContain('No content to validate');
      expect(result.implementationPlan.issues).toContain('No content to validate');
    });
  });

  describe('fixture-based scoring', () => {
    test('scores minimal proposal correctly', () => {
      const result = validateStrategicProposal(fixtures.minimal.content);
      expect(result.totalScore).toBeGreaterThanOrEqual(fixtures.minimal.expectedMinScore);
      expect(result.totalScore).toBeLessThanOrEqual(fixtures.minimal.expectedMaxScore);
    });

    test('scores complete proposal correctly', () => {
      const result = validateStrategicProposal(fixtures.complete.content);
      expect(result.totalScore).toBeGreaterThanOrEqual(fixtures.complete.expectedMinScore);
      expect(result.totalScore).toBeLessThanOrEqual(fixtures.complete.expectedMaxScore);
    });
  });

  describe('score structure', () => {
    test('returns all required dimensions', () => {
      const result = validateStrategicProposal('# Problem\nSome content');
      expect(result).toHaveProperty('totalScore');
      expect(result).toHaveProperty('problemStatement');
      expect(result).toHaveProperty('proposedSolution');
      expect(result).toHaveProperty('businessImpact');
      expect(result).toHaveProperty('implementationPlan');
    });

    test('each dimension has score, maxScore, issues, strengths', () => {
      const result = validateStrategicProposal('# Problem\nSome content');
      for (const dim of ['problemStatement', 'proposedSolution', 'businessImpact', 'implementationPlan']) {
        expect(result[dim]).toHaveProperty('score');
        expect(result[dim]).toHaveProperty('maxScore');
        expect(result[dim]).toHaveProperty('issues');
        expect(result[dim]).toHaveProperty('strengths');
      }
    });

    test('total score equals sum of dimension scores minus slop deduction', () => {
      const result = validateStrategicProposal(fixtures.complete.content);
      const sum = result.problemStatement.score + result.proposedSolution.score +
                  result.businessImpact.score + result.implementationPlan.score;
      const slopDeduction = result.slopDetection?.deduction || 0;
      expect(result.totalScore).toBe(sum - slopDeduction);
    });
  });
});

// ============================================================================
// scoreProblemStatement tests
// ============================================================================
describe('scoreProblemStatement', () => {
  test('maxScore is 25', () => {
    const result = scoreProblemStatement('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for problem section', () => {
    const withSection = scoreProblemStatement('# Problem Statement\nWe have a problem with customer churn.');
    const withoutSection = scoreProblemStatement('We have a problem with customer churn.');
    expect(withSection.score).toBeGreaterThan(withoutSection.score);
  });

  test('awards points for urgency', () => {
    const withUrgency = scoreProblemStatement('# Problem\nWithout immediate action, we risk losing 40% of revenue.');
    const withoutUrgency = scoreProblemStatement('# Problem\nWe have a problem.');
    expect(withUrgency.score).toBeGreaterThan(withoutUrgency.score);
  });
});

// ============================================================================
// scoreProposedSolution tests
// ============================================================================
describe('scoreProposedSolution', () => {
  test('maxScore is 25', () => {
    const result = scoreProposedSolution('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for solution section', () => {
    const withSection = scoreProposedSolution('# Proposed Solution\nWe will implement a new system.');
    const withoutSection = scoreProposedSolution('We will implement a new system.');
    expect(withSection.score).toBeGreaterThan(withoutSection.score);
  });

  test('awards points for approach details', () => {
    const withDetails = scoreProposedSolution('# Solution\nWe will implement an automated workflow with integration to Salesforce.');
    const withoutDetails = scoreProposedSolution('# Solution\nWe will fix it.');
    expect(withDetails.score).toBeGreaterThan(withoutDetails.score);
  });
});

// ============================================================================
// scoreBusinessImpact tests
// ============================================================================
describe('scoreBusinessImpact', () => {
  test('maxScore is 25', () => {
    const result = scoreBusinessImpact('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for quantified impact', () => {
    const withNumbers = scoreBusinessImpact('# Business Impact\nThis will save $2 million annually and reduce costs by 40%.');
    const withoutNumbers = scoreBusinessImpact('# Business Impact\nThis will improve things.');
    expect(withNumbers.score).toBeGreaterThan(withoutNumbers.score);
  });
});

// ============================================================================
// scoreImplementationPlan tests
// ============================================================================
describe('scoreImplementationPlan', () => {
  test('maxScore is 25', () => {
    const result = scoreImplementationPlan('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for phased implementation', () => {
    const withPhases = scoreImplementationPlan('# Implementation Plan\n## Phase 1: Discovery\nWeek 1-2\n## Phase 2: Build\nWeek 3-6');
    const withoutPhases = scoreImplementationPlan('# Implementation Plan\nWe will do it.');
    expect(withPhases.score).toBeGreaterThan(withoutPhases.score);
  });
});

// ============================================================================
// Detection function tests
// ============================================================================
describe('detectProblemStatement', () => {
  test('detects problem section', () => {
    const result = detectProblemStatement('# Problem Statement\nWe have an issue.');
    expect(result.hasProblemSection).toBe(true);
  });

  test('detects problem language', () => {
    const result = detectProblemStatement('The challenge is that customers struggle with onboarding.');
    expect(result.hasProblemLanguage).toBe(true);
  });

  test('detects quantified metrics', () => {
    const result = detectProblemStatement('We lose 40% of customers in the first month.');
    expect(result.isQuantified).toBe(true);
  });
});

describe('detectSolution', () => {
  test('detects solution section', () => {
    const result = detectSolution('# Solution\nWe will build a new system.');
    expect(result.hasSolutionSection).toBe(true);
  });

  test('detects solution language', () => {
    const result = detectSolution('Our approach is to implement automated testing.');
    expect(result.hasSolutionLanguage).toBe(true);
  });
});

describe('detectBusinessImpact', () => {
  test('detects impact section', () => {
    const result = detectBusinessImpact('# Impact\nThis will save $2M annually.');
    expect(result.hasImpactSection).toBe(true);
  });

  test('detects quantified impact', () => {
    const result = detectBusinessImpact('Revenue will increase by 25% within 6 months.');
    expect(result.isQuantified).toBe(true);
  });
});

describe('detectImplementation', () => {
  test('detects implementation section', () => {
    const result = detectImplementation('# Implementation Plan\nPhase 1: Discovery.');
    expect(result.hasImplementationSection).toBe(true);
  });

  test('detects phasing', () => {
    const result = detectImplementation('Phase 1: Research. Phase 2: Build. Phase 3: Deploy.');
    expect(result.hasPhases).toBe(true);
  });
});

describe('detectSuccessMetrics', () => {
  test('detects metrics section', () => {
    const result = detectSuccessMetrics('# Success Metrics\nReduce errors by 50%.');
    expect(result.hasMetricsSection).toBe(true);
  });

  test('detects quantified metrics', () => {
    const result = detectSuccessMetrics('Target: 99.9% uptime, 200ms response time.');
    expect(result.hasQuantified).toBe(true);
  });
});

describe('detectSections', () => {
  test('finds present sections', () => {
    const result = detectSections('# Problem Statement\n# Proposed Solution\n# Business Impact');
    expect(result.found.length).toBeGreaterThan(0);
  });

  test('identifies missing sections', () => {
    const result = detectSections('# Problem Statement\nSome content.');
    expect(result.missing.length).toBeGreaterThan(0);
  });
});

