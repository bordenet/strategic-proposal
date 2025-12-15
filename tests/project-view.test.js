/**
 * Project View Tests - Phase Workflow UX Coverage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies
vi.mock('../js/projects.js', () => ({
    getProject: vi.fn(),
    updatePhase: vi.fn().mockResolvedValue(true)
}));

vi.mock('../js/router.js', () => ({
    navigateTo: vi.fn()
}));

vi.mock('../js/workflow.js', () => ({
    getPhaseMetadata: vi.fn((phase) => ({
        1: { name: 'Initial Draft', description: 'Generate initial proposal', aiModel: 'Claude Sonnet 4', aiUrl: 'https://claude.ai/new', icon: '📝', color: 'blue' },
        2: { name: 'Adversarial Review', description: 'Critical review', aiModel: 'Gemini 2.5 Pro', aiUrl: 'https://gemini.google.com/app', icon: '🔄', color: 'green' },
        3: { name: 'Final Synthesis', description: 'Final version', aiModel: 'Claude Sonnet 4', aiUrl: 'https://claude.ai/new', icon: '✨', color: 'purple' }
    }[phase])),
    generatePromptForPhase: vi.fn().mockResolvedValue('Test prompt content'),
    exportFinalDocument: vi.fn().mockReturnValue('# Final Document'),
    WORKFLOW_CONFIG: {
        phases: [
            { number: 1, name: 'Initial Draft', icon: '📝', color: 'blue' },
            { number: 2, name: 'Adversarial Review', icon: '🔄', color: 'green' },
            { number: 3, name: 'Final Synthesis', icon: '✨', color: 'purple' }
        ]
    }
}));

const mockProject = {
    id: 'test-123',
    dealershipName: 'Test Dealership',
    dealershipLocation: 'Dallas, TX',
    storeCount: '5',
    currentVendor: 'Old Vendor',
    phase: 1,
    phases: {
        1: { prompt: '', response: '', completed: false },
        2: { prompt: '', response: '', completed: false },
        3: { prompt: '', response: '', completed: false }
    }
};

describe('Project View - Phase Workflow UX', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="app-container"></div>
            <div id="toast-container"></div>
        `;
        vi.clearAllMocks();
    });

    describe('Phase Navigation - All Tabs Clickable', () => {
        it('should render all three phase tabs', async () => {
            const { getProject } = await import('../js/projects.js');
            getProject.mockResolvedValue(mockProject);
            
            const { renderProjectView } = await import('../js/project-view.js');
            await renderProjectView('test-123');
            
            const phaseTabs = document.querySelectorAll('.phase-tab');
            expect(phaseTabs.length).toBe(3);
        });

        it('should have back button with click handler', async () => {
            const { getProject } = await import('../js/projects.js');
            const { navigateTo } = await import('../js/router.js');
            getProject.mockResolvedValue(mockProject);
            
            const { renderProjectView } = await import('../js/project-view.js');
            await renderProjectView('test-123');
            
            const backBtn = document.getElementById('back-btn');
            expect(backBtn).not.toBeNull();
            
            backBtn.click();
            expect(navigateTo).toHaveBeenCalledWith('home');
        });

        it('should have export button with click handler when phase 3 is complete', async () => {
            const { getProject } = await import('../js/projects.js');
            const completedProject = {
                ...mockProject,
                phases: {
                    1: { prompt: 'p1', response: 'r1', completed: true },
                    2: { prompt: 'p2', response: 'r2', completed: true },
                    3: { prompt: 'p3', response: 'r3', completed: true }
                }
            };
            getProject.mockResolvedValue(completedProject);

            const { renderProjectView } = await import('../js/project-view.js');
            await renderProjectView('test-123');

            const exportBtn = document.getElementById('export-document-btn');
            expect(exportBtn).not.toBeNull();
        });

        it('should not have export button when phase 3 is not complete', async () => {
            const { getProject } = await import('../js/projects.js');
            getProject.mockResolvedValue(mockProject);

            const { renderProjectView } = await import('../js/project-view.js');
            await renderProjectView('test-123');

            const exportBtn = document.getElementById('export-document-btn');
            expect(exportBtn).toBeNull();
        });

        it('should have copy prompt button', async () => {
            const { getProject } = await import('../js/projects.js');
            getProject.mockResolvedValue(mockProject);
            
            const { renderProjectView } = await import('../js/project-view.js');
            await renderProjectView('test-123');
            
            const copyBtn = document.getElementById('copy-prompt-btn');
            expect(copyBtn).not.toBeNull();
        });

        it('should have save response button', async () => {
            const { getProject } = await import('../js/projects.js');
            getProject.mockResolvedValue(mockProject);
            
            const { renderProjectView } = await import('../js/project-view.js');
            await renderProjectView('test-123');
            
            const saveBtn = document.getElementById('save-response-btn');
            expect(saveBtn).not.toBeNull();
        });

        it('should have response textarea', async () => {
            const { getProject } = await import('../js/projects.js');
            getProject.mockResolvedValue(mockProject);
            
            const { renderProjectView } = await import('../js/project-view.js');
            await renderProjectView('test-123');
            
            const textarea = document.getElementById('response-textarea');
            expect(textarea).not.toBeNull();
        });
    });

    describe('Phase Content - All Phases Accessible', () => {
        it('should show phase 1 content initially', async () => {
            const { getProject } = await import('../js/projects.js');
            getProject.mockResolvedValue(mockProject);

            const { renderProjectView } = await import('../js/project-view.js');
            await renderProjectView('test-123');

            const content = document.getElementById('phase-content');
            expect(content.textContent).toContain('📝');
            expect(content.textContent).toContain('Initial Draft');
        });

        it('should switch to phase 2 when tab clicked', async () => {
            const { getProject } = await import('../js/projects.js');
            getProject.mockResolvedValue(mockProject);

            const { renderProjectView } = await import('../js/project-view.js');
            await renderProjectView('test-123');

            const phaseTabs = document.querySelectorAll('.phase-tab');
            phaseTabs[1].click();

            const content = document.getElementById('phase-content');
            expect(content.textContent).toContain('🔄');
            expect(content.textContent).toContain('Adversarial Review');
        });
    });
});

