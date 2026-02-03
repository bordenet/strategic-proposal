/**
 * Phase 2 Review Tests
 */

import { generatePhase2Review } from '../js/phase2-review.js';

describe('Phase 2 Review', () => {
  describe('generatePhase2Review', () => {
    it('should export generatePhase2Review function', () => {
      expect(typeof generatePhase2Review).toBe('function');
    });

    it('should generate review with proposal title', async () => {
      const review = await generatePhase2Review(
        'Test Proposal',
        'Test context',
        'Test draft content'
      );
      
      expect(review).toContain('Test Proposal');
    });

    it('should include adversarial critique header', async () => {
      const review = await generatePhase2Review(
        'Test Proposal',
        'Test context',
        'Test draft'
      );
      
      expect(review).toContain('ADVERSARIAL CRITIQUE');
    });

    it('should include critical feedback section', async () => {
      const review = await generatePhase2Review(
        'Test',
        'Context',
        'Draft'
      );
      
      expect(review).toContain('CRITICAL FEEDBACK');
    });

    it('should include key concerns section', async () => {
      const review = await generatePhase2Review(
        'Test',
        'Context',
        'Draft'
      );
      
      expect(review).toContain('KEY CONCERNS');
    });

    it('should include recommendation section', async () => {
      const review = await generatePhase2Review(
        'Test',
        'Context',
        'Draft'
      );
      
      expect(review).toContain('RECOMMENDATION');
    });

    it('should handle long draft content by truncating', async () => {
      const longDraft = 'x'.repeat(1000);
      const review = await generatePhase2Review(
        'Test',
        'Context',
        longDraft
      );
      
      expect(review).toContain('...');
    });

    it('should handle empty draft gracefully', async () => {
      const review = await generatePhase2Review(
        'Test',
        'Context',
        ''
      );
      
      expect(review).toBeDefined();
    });

    it('should handle undefined draft gracefully', async () => {
      const review = await generatePhase2Review(
        'Test',
        'Context',
        undefined
      );
      
      expect(review).toBeDefined();
    });
  });
});

