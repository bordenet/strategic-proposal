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
  importProjects,
  extractTitleFromMarkdown
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

  describe('extractTitleFromMarkdown', () => {
    test('should return empty string for null input', () => {
      expect(extractTitleFromMarkdown(null)).toBe('');
    });

    test('should return empty string for empty input', () => {
      expect(extractTitleFromMarkdown('')).toBe('');
    });

    test('should extract H1 header', () => {
      const md = '# My Document Title\n\nSome content here.';
      expect(extractTitleFromMarkdown(md)).toBe('My Document Title');
    });

    test('should skip PRESS RELEASE header', () => {
      const md = '# PRESS RELEASE\n\n**Exciting Headline Here**\n\nContent...';
      expect(extractTitleFromMarkdown(md)).toBe('Exciting Headline Here');
    });

    test('should extract bold headline after PRESS RELEASE', () => {
      const md = '# PRESS RELEASE\n**Company Announces New Feature**\n\nDetails follow.';
      expect(extractTitleFromMarkdown(md)).toBe('Company Announces New Feature');
    });

    test('should extract first bold line as fallback', () => {
      const md = 'Some text\n**This Is A Good Headline Title**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('This Is A Good Headline Title');
    });

    test('should reject too-short bold text', () => {
      const md = '**Short**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('');
    });

    test('should reject bold text ending with period (sentences)', () => {
      const md = '**This is a sentence ending with period.**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('');
    });
  });

  describe('updatePhase', () => {
    test('should update phase with prompt and response', async () => {
      const project = await createProject({
        dealershipName: 'Test Dealer',
        dealershipLocation: 'Seattle, WA'
      });

      const updated = await updatePhase(project.id, 1, 'Test prompt', 'Test response');

      expect(updated.phases[1].prompt).toBe('Test prompt');
      expect(updated.phases[1].response).toBe('Test response');
      expect(updated.phases[1].completed).toBe(true);
      expect(updated.phase1_output).toBe('Test response');
    });

    test('should auto-advance to next phase', async () => {
      const project = await createProject({
        dealershipName: 'Test Dealer',
        dealershipLocation: 'Seattle, WA'
      });

      const updated = await updatePhase(project.id, 1, 'Prompt', 'Response');
      expect(updated.phase).toBe(2);
    });

    test('should not auto-advance when skipAutoAdvance is true', async () => {
      const project = await createProject({
        dealershipName: 'Test Dealer',
        dealershipLocation: 'Seattle, WA'
      });

      const updated = await updatePhase(project.id, 1, 'Prompt', 'Response', { skipAutoAdvance: true });
      expect(updated.phase).toBe(1);
    });

    test('should extract title from phase 3 response', async () => {
      const project = await createProject({
        dealershipName: 'Test Dealer',
        dealershipLocation: 'Seattle, WA'
      });

      await updatePhase(project.id, 1, 'P1', 'R1');
      await updatePhase(project.id, 2, 'P2', 'R2');
      const updated = await updatePhase(project.id, 3, 'P3', '# Amazing Proposal Title\n\nContent here.');

      expect(updated.title).toBe('Amazing Proposal Title');
    });

    test('should throw error for non-existent project', async () => {
      await expect(updatePhase('non-existent', 1, 'P', 'R')).rejects.toThrow('Project not found');
    });
  });

  describe('updateProject', () => {
    test('should update project with partial data', async () => {
      const project = await createProject({
        dealershipName: 'Original Dealer',
        dealershipLocation: 'Seattle, WA'
      });

      const updated = await updateProject(project.id, {
        dealershipName: 'Updated Dealer',
        painPoints: 'New pain points'
      });

      expect(updated.dealershipName).toBe('Updated Dealer');
      expect(updated.painPoints).toBe('New pain points');
      expect(updated.dealershipLocation).toBe('Seattle, WA');
    });

    test('should throw error for non-existent project', async () => {
      await expect(updateProject('non-existent', { title: 'X' })).rejects.toThrow('Project not found');
    });
  });
});
