/**
 * Workflow Module Tests
 */

import { jest } from '@jest/globals';
import {
  WORKFLOW_CONFIG,
  Workflow,
  getPhaseMetadata,
  loadDefaultPrompts,
  generatePromptForPhase,
  exportFinalDocument,
  getFinalMarkdown,
  getExportFilename
} from '../js/workflow.js';

// Mock fetch for loading prompt templates
global.fetch = jest.fn(async (url) => {
  const templates = {
    'prompts/phase1.md': 'Phase 1: {{DEALERSHIP_NAME}}',
    'prompts/phase2.md': 'Phase 2: {{PHASE1_OUTPUT}}',
    'prompts/phase3.md': 'Phase 3: {{PHASE1_OUTPUT}} {{PHASE2_OUTPUT}}'
  };

  return {
    ok: true,
    text: async () => templates[url] || 'Default template'
  };
});

describe('WORKFLOW_CONFIG', () => {
    it('should have 3 phases', () => {
        expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
        expect(WORKFLOW_CONFIG.phases).toHaveLength(3);
    });

    it('should have correct phase structure', () => {
        WORKFLOW_CONFIG.phases.forEach((phase, index) => {
            expect(phase.number).toBe(index + 1);
            expect(phase.name).toBeDefined();
            expect(phase.aiModel).toBeDefined();
            expect(phase.description).toBeDefined();
            expect(phase.icon).toBeDefined();
        });
    });

    it('should use Claude for Phase 1 and 3, Gemini for Phase 2', () => {
        expect(WORKFLOW_CONFIG.phases[0].aiModel).toContain('Claude');
        expect(WORKFLOW_CONFIG.phases[1].aiModel).toContain('Gemini');
        expect(WORKFLOW_CONFIG.phases[2].aiModel).toContain('Claude');
    });
});

describe('getPhaseMetadata', () => {
    it('should return correct metadata for each phase', () => {
        const phase1 = getPhaseMetadata(1);
        expect(phase1.name).toBe('Initial Draft');
        
        const phase2 = getPhaseMetadata(2);
        expect(phase2.name).toBe('Adversarial Review');
        
        const phase3 = getPhaseMetadata(3);
        expect(phase3.name).toBe('Final Synthesis');
    });

    it('should return undefined for invalid phase', () => {
        expect(getPhaseMetadata(0)).toBeUndefined();
        expect(getPhaseMetadata(4)).toBeUndefined();
    });
});

describe('Workflow', () => {
    let mockProject;

    beforeEach(() => {
        mockProject = {
            id: 'test-123',
            dealershipName: 'Test Auto Group',
            dealershipLocation: 'Dallas, TX',
            storeCount: '5',
            currentVendor: 'Purple Cloud',
            decisionMakerName: 'John Smith',
            decisionMakerRole: 'General Manager',
            conversationTranscripts: 'Sample transcript...',
            meetingNotes: 'Meeting notes...',
            painPoints: 'No visibility into missed calls',
            attachmentText: '',
            additionalContext: '',
            workingDraft: '',
            phase: 1,
            phase1_output: '',
            phase2_output: '',
            phase3_output: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    });

    it('should initialize with project phase', () => {
        const workflow = new Workflow(mockProject);
        expect(workflow.currentPhase).toBe(1);
    });

    it('should get current phase metadata', () => {
        const workflow = new Workflow(mockProject);
        const phase = workflow.getCurrentPhase();
        expect(phase.number).toBe(1);
        expect(phase.name).toBe('Initial Draft');
    });

    it('should get next phase', () => {
        const workflow = new Workflow(mockProject);
        const nextPhase = workflow.getNextPhase();
        expect(nextPhase.number).toBe(2);
    });

    it('should return null for next phase when on phase 3', () => {
        mockProject.phase = 3;
        const workflow = new Workflow(mockProject);
        expect(workflow.getNextPhase()).toBeNull();
    });

    it('should advance phase correctly', () => {
        const workflow = new Workflow(mockProject);
        expect(workflow.advancePhase()).toBe(true);
        expect(workflow.currentPhase).toBe(2);
        expect(workflow.project.phase).toBe(2);
    });

    it('should not advance past phase 3', () => {
        mockProject.phase = 3;
        const workflow = new Workflow(mockProject);
        expect(workflow.advancePhase()).toBe(false);
        expect(workflow.currentPhase).toBe(3);
    });

    it('should replace variables in template', () => {
        const workflow = new Workflow(mockProject);
        const template = 'Proposal for {dealershipName} in {dealershipLocation}';
        const result = workflow.replaceVariables(template);
        expect(result).toBe('Proposal for Test Auto Group in Dallas, TX');
    });

    it('should save phase output', () => {
        const workflow = new Workflow(mockProject);
        workflow.savePhaseOutput('Test output');
        expect(mockProject.phase1_output).toBe('Test output');
    });

    it('should get phase output', () => {
        mockProject.phase2_output = 'Phase 2 content';
        const workflow = new Workflow(mockProject);
        expect(workflow.getPhaseOutput(2)).toBe('Phase 2 content');
    });

    it('should calculate progress correctly', () => {
        const workflow = new Workflow(mockProject);
        expect(workflow.getProgress()).toBe(33);
        
        mockProject.phase = 2;
        const workflow2 = new Workflow(mockProject);
        expect(workflow2.getProgress()).toBe(67);
        
        mockProject.phase = 3;
        const workflow3 = new Workflow(mockProject);
        expect(workflow3.getProgress()).toBe(100);
    });

    it('should export as markdown', () => {
        mockProject.phase3_output = '# Final Proposal\n\nContent here...';
        const workflow = new Workflow(mockProject);
        const markdown = workflow.exportAsMarkdown();

        expect(markdown).toContain('# Strategic Proposal: Test Auto Group');
        expect(markdown).toContain('# Final Proposal');
        expect(markdown).toContain('Content here...');
    });

    it('should check if workflow is complete', () => {
        const workflow = new Workflow(mockProject);
        expect(workflow.isComplete()).toBe(false);

        mockProject.phase = 4;
        const workflow2 = new Workflow(mockProject);
        expect(workflow2.isComplete()).toBe(true);
    });

    it('should generate prompt for phase 1', async () => {
        const workflow = new Workflow(mockProject);
        const prompt = await workflow.generatePrompt();
        expect(prompt).toContain('Test Auto Group');
    });

    it('should generate prompt for phase 2', async () => {
        mockProject.phase = 2;
        mockProject.phase1_output = 'Phase 1 content here';
        const workflow = new Workflow(mockProject);
        const prompt = await workflow.generatePrompt();
        expect(prompt).toContain('Phase 1 content here');
    });

    it('should generate prompt for phase 3', async () => {
        mockProject.phase = 3;
        mockProject.phase1_output = 'Phase 1 output';
        mockProject.phase2_output = 'Phase 2 output';
        const workflow = new Workflow(mockProject);
        const prompt = await workflow.generatePrompt();
        expect(prompt).toContain('Phase 1 output');
        expect(prompt).toContain('Phase 2 output');
    });

    it('should throw error for invalid phase in generatePrompt', async () => {
        mockProject.phase = 99;
        const workflow = new Workflow(mockProject);
        await expect(workflow.generatePrompt()).rejects.toThrow('Invalid phase: 99');
    });
});

describe('loadDefaultPrompts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should load prompts for all phases', async () => {
        await loadDefaultPrompts();
        expect(global.fetch).toHaveBeenCalledWith('prompts/phase1.md');
        expect(global.fetch).toHaveBeenCalledWith('prompts/phase2.md');
        expect(global.fetch).toHaveBeenCalledWith('prompts/phase3.md');
    });

    it('should handle fetch errors gracefully', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));
        // Should not throw
        await expect(loadDefaultPrompts()).resolves.not.toThrow();
    });
});

describe('generatePromptForPhase', () => {
    let mockProject;

    beforeEach(() => {
        mockProject = {
            id: 'test-123',
            dealershipName: 'Test Auto',
            phase: 1,
            phase1_output: 'Phase 1 content',
            phase2_output: 'Phase 2 content'
        };
        jest.clearAllMocks();
    });

    it('should generate prompt for specified phase', async () => {
        const prompt = await generatePromptForPhase(mockProject, 1);
        expect(prompt).toContain('Test Auto');
    });

    it('should generate prompt for phase 2', async () => {
        const prompt = await generatePromptForPhase(mockProject, 2);
        expect(prompt).toContain('Phase 1 content');
    });

    it('should generate prompt for phase 3', async () => {
        const prompt = await generatePromptForPhase(mockProject, 3);
        expect(prompt).toContain('Phase 1 content');
        expect(prompt).toContain('Phase 2 content');
    });
});

describe('exportFinalDocument', () => {
    it('should export project as markdown', () => {
        const project = {
            dealershipName: 'Export Test Dealer',
            phase: 3,
            phase3_output: 'Final content'
        };
        const markdown = exportFinalDocument(project);
        expect(markdown).toContain('Export Test Dealer');
        expect(markdown).toContain('Final content');
    });
});

describe('getFinalMarkdown', () => {
    it('should return markdown when phase has response', () => {
        const project = {
            dealershipName: 'Test Dealer',
            phase: 3,
            phase3_output: 'Final output'
        };
        const markdown = getFinalMarkdown(project);
        expect(markdown).toContain('Test Dealer');
    });

    it('should return null when no completed phases', () => {
        const project = {
            dealershipName: 'Test Dealer',
            phase: 1
        };
        const markdown = getFinalMarkdown(project);
        expect(markdown).toBeNull();
    });
});

describe('getExportFilename', () => {
    it('should generate sanitized filename', () => {
        const project = { title: 'My Strategic Proposal!' };
        const filename = getExportFilename(project);
        expect(filename).toBe('my-strategic-proposal--proposal.md');
    });

    it('should use default name when title is missing', () => {
        const project = {};
        const filename = getExportFilename(project);
        expect(filename).toBe('strategic-proposal-proposal.md');
    });
});
