/**
 * Projects Module Tests
 */

import { jest } from '@jest/globals';
import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  updatePhase,
  deleteProject,
  exportProject,
  exportAllProjects,
  importProjects
} from '../js/projects.js';
import storage from '../js/storage.js';

describe('Projects Module', () => {
  beforeEach(async () => {
    // Initialize storage
    await storage.init();
    // Clear all projects
    const allProjects = await getAllProjects();
    for (const project of allProjects) {
      await deleteProject(project.id);
    }
  });

  describe('Function Exports', () => {
    test('should export createProject function', () => {
      expect(createProject).toBeInstanceOf(Function);
    });

    test('should export getAllProjects function', () => {
      expect(getAllProjects).toBeInstanceOf(Function);
    });

    test('should export getProject function', () => {
      expect(getProject).toBeInstanceOf(Function);
    });

    test('should export updateProject function', () => {
      expect(updateProject).toBeInstanceOf(Function);
    });

    test('should export updatePhase function', () => {
      expect(updatePhase).toBeInstanceOf(Function);
    });

    test('should export deleteProject function', () => {
      expect(deleteProject).toBeInstanceOf(Function);
    });

    test('should export exportProject function', () => {
      expect(exportProject).toBeInstanceOf(Function);
    });

    test('should export exportAllProjects function', () => {
      expect(exportAllProjects).toBeInstanceOf(Function);
    });

    test('should export importProjects function', () => {
      expect(importProjects).toBeInstanceOf(Function);
    });
  });

  describe('importProjects', () => {
    test('should import a single project from JSON file', async () => {
      // Create a project to export
      const original = await createProject({
        dealershipName: 'Test Dealership',
        dealershipLocation: 'Seattle, WA',
        title: 'Test Proposal'
      });

      // Create a mock File object with the project JSON
      const jsonContent = JSON.stringify(original);
      const file = new File([jsonContent], 'project.json', { type: 'application/json' });

      // Delete the original
      await deleteProject(original.id);

      // Import from file
      const importedCount = await importProjects(file);

      expect(importedCount).toBe(1);

      // Verify it was imported
      const retrieved = await getProject(original.id);
      expect(retrieved).toBeTruthy();
      expect(retrieved.dealershipName).toBe('Test Dealership');
      expect(retrieved.dealershipLocation).toBe('Seattle, WA');
    });

    test('should import multiple projects from backup file', async () => {
      // Create multiple projects
      const project1 = await createProject({ dealershipName: 'Dealer 1', dealershipLocation: 'City 1' });
      const project2 = await createProject({ dealershipName: 'Dealer 2', dealershipLocation: 'City 2' });
      const project3 = await createProject({ dealershipName: 'Dealer 3', dealershipLocation: 'City 3' });

      // Create backup format
      const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        projectCount: 3,
        projects: [project1, project2, project3]
      };

      const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });

      // Delete all projects
      await deleteProject(project1.id);
      await deleteProject(project2.id);
      await deleteProject(project3.id);

      // Import from backup
      const importedCount = await importProjects(file);

      expect(importedCount).toBe(3);

      // Verify all were imported
      const allProjects = await getAllProjects();
      expect(allProjects.length).toBe(3);
    });

    test('should reject invalid file format', async () => {
      const invalidContent = JSON.stringify({ foo: 'bar' });
      const file = new File([invalidContent], 'invalid.json', { type: 'application/json' });

      await expect(importProjects(file)).rejects.toThrow('Invalid file format');
    });

    test('should reject non-JSON content', async () => {
      const file = new File(['not valid json'], 'bad.json', { type: 'application/json' });

      await expect(importProjects(file)).rejects.toThrow();
    });

    test('should handle empty backup file', async () => {
      const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        projectCount: 0,
        projects: []
      };

      const file = new File([JSON.stringify(backup)], 'empty-backup.json', { type: 'application/json' });

      const importedCount = await importProjects(file);
      expect(importedCount).toBe(0);
    });
  });

  describe('exportProject', () => {
    // Mock DOM APIs for export tests
    let mockCreateObjectURL;
    let mockRevokeObjectURL;
    let mockClick;
    let capturedBlob;
    let capturedDownloadName;

    beforeEach(() => {
      capturedBlob = null;
      capturedDownloadName = null;
      mockClick = jest.fn();

      mockCreateObjectURL = jest.fn((blob) => {
        capturedBlob = blob;
        return 'blob:mock-url';
      });
      mockRevokeObjectURL = jest.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      // Mock document.createElement to capture download filename
      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        const element = originalCreateElement(tag);
        if (tag === 'a') {
          Object.defineProperty(element, 'click', { value: mockClick });
          Object.defineProperty(element, 'download', {
            set: (value) => { capturedDownloadName = value; },
            get: () => capturedDownloadName
          });
        }
        return element;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should export a single project as JSON', async () => {
      const project = await createProject({
        dealershipName: 'Export Test Dealer',
        dealershipLocation: 'Portland, OR'
      });

      await exportProject(project.id);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(capturedBlob).toBeInstanceOf(Blob);
      expect(capturedBlob.type).toBe('application/json');
    });

    test('should throw error for non-existent project', async () => {
      await expect(exportProject('non-existent-id')).rejects.toThrow('Project not found');
    });
  });

  describe('exportAllProjects', () => {
    let mockCreateObjectURL;
    let mockRevokeObjectURL;
    let mockClick;
    let capturedBlob;
    let capturedDownloadName;

    beforeEach(() => {
      capturedBlob = null;
      capturedDownloadName = null;
      mockClick = jest.fn();

      mockCreateObjectURL = jest.fn((blob) => {
        capturedBlob = blob;
        return 'blob:mock-url';
      });
      mockRevokeObjectURL = jest.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        const element = originalCreateElement(tag);
        if (tag === 'a') {
          Object.defineProperty(element, 'click', { value: mockClick });
          Object.defineProperty(element, 'download', {
            set: (value) => { capturedDownloadName = value; },
            get: () => capturedDownloadName
          });
        }
        return element;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should export all projects as backup JSON', async () => {
      await createProject({ dealershipName: 'Dealer 1', dealershipLocation: 'City 1' });
      await createProject({ dealershipName: 'Dealer 2', dealershipLocation: 'City 2' });

      await exportAllProjects();

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(capturedBlob).toBeInstanceOf(Blob);
      expect(capturedBlob.type).toBe('application/json');

      // Verify backup structure using FileReader
      const blobText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(capturedBlob);
      });
      const backup = JSON.parse(blobText);
      expect(backup.version).toBe('1.0');
      expect(backup.exportedAt).toBeTruthy();
      expect(backup.projectCount).toBe(2);
      expect(backup.projects).toHaveLength(2);
    });

    test('should export empty backup when no projects exist', async () => {
      await exportAllProjects();

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(capturedBlob).toBeInstanceOf(Blob);

      // Verify backup structure using FileReader
      const blobText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(capturedBlob);
      });
      const backup = JSON.parse(blobText);
      expect(backup.projectCount).toBe(0);
      expect(backup.projects).toHaveLength(0);
    });

    test('should include correct filename with date', async () => {
      await exportAllProjects();

      expect(capturedDownloadName).toMatch(/^strategic-proposals-backup-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });
});
