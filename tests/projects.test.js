/**
 * Projects Module Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock storage
vi.mock('../js/storage.js', () => ({
    default: {
        getAllProjects: vi.fn().mockResolvedValue([]),
        saveProject: vi.fn().mockResolvedValue(true),
        getProject: vi.fn(),
        deleteProject: vi.fn().mockResolvedValue(true)
    }
}));

describe('Projects Module', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createProject', () => {
        it('should create a project with all required fields', async () => {
            const storage = (await import('../js/storage.js')).default;
            const { createProject } = await import('../js/projects.js');
            
            const formData = {
                dealershipName: 'Test Dealership',
                dealershipLocation: 'Dallas, TX',
                storeCount: '5',
                currentVendor: 'Old Vendor',
                decisionMakerName: 'John Doe',
                decisionMakerRole: 'GM',
                conversationTranscripts: 'Some transcripts',
                meetingNotes: 'Some notes',
                painPoints: 'Some pain points',
                attachmentText: '',
                workingDraft: '',
                additionalContext: ''
            };

            const project = await createProject(formData);
            
            expect(project.dealershipName).toBe('Test Dealership');
            expect(project.phase).toBe(1);
            expect(project.phases).toBeDefined();
            expect(project.phases[1]).toBeDefined();
            expect(project.phases[2]).toBeDefined();
            expect(project.phases[3]).toBeDefined();
            expect(storage.saveProject).toHaveBeenCalled();
        });
    });

    describe('getAllProjects', () => {
        it('should return all projects from storage', async () => {
            const storage = (await import('../js/storage.js')).default;
            storage.getAllProjects.mockResolvedValue([
                { id: '1', dealershipName: 'Test 1' },
                { id: '2', dealershipName: 'Test 2' }
            ]);
            
            const { getAllProjects } = await import('../js/projects.js');
            const projects = await getAllProjects();
            
            expect(projects.length).toBe(2);
        });
    });

    describe('getProject', () => {
        it('should return specific project by id', async () => {
            const storage = (await import('../js/storage.js')).default;
            storage.getProject.mockResolvedValue({ id: '123', dealershipName: 'Test' });
            
            const { getProject } = await import('../js/projects.js');
            const project = await getProject('123');
            
            expect(project.id).toBe('123');
            expect(storage.getProject).toHaveBeenCalledWith('123');
        });
    });

    describe('deleteProject', () => {
        it('should delete project by id', async () => {
            const storage = (await import('../js/storage.js')).default;
            
            const { deleteProject } = await import('../js/projects.js');
            await deleteProject('123');
            
            expect(storage.deleteProject).toHaveBeenCalledWith('123');
        });
    });

    describe('updatePhase', () => {
        it('should update project phase data', async () => {
            const storage = (await import('../js/storage.js')).default;
            storage.getProject.mockResolvedValue({
                id: '123',
                phases: { 1: {}, 2: {}, 3: {} }
            });

            const { updatePhase } = await import('../js/projects.js');
            await updatePhase('123', 1, 'prompt text', 'response text');

            expect(storage.saveProject).toHaveBeenCalled();
        });
    });

    describe('importProjects', () => {
        it('should import projects from valid JSON file', async () => {
            const storage = (await import('../js/storage.js')).default;
            const { importProjects } = await import('../js/projects.js');

            const fileContent = JSON.stringify({
                version: '1.0',
                projects: [
                    { id: '1', dealershipName: 'Test 1' },
                    { id: '2', dealershipName: 'Test 2' }
                ]
            });

            const file = new File([fileContent], 'test.json', { type: 'application/json' });
            const count = await importProjects(file);

            expect(count).toBe(2);
            expect(storage.saveProject).toHaveBeenCalledTimes(2);
        });

        it('should import single project from valid JSON', async () => {
            const storage = (await import('../js/storage.js')).default;
            vi.clearAllMocks();
            const { importProjects } = await import('../js/projects.js');

            const fileContent = JSON.stringify({
                id: '123',
                dealershipName: 'Single Project'
            });

            const file = new File([fileContent], 'single.json', { type: 'application/json' });
            const count = await importProjects(file);

            expect(count).toBe(1);
            expect(storage.saveProject).toHaveBeenCalledTimes(1);
        });

        it('should reject invalid file format', async () => {
            const { importProjects } = await import('../js/projects.js');

            const fileContent = JSON.stringify({ invalid: 'data' });
            const file = new File([fileContent], 'invalid.json', { type: 'application/json' });

            await expect(importProjects(file)).rejects.toThrow('Invalid file format');
        });
    });

    describe('exportProject', () => {
        it('should export a single project', async () => {
            const storage = (await import('../js/storage.js')).default;
            storage.getProject.mockResolvedValue({
                id: '123',
                dealershipName: 'Export Test'
            });

            // Mock URL.createObjectURL and document.createElement
            const mockUrl = 'blob:test';
            global.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
            global.URL.revokeObjectURL = vi.fn();

            const mockLink = { href: '', download: '', click: vi.fn() };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

            const { exportProject } = await import('../js/projects.js');
            await exportProject('123');

            expect(mockLink.click).toHaveBeenCalled();
            expect(mockLink.download).toContain('export-test');
        });
    });

    describe('exportAllProjects', () => {
        it('should export all projects', async () => {
            const storage = (await import('../js/storage.js')).default;
            storage.getAllProjects.mockResolvedValue([
                { id: '1', dealershipName: 'Test 1' },
                { id: '2', dealershipName: 'Test 2' }
            ]);

            const mockUrl = 'blob:test';
            global.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
            global.URL.revokeObjectURL = vi.fn();

            const mockLink = { href: '', download: '', click: vi.fn() };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

            const { exportAllProjects } = await import('../js/projects.js');
            await exportAllProjects();

            expect(mockLink.click).toHaveBeenCalled();
            expect(mockLink.download).toContain('strategic-proposals-backup');
        });
    });
});

