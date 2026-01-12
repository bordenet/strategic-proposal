/**
 * Phase 3 Synthesis Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { synthesizeProposal, exportAsMarkdown, exportAsJSON } from '../js/phase3-synthesis.js';

describe('Phase 3 Synthesis', () => {
  describe('synthesizeProposal', () => {
    it('should export synthesizeProposal function', () => {
      expect(typeof synthesizeProposal).toBe('function');
    });

    it('should generate proposal with title', () => {
      const project = {
        title: 'Test Strategic Proposal'
      };
      
      const proposal = synthesizeProposal(project);
      
      expect(proposal).toContain('Test Strategic Proposal');
    });

    it('should include dealership information', () => {
      const project = {
        title: 'Test',
        dealershipName: 'ABC Motors',
        dealershipLocation: 'Chicago, IL'
      };
      
      const proposal = synthesizeProposal(project);
      
      expect(proposal).toContain('ABC Motors');
      expect(proposal).toContain('Chicago, IL');
    });

    it('should include decision maker information', () => {
      const project = {
        title: 'Test',
        decisionMakerName: 'John Smith',
        decisionMakerRole: 'CEO'
      };
      
      const proposal = synthesizeProposal(project);
      
      expect(proposal).toContain('John Smith');
      expect(proposal).toContain('CEO');
    });

    it('should handle missing fields with placeholders', () => {
      const project = {};
      
      const proposal = synthesizeProposal(project);
      
      expect(proposal).toContain('[Dealership]');
      expect(proposal).toContain('[Location]');
    });

    it('should include executive summary section', () => {
      const project = { title: 'Test' };
      
      const proposal = synthesizeProposal(project);
      
      expect(proposal).toContain('Executive Summary');
    });

    it('should include implementation plan section', () => {
      const project = { title: 'Test' };
      
      const proposal = synthesizeProposal(project);
      
      expect(proposal).toContain('Implementation Plan');
    });

    it('should include risk mitigation section', () => {
      const project = { title: 'Test' };
      
      const proposal = synthesizeProposal(project);
      
      expect(proposal).toContain('Risk Mitigation');
    });

    it('should include current date', () => {
      const project = { title: 'Test' };
      
      const proposal = synthesizeProposal(project);
      const today = new Date().toISOString().split('T')[0];
      
      expect(proposal).toContain(today);
    });
  });

  describe('exportAsMarkdown', () => {
    it('should export exportAsMarkdown function', () => {
      expect(typeof exportAsMarkdown).toBe('function');
    });
  });

  describe('exportAsJSON', () => {
    it('should export exportAsJSON function', () => {
      expect(typeof exportAsJSON).toBe('function');
    });
  });
});

