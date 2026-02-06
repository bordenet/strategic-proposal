/**
 * Storage Module Tests
 * Tests IndexedDB operations using fake-indexeddb
 */

import storage from '../js/storage.js';

describe('Storage Module', () => {
    beforeAll(async () => {
        await storage.init();
    });

    beforeEach(async () => {
        // Clean up projects between tests
        const projects = await storage.getAllProjects();
        for (const project of projects) {
            await storage.deleteProject(project.id);
        }
    });

    describe('init', () => {
        it('should initialize database successfully', async () => {
            expect(storage.db).not.toBeNull();
        });

        it('should create proposals store', async () => {
            expect(storage.db.objectStoreNames.contains('proposals')).toBe(true);
        });

        it('should create settings store', async () => {
            expect(storage.db.objectStoreNames.contains('settings')).toBe(true);
        });

        it('should create prompts store', async () => {
            expect(storage.db.objectStoreNames.contains('prompts')).toBe(true);
        });

        it('should create attachments store', async () => {
            expect(storage.db.objectStoreNames.contains('attachments')).toBe(true);
        });
    });

    describe('saveProject and getProject', () => {
        it('should save a project', async () => {
            const project = {
                id: 'test-1',
                title: 'Test Project',
                dealershipName: 'Acme Motors'
            };
            const saved = await storage.saveProject(project);
            expect(saved.id).toBe('test-1');
            expect(saved.updatedAt).toBeDefined();
        });

        it('should retrieve a saved project', async () => {
            const project = {
                id: 'test-2',
                title: 'Another Project',
                phase: 1
            };
            await storage.saveProject(project);
            const retrieved = await storage.getProject('test-2');
            expect(retrieved.title).toBe('Another Project');
            expect(retrieved.phase).toBe(1);
        });

        it('should return undefined for non-existent project', async () => {
            const result = await storage.getProject('non-existent');
            expect(result).toBeUndefined();
        });

        it('should update existing project', async () => {
            const project = { id: 'test-3', title: 'Original' };
            await storage.saveProject(project);
            
            project.title = 'Updated';
            await storage.saveProject(project);
            
            const retrieved = await storage.getProject('test-3');
            expect(retrieved.title).toBe('Updated');
        });

        it('should set updatedAt on save', async () => {
            const project = { id: 'test-4', title: 'Time Test' };
            const before = new Date().toISOString();
            await storage.saveProject(project);
            const after = new Date().toISOString();
            
            const retrieved = await storage.getProject('test-4');
            expect(retrieved.updatedAt >= before).toBe(true);
            expect(retrieved.updatedAt <= after).toBe(true);
        });
    });

    describe('getAllProjects', () => {
        it('should return empty array when no projects', async () => {
            const projects = await storage.getAllProjects();
            expect(projects).toEqual([]);
        });

        it('should return all saved projects', async () => {
            await storage.saveProject({ id: 'p1', title: 'First' });
            await storage.saveProject({ id: 'p2', title: 'Second' });
            await storage.saveProject({ id: 'p3', title: 'Third' });
            
            const projects = await storage.getAllProjects();
            expect(projects).toHaveLength(3);
        });

        it('should return projects sorted by updatedAt descending', async () => {
            await storage.saveProject({ id: 'old', title: 'Old' });
            await new Promise(r => setTimeout(r, 10)); // Small delay
            await storage.saveProject({ id: 'new', title: 'New' });
            
            const projects = await storage.getAllProjects();
            expect(projects[0].id).toBe('new');
            expect(projects[1].id).toBe('old');
        });
    });

    describe('deleteProject', () => {
        it('should delete a project', async () => {
            await storage.saveProject({ id: 'to-delete', title: 'Delete Me' });
            await storage.deleteProject('to-delete');
            
            const result = await storage.getProject('to-delete');
            expect(result).toBeUndefined();
        });

        it('should not throw when deleting non-existent project', async () => {
            await expect(storage.deleteProject('does-not-exist')).resolves.not.toThrow();
        });
    });

    describe('settings', () => {
        it('should save and retrieve a setting', async () => {
            await storage.saveSetting('theme', 'dark');
            const value = await storage.getSetting('theme');
            expect(value).toBe('dark');
        });

        it('should return undefined for non-existent setting', async () => {
            const value = await storage.getSetting('non-existent-setting');
            expect(value).toBeUndefined();
        });

        it('should update existing setting', async () => {
            await storage.saveSetting('mode', 'light');
            await storage.saveSetting('mode', 'dark');
            const value = await storage.getSetting('mode');
            expect(value).toBe('dark');
        });
    });

    describe('exportAll and importAll', () => {
        it('exportAll should export all projects', async () => {
            const project1 = {
                id: 'export-1',
                title: 'Export Test 1',
                dealershipName: 'Test Motors'
            };
            const project2 = {
                id: 'export-2',
                title: 'Export Test 2',
                dealershipName: 'Test Motors 2'
            };
            await storage.saveProject(project1);
            await storage.saveProject(project2);

            const backup = await storage.exportAll();

            expect(backup.version).toBeDefined();
            expect(backup.exportDate).toBeDefined();
            expect(backup.projectCount).toBe(2);
            expect(backup.projects).toHaveLength(2);
        });

        it('importAll should import all projects from export data', async () => {
            const importData = {
                version: 1,
                exportDate: new Date().toISOString(),
                projectCount: 2,
                projects: [
                    { id: 'import-1', title: 'Import Test 1', dealershipName: 'Motors 1' },
                    { id: 'import-2', title: 'Import Test 2', dealershipName: 'Motors 2' }
                ]
            };

            const count = await storage.importAll(importData);

            expect(count).toBe(2);
            const project1 = await storage.getProject('import-1');
            const project2 = await storage.getProject('import-2');
            expect(project1.title).toBe('Import Test 1');
            expect(project2.title).toBe('Import Test 2');
        });

        it('importAll should throw on invalid import data', async () => {
            await expect(storage.importAll({})).rejects.toThrow('Invalid import data');
            await expect(storage.importAll({ projects: 'not-array' })).rejects.toThrow('Invalid import data');
        });

        it('exportAll should export empty backup when no projects', async () => {
            const backup = await storage.exportAll();

            expect(backup.version).toBeDefined();
            expect(backup.exportDate).toBeDefined();
            expect(backup.projectCount).toBe(0);
            expect(backup.projects).toHaveLength(0);
        });
    });

});

// Separate describe block without the beforeEach cleanup that calls getAllProjects
describe('Storage Module - error handling when db not initialized', () => {
    let originalDb;

    beforeAll(async () => {
        await storage.init();
        originalDb = storage.db;
    });

    afterEach(() => {
        // Restore db after each test
        storage.db = originalDb;
    });

    it('getAllProjects should reject when db is null', async () => {
        storage.db = null;
        await expect(storage.getAllProjects()).rejects.toThrow('Database not initialized');
    });

    it('getProject should reject when db is null', async () => {
        storage.db = null;
        await expect(storage.getProject('test-id')).rejects.toThrow('Database not initialized');
    });

    it('saveProject should reject when db is null', async () => {
        storage.db = null;
        await expect(storage.saveProject({ id: 'test', title: 'Test' })).rejects.toThrow('Database not initialized');
    });

    it('deleteProject should reject when db is null', async () => {
        storage.db = null;
        await expect(storage.deleteProject('test-id')).rejects.toThrow('Database not initialized');
    });

    it('getSetting should reject when db is null', async () => {
        storage.db = null;
        await expect(storage.getSetting('test-key')).rejects.toThrow('Database not initialized');
    });

    it('saveSetting should reject when db is null', async () => {
        storage.db = null;
        await expect(storage.saveSetting('test-key', 'test-value')).rejects.toThrow('Database not initialized');
    });
});

