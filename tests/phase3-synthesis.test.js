/**
 * Phase 3 Synthesis Tests
 */

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
    let mockUrl;
    let mockAnchor;
    let originalCreateObjectURL;
    let originalRevokeObjectURL;
    let originalCreateElement;

    beforeEach(() => {
      mockUrl = 'blob:mock-url';
      mockAnchor = { href: '', download: '', click: jest.fn() };

      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;
      originalCreateElement = document.createElement.bind(document);

      URL.createObjectURL = jest.fn(() => mockUrl);
      URL.revokeObjectURL = jest.fn();
      document.createElement = jest.fn((tag) => {
        if (tag === 'a') return mockAnchor;
        return originalCreateElement(tag);
      });
    });

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      document.createElement = originalCreateElement;
    });

    it('should export exportAsMarkdown function', () => {
      expect(typeof exportAsMarkdown).toBe('function');
    });

    it('should create download link with proposal content', () => {
      const proposal = '# Test Proposal\n\nContent here';
      exportAsMarkdown(proposal, 'test.md');

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('test.md');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });

    it('should use default filename when not provided', () => {
      const proposal = '# Proposal';
      exportAsMarkdown(proposal);

      expect(mockAnchor.download).toBe('proposal.md');
    });
  });

  describe('exportAsJSON', () => {
    let mockUrl;
    let mockAnchor;
    let originalCreateObjectURL;
    let originalRevokeObjectURL;
    let originalCreateElement;

    beforeEach(() => {
      mockUrl = 'blob:mock-json-url';
      mockAnchor = { href: '', download: '', click: jest.fn() };

      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;
      originalCreateElement = document.createElement.bind(document);

      URL.createObjectURL = jest.fn(() => mockUrl);
      URL.revokeObjectURL = jest.fn();
      document.createElement = jest.fn((tag) => {
        if (tag === 'a') return mockAnchor;
        return originalCreateElement(tag);
      });
    });

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      document.createElement = originalCreateElement;
    });

    it('should export exportAsJSON function', () => {
      expect(typeof exportAsJSON).toBe('function');
    });

    it('should create download link with project JSON', () => {
      const project = {
        title: 'Test Project',
        dealershipName: 'Test Dealer',
        dealershipLocation: 'Dallas, TX',
        decisionMakerName: 'John',
        decisionMakerRole: 'Manager',
        painPoints: 'Issues here',
        phase1_output: 'Phase 1',
        phase2_output: 'Phase 2',
        phase3_output: 'Phase 3'
      };

      exportAsJSON(project);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('Test Project.json');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });

    it('should use default filename when title is missing', () => {
      const project = { dealershipName: 'Test' };
      exportAsJSON(project);

      expect(mockAnchor.download).toBe('proposal.json');
    });
  });
});

