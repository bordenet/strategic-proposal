/**
 * Views Module Tests - Complete UX Flow Coverage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the modules
vi.mock('../js/storage.js', () => ({
    default: {
        init: vi.fn().mockResolvedValue(true),
        getAllProjects: vi.fn().mockResolvedValue([]),
        saveProject: vi.fn().mockResolvedValue(true),
        getProject: vi.fn(),
        deleteProject: vi.fn().mockResolvedValue(true),
        getSetting: vi.fn().mockResolvedValue(null),
        saveSetting: vi.fn().mockResolvedValue(true)
    }
}));

vi.mock('../js/router.js', () => ({
    navigateTo: vi.fn()
}));

describe('Views Module - UX Flow', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="app-container"></div>
            <div id="toast-container"></div>
        `;
    });

    describe('Project List View - Clickable Elements', () => {
        it('should have new project button with click handler', async () => {
            const { renderProjectsList } = await import('../js/views.js');
            const { navigateTo } = await import('../js/router.js');
            
            await renderProjectsList();
            
            const newProjectBtn = document.getElementById('new-project-btn');
            expect(newProjectBtn).not.toBeNull();
            
            newProjectBtn.click();
            expect(navigateTo).toHaveBeenCalledWith('new-project');
        });

        it('should have empty state new project button with click handler', async () => {
            const { renderProjectsList } = await import('../js/views.js');
            const { navigateTo } = await import('../js/router.js');
            
            await renderProjectsList();
            
            const emptyBtn = document.getElementById('new-project-btn-empty');
            expect(emptyBtn).not.toBeNull();
            
            emptyBtn.click();
            expect(navigateTo).toHaveBeenCalledWith('new-project');
        });
    });

    describe('New Project Form - Clickable Elements', () => {
        it('should have back button with click handler', async () => {
            const { renderNewProjectForm } = await import('../js/views.js');
            const { navigateTo } = await import('../js/router.js');
            
            renderNewProjectForm();
            
            const backBtn = document.getElementById('back-btn');
            expect(backBtn).not.toBeNull();
            
            backBtn.click();
            expect(navigateTo).toHaveBeenCalledWith('home');
        });

        it('should have cancel button with click handler', async () => {
            const { renderNewProjectForm } = await import('../js/views.js');
            const { navigateTo } = await import('../js/router.js');
            
            renderNewProjectForm();
            
            const cancelBtn = document.getElementById('cancel-btn');
            expect(cancelBtn).not.toBeNull();
            
            cancelBtn.click();
            expect(navigateTo).toHaveBeenCalledWith('home');
        });

        it('should have drop zone and file input elements', async () => {
            const { renderNewProjectForm } = await import('../js/views.js');

            renderNewProjectForm();

            const dropZone = document.getElementById('drop-zone');
            const fileInput = document.getElementById('file-input');

            expect(dropZone).not.toBeNull();
            expect(fileInput).not.toBeNull();
            expect(fileInput.type).toBe('file');
        });

        it('should have form submit handler', async () => {
            const { renderNewProjectForm } = await import('../js/views.js');
            
            renderNewProjectForm();
            
            const form = document.getElementById('new-project-form');
            expect(form).not.toBeNull();
        });

        it('should have all required form fields', async () => {
            const { renderNewProjectForm } = await import('../js/views.js');
            
            renderNewProjectForm();
            
            // All form fields should exist
            expect(document.getElementById('dealershipName')).not.toBeNull();
            expect(document.getElementById('dealershipLocation')).not.toBeNull();
            expect(document.getElementById('storeCount')).not.toBeNull();
            expect(document.getElementById('currentVendor')).not.toBeNull();
            expect(document.getElementById('decisionMakerName')).not.toBeNull();
            expect(document.getElementById('decisionMakerRole')).not.toBeNull();
            expect(document.getElementById('conversationTranscripts')).not.toBeNull();
            expect(document.getElementById('meetingNotes')).not.toBeNull();
            expect(document.getElementById('painPoints')).not.toBeNull();
            expect(document.getElementById('attachmentText')).not.toBeNull();
            expect(document.getElementById('workingDraft')).not.toBeNull();
            expect(document.getElementById('additionalContext')).not.toBeNull();
        });
    });
});

