/**
 * Workflow Module Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WORKFLOW_CONFIG, Workflow, getPhaseMetadata } from '../js/workflow.js';

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
            expect(phase.promptFile).toBeDefined();
            expect(phase.description).toBeDefined();
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
});

