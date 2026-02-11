/**
 * Prompts Module Tests
 */

import { jest } from '@jest/globals';
import {
  WORKFLOW_CONFIG,
  generatePhase1Prompt,
  generatePhase2Prompt,
  generatePhase3Prompt,
  getPhaseMetadata,
  preloadPromptTemplates
} from '../../shared/js/prompts.js';

// Mock fetch for loading prompt templates
// Handles both shared/prompts/ (root) and ../shared/prompts/ (assistant/) paths
global.fetch = jest.fn(async (url) => {
  const templates = {
    'phase1.md': 'Phase 1: Proposal for {{ORGANIZATION_NAME}} in {{ORGANIZATION_LOCATION}} with {{SITE_COUNT}} sites. Current vendor: {{CURRENT_VENDOR}}. Decision maker: {{DECISION_MAKER_NAME}} ({{DECISION_MAKER_ROLE}}). Transcripts: {{CONVERSATION_TRANSCRIPTS}}. Notes: {{MEETING_NOTES}}. Pain points: {{PAIN_POINTS}}. Attachments: {{ATTACHMENT_TEXT}}. Draft: {{WORKING_DRAFT}}. Context: {{ADDITIONAL_CONTEXT}}.',
    'phase2.md': 'Phase 2: Review for {{DECISION_MAKER_NAME}} ({{DECISION_MAKER_ROLE}}) at {{ORGANIZATION_NAME}}. Previous output: {{PHASE1_OUTPUT}}',
    'phase3.md': 'Phase 3: Final synthesis for {{ORGANIZATION_NAME}}. Phase 1: {{PHASE1_OUTPUT}}. Phase 2: {{PHASE2_OUTPUT}}'
  };

  // Extract filename from path (handles shared/prompts/phase1.md or ../shared/prompts/phase1.md)
  const filename = url.split('/').pop();
  return {
    ok: true,
    text: async () => templates[filename] || 'Default template'
  };
});

describe('WORKFLOW_CONFIG', () => {
  test('should have 3 phases', () => {
    expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
    expect(WORKFLOW_CONFIG.phases).toHaveLength(3);
  });

  test('should have correct phase structure', () => {
    WORKFLOW_CONFIG.phases.forEach((phase, index) => {
      expect(phase.number).toBe(index + 1);
      expect(phase.name).toBeDefined();
      expect(phase.aiModel).toBeDefined();
      expect(phase.description).toBeDefined();
      expect(phase.icon).toBeDefined();
      expect(phase.aiUrl).toBeDefined();
    });
  });

  test('should use Claude for Phase 1 and 3, Gemini for Phase 2', () => {
    expect(WORKFLOW_CONFIG.phases[0].aiModel).toBe('Claude');
    expect(WORKFLOW_CONFIG.phases[1].aiModel).toBe('Gemini');
    expect(WORKFLOW_CONFIG.phases[2].aiModel).toBe('Claude');
  });
});

describe('getPhaseMetadata', () => {
  test('should return correct metadata for each phase', () => {
    const phase1 = getPhaseMetadata(1);
    expect(phase1.name).toBe('Initial Draft');
    expect(phase1.icon).toBe('📝');

    const phase2 = getPhaseMetadata(2);
    expect(phase2.name).toBe('Adversarial Review');
    expect(phase2.icon).toBe('🔄');

    const phase3 = getPhaseMetadata(3);
    expect(phase3.name).toBe('Final Synthesis');
    expect(phase3.icon).toBe('✨');
  });

  test('should return undefined for invalid phase', () => {
    expect(getPhaseMetadata(0)).toBeUndefined();
    expect(getPhaseMetadata(4)).toBeUndefined();
    expect(getPhaseMetadata(-1)).toBeUndefined();
  });
});

describe('preloadPromptTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should preload all phase templates', async () => {
    await preloadPromptTemplates();

    // Check that all 3 phases were fetched (path includes shared/prompts/)
    expect(global.fetch).toHaveBeenCalledTimes(3);
    const calls = global.fetch.mock.calls.map(c => c[0]);
    expect(calls.some(url => url.includes('phase1.md'))).toBe(true);
    expect(calls.some(url => url.includes('phase2.md'))).toBe(true);
    expect(calls.some(url => url.includes('phase3.md'))).toBe(true);
  });
});

describe('generatePhase1Prompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate prompt with all form data', async () => {
    const formData = {
      organizationName: 'Test Auto Group',
      organizationLocation: 'Dallas, TX',
      siteCount: '5',
      currentVendor: 'Purple Cloud',
      decisionMakerName: 'John Smith',
      decisionMakerRole: 'General Manager',
      conversationTranscripts: 'Sample transcript',
      meetingNotes: 'Meeting notes here',
      painPoints: 'Missed calls issue',
      attachmentText: 'Attachment content',
      workingDraft: 'Draft content',
      additionalContext: 'Extra context'
    };

    const prompt = await generatePhase1Prompt(formData);

    expect(prompt).toContain('Test Auto Group');
    expect(prompt).toContain('Dallas, TX');
    expect(prompt).toContain('5');
    expect(prompt).toContain('Purple Cloud');
    expect(prompt).toContain('John Smith');
    expect(prompt).toContain('General Manager');
    expect(prompt).toContain('Sample transcript');
    expect(prompt).toContain('Meeting notes here');
    expect(prompt).toContain('Missed calls issue');
  });

  test('should handle missing form data with placeholders', async () => {
    const formData = {
      organizationName: 'Test Organization'
    };

    const prompt = await generatePhase1Prompt(formData);

    expect(prompt).toContain('Test Organization');
    expect(prompt).toContain('[Not provided]');
  });
});

describe('generatePhase2Prompt', () => {
  test('should include phase 1 output', async () => {
    const formData = {
      organizationName: 'Test Organization',
      decisionMakerName: 'Jane Doe',
      decisionMakerRole: 'Owner'
    };

    const prompt = await generatePhase2Prompt(formData, 'Phase 1 generated content');

    expect(prompt).toContain('Phase 1 generated content');
    expect(prompt).toContain('Jane Doe');
    expect(prompt).toContain('Owner');
    expect(prompt).toContain('Test Organization');
  });
});

describe('generatePhase3Prompt', () => {
  test('should include both phase 1 and phase 2 outputs', async () => {
    const formData = {
      organizationName: 'Final Test Organization'
    };

    const prompt = await generatePhase3Prompt(formData, 'Phase 1 content', 'Phase 2 critique');

    expect(prompt).toContain('Final Test Organization');
    expect(prompt).toContain('Phase 1 content');
    expect(prompt).toContain('Phase 2 critique');
  });
});

