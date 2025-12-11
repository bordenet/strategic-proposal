/**
 * Unit Tests for Storage Module
 *
 * Tests IndexedDB operations for project persistence.
 */

import storage from '../js/storage.js';

describe('Storage Module', () => {
  beforeEach(async () => {
    // Initialize database before each test
    await storage.init();
  });

  afterEach(async () => {
    // Clean up database after each test
    const projects = await storage.getAllProjects();
    for (const project of projects) {
      await storage.deleteProject(project.id);
    }
  });

  describe('init', () => {
    test('initializes database successfully', async () => {
      await storage.init();
      expect(storage.db).toBeTruthy();
    });

    test('handles multiple initialization calls', async () => {
      await storage.init();
      await storage.init();
      expect(storage.db).toBeTruthy();
    });
  });

  describe('saveProject', () => {
    test('saves new project', async () => {
      const project = {
        id: 'test-1',
        title: 'Test Project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: {}
      };

      const result = await storage.saveProject(project);
      expect(result).toBeTruthy();

      const retrieved = await storage.getProject('test-1');
      expect(retrieved.title).toBe('Test Project');
    });

    test('updates existing project', async () => {
      const project = {
        id: 'test-2',
        title: 'Original Name',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: {}
      };

      await storage.saveProject(project);

      project.title = 'Updated Name';
      await storage.saveProject(project);

      const retrieved = await storage.getProject('test-2');
      expect(retrieved.title).toBe('Updated Name');
    });
  });

  describe('getProject', () => {
    test('retrieves existing project', async () => {
      const project = {
        id: 'test-3',
        title: 'Test Project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: {}
      };

      await storage.saveProject(project);
      const retrieved = await storage.getProject('test-3');
      expect(retrieved.title).toBe('Test Project');
    });

    test('returns undefined for non-existent project', async () => {
      const retrieved = await storage.getProject('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllProjects', () => {
    test('returns empty array when no projects', async () => {
      const projects = await storage.getAllProjects();
      expect(projects).toEqual([]);
    });

    test('returns all projects', async () => {
      const project1 = {
        id: 'test-4',
        title: 'Project 1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: {}
      };

      const project2 = {
        id: 'test-5',
        title: 'Project 2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: {}
      };

      await storage.saveProject(project1);
      await storage.saveProject(project2);

      const projects = await storage.getAllProjects();
      expect(projects).toHaveLength(2);
      expect(projects.map(p => p.id)).toContain('test-4');
      expect(projects.map(p => p.id)).toContain('test-5');
    });

    test('returns projects sorted by updatedAt date', async () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 2000);

      const project1 = {
        id: 'test-6',
        title: 'Older Project',
        createdAt: earlier.toISOString(),
        updatedAt: earlier.toISOString(),
        phases: {}
      };

      const project2 = {
        id: 'test-7',
        title: 'Newer Project',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        phases: {}
      };

      await storage.saveProject(project1);
      await storage.saveProject(project2);

      const projects = await storage.getAllProjects();
      expect(projects[0].id).toBe('test-7'); // Newer first
      expect(projects[1].id).toBe('test-6');
    });
  });

  describe('deleteProject', () => {
    test('deletes existing project', async () => {
      const project = {
        id: 'test-8',
        title: 'Test Project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: {}
      };

      await storage.saveProject(project);
      await storage.deleteProject('test-8');

      const retrieved = await storage.getProject('test-8');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('exportAll', () => {
    test('exports all projects as JSON', async () => {
      const project = {
        id: 'test-9',
        title: 'Export Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: {
          1: { prompt: '', response: '', completed: false }
        }
      };

      await storage.saveProject(project);
      const exported = await storage.exportAll();

      expect(exported.projects).toHaveLength(1);
      expect(exported.projects[0].title).toBe('Export Test');
      expect(exported.version).toBe(1);
    });
  });

  describe('importAll', () => {
    test('imports projects from JSON', async () => {
      const data = {
        version: 1,
        exportDate: new Date().toISOString(),
        projectCount: 1,
        projects: [
          {
            id: 'test-10',
            title: 'Import Test',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            phases: {}
          }
        ]
      };

      const count = await storage.importAll(data);
      expect(count).toBe(1);

      const retrieved = await storage.getProject('test-10');
      expect(retrieved.title).toBe('Import Test');
    });

    test('handles invalid data', async () => {
      await expect(storage.importAll({})).rejects.toThrow();
      await expect(storage.importAll({ projects: 'not-array' })).rejects.toThrow();
    });
  });

  describe('getStorageInfo', () => {
    test('returns storage estimate', async () => {
      const info = await storage.getStorageInfo();
      if (info) {
        expect(info).toHaveProperty('usage');
        expect(info).toHaveProperty('quota');
        expect(info).toHaveProperty('percentage');
      }
    });
  });

  describe('getStorageEstimate', () => {
    test('is an alias for getStorageInfo', async () => {
      const info = await storage.getStorageEstimate();
      const estimate = await storage.getStorageInfo();
      expect(info).toEqual(estimate);
    });
  });
});

