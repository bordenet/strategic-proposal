/**
 * Tests for validator/js/prompts.js
 * Tests prompt generation functions for LLM-based Strategic Proposal scoring
 */

import { describe, test, expect } from '@jest/globals';
import {
  generateLLMScoringPrompt,
  generateCritiquePrompt,
  generateRewritePrompt,
  cleanAIResponse
} from '../js/prompts.js';

describe('prompts.js', () => {
  const sampleContent = `# Strategic Proposal: Cloud Migration Initiative
## Executive Summary
Migrate legacy on-premises infrastructure to AWS to reduce costs by 30% and improve scalability.
## Problem Statement
Current infrastructure cannot scale to meet growing demand and costs $2M annually in maintenance.
## Proposed Solution
Phase 1: Migrate non-critical workloads. Phase 2: Migrate production systems. Phase 3: Decommission on-prem.
## Business Case
Expected ROI of 150% over 3 years with $500K annual cost savings.`;

  describe('generateLLMScoringPrompt', () => {
    test('should generate a prompt containing the content', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain(sampleContent);
    });

    test('should include scoring rubric sections', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain('SCORING RUBRIC');
      expect(prompt).toContain('/100');
    });

    test('should include calibration guidance', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain('CALIBRATION');
    });
  });

  describe('generateCritiquePrompt', () => {
    const mockResult = {
      totalScore: 65,
      executiveSummary: { score: 18, issues: ['Too long'] },
      problemStatement: { score: 20, issues: [] },
      proposedSolution: { score: 15, issues: ['Missing timeline'] }
    };

    test('should generate a prompt containing the content', () => {
      const prompt = generateCritiquePrompt(sampleContent, mockResult);
      expect(prompt).toContain(sampleContent);
    });

    test('should include current validation results', () => {
      const prompt = generateCritiquePrompt(sampleContent, mockResult);
      expect(prompt).toContain('65');
    });

    test('should handle missing result fields gracefully', () => {
      const minimalResult = { totalScore: 50 };
      const prompt = generateCritiquePrompt(sampleContent, minimalResult);
      expect(prompt).toContain('50');
    });
  });

  describe('generateRewritePrompt', () => {
    const mockResult = { totalScore: 45 };

    test('should generate a prompt containing the content', () => {
      const prompt = generateRewritePrompt(sampleContent, mockResult);
      expect(prompt).toContain(sampleContent);
    });

    test('should include current score', () => {
      const prompt = generateRewritePrompt(sampleContent, mockResult);
      expect(prompt).toContain('45');
    });
  });

  describe('cleanAIResponse', () => {
    test('should remove common prefixes', () => {
      const response = "Here's the evaluation:\nSome content";
      expect(cleanAIResponse(response)).toBe('Some content');
    });

    test('should extract content from markdown code blocks', () => {
      const response = '```markdown\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should handle code blocks without language specifier', () => {
      const response = '```\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should trim whitespace', () => {
      const response = '  Some content with spaces  ';
      expect(cleanAIResponse(response)).toBe('Some content with spaces');
    });

    test('should handle responses without prefixes or code blocks', () => {
      const response = 'Plain response text';
      expect(cleanAIResponse(response)).toBe('Plain response text');
    });
  });
});

