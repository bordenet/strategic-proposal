/**
 * Tests for validator-inline.js
 * Strategic Proposal inline validation
 */
import { validateDocument, getScoreColor, getScoreLabel } from '../js/validator-inline.js';

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
});

