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
} from '../js/prompts.js';

// Mock fetch for loading prompt templates
global.fetch = jest.fn(async (url) => {
  const templates = {
    'prompts/phase1.md': 'Phase 1: Proposal for {{DEALERSHIP_NAME}} in {{DEALERSHIP_LOCATION}} with {{STORE_COUNT}} stores. Current vendor: {{CURRENT_VENDOR}}. Decision maker: {{DECISION_MAKER_NAME}} ({{DECISION_MAKER_ROLE}}). Transcripts: {{CONVERSATION_TRANSCRIPTS}}. Notes: {{MEETING_NOTES}}. Pain points: {{PAIN_POINTS}}. Attachments: {{ATTACHMENT_TEXT}}. Draft: {{WORKING_DRAFT}}. Context: {{ADDITIONAL_CONTEXT}}.',
    'prompts/phase2.md': 'Phase 2: Review for {{DECISION_MAKER_NAME}} ({{DECISION_MAKER_ROLE}}) at {{DEALERSHIP_NAME}}. Previous output: {{PHASE1_OUTPUT}}',
    'prompts/phase3.md': 'Phase 3: Final synthesis for {{DEALERSHIP_NAME}}. Phase 1: {{PHASE1_OUTPUT}}. Phase 2: {{PHASE2_OUTPUT}}'
  };

  return {
    ok: true,
    text: async () => templates[url] || 'Default template'
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

    expect(global.fetch).toHaveBeenCalledWith('prompts/phase1.md');
    expect(global.fetch).toHaveBeenCalledWith('prompts/phase2.md');
    expect(global.fetch).toHaveBeenCalledWith('prompts/phase3.md');
  });
});

describe('generatePhase1Prompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate prompt with all form data', async () => {
    const formData = {
      dealershipName: 'Test Auto Group',
      dealershipLocation: 'Dallas, TX',
      storeCount: '5',
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
      dealershipName: 'Test Dealer'
    };

    const prompt = await generatePhase1Prompt(formData);

    expect(prompt).toContain('Test Dealer');
    expect(prompt).toContain('[Not provided]');
  });
});

describe('generatePhase2Prompt', () => {
  test('should include phase 1 output', async () => {
    const formData = {
      dealershipName: 'Test Dealer',
      decisionMakerName: 'Jane Doe',
      decisionMakerRole: 'Owner'
    };

    const prompt = await generatePhase2Prompt(formData, 'Phase 1 generated content');

    expect(prompt).toContain('Phase 1 generated content');
    expect(prompt).toContain('Jane Doe');
    expect(prompt).toContain('Owner');
    expect(prompt).toContain('Test Dealer');
  });
});

describe('generatePhase3Prompt', () => {
  test('should include both phase 1 and phase 2 outputs', async () => {
    const formData = {
      dealershipName: 'Final Test Dealer'
    };

    const prompt = await generatePhase3Prompt(formData, 'Phase 1 content', 'Phase 2 critique');

    expect(prompt).toContain('Final Test Dealer');
    expect(prompt).toContain('Phase 1 content');
    expect(prompt).toContain('Phase 2 critique');
  });
});

