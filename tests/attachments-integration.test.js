/**
 * Attachment Integration Tests
 * Tests handleFiles function and DOM interactions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    ATTACHMENT_CONFIG,
    validateFile,
    handleFiles,
    resetAttachmentTracking,
    getAttachmentStats
} from '../js/attachments.js';

// Helper to create mock File objects
function createMockFile(name, size, type = 'text/plain') {
    const content = 'x'.repeat(Math.min(size, 1000));
    const blob = new Blob([content], { type });
    const file = new File([blob], name, { type });
    Object.defineProperty(file, 'size', { value: size, writable: false });
    return file;
}

describe('Attachment Integration Tests', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="app-container"></div>
            <div id="toast-container"></div>
            <div id="file-list"></div>
            <textarea id="attachmentText"></textarea>
        `;
        resetAttachmentTracking();
        vi.clearAllMocks();
    });

    describe('handleFiles - Basic Integration', () => {
        it('should return processed count for valid files', () => {
            const files = [createMockFile('test.txt', 1024, 'text/plain')];
            const result = handleFiles(files);
            expect(result.processed).toBe(1);
            expect(result.errors).toHaveLength(0);
        });

        it('should return errors for invalid files', () => {
            const files = [createMockFile('bad.exe', 1024, 'application/x-executable')];
            const result = handleFiles(files);
            expect(result.processed).toBe(0);
            expect(result.errors).toHaveLength(1);
        });

        it('should add file items to file list', () => {
            const files = [createMockFile('doc.pdf', 1024, 'application/pdf')];
            handleFiles(files);
            const fileList = document.getElementById('file-list');
            expect(fileList.children).toHaveLength(1);
        });

        it('should update attachment stats', () => {
            resetAttachmentTracking();
            const files = [createMockFile('test.txt', 5000, 'text/plain')];
            handleFiles(files);
            const stats = getAttachmentStats();
            expect(stats.fileCount).toBe(1);
            expect(stats.totalSize).toBe(5000);
        });

        it('should handle error when DOM elements missing', () => {
            document.body.innerHTML = '<div id="toast-container"></div>';
            const files = [createMockFile('test.txt', 1024, 'text/plain')];
            const result = handleFiles(files);
            expect(result.errors).toContain('Form elements not found');
        });
    });

    describe('handleFiles - File Count Limits', () => {
        it('should reject files when max count exceeded', () => {
            resetAttachmentTracking();
            for (let i = 0; i < ATTACHMENT_CONFIG.maxFileCount; i++) {
                handleFiles([createMockFile(`file${i}.txt`, 100, 'text/plain')]);
            }
            const result = handleFiles([createMockFile('onemore.txt', 100, 'text/plain')]);
            expect(result.processed).toBe(0);
            expect(result.errors[0]).toContain('Maximum of 20 files');
        });
    });

    describe('handleFiles - Total Size Limits', () => {
        it('should reject file when total size would be exceeded', () => {
            resetAttachmentTracking();
            for (let i = 0; i < 5; i++) {
                handleFiles([createMockFile(`file${i}.txt`, 9 * 1024 * 1024, 'text/plain')]);
            }
            const result = handleFiles([createMockFile('toomuch.txt', 8 * 1024 * 1024, 'text/plain')]);
            expect(result.processed).toBe(0);
            expect(result.errors[0]).toContain('would exceed total attachment limit');
        });

        it('should accept file when it fits within total size limit', () => {
            resetAttachmentTracking();
            for (let i = 0; i < 5; i++) {
                handleFiles([createMockFile(`file${i}.txt`, 9 * 1024 * 1024, 'text/plain')]);
            }
            const result = handleFiles([createMockFile('fits.txt', 5 * 1024 * 1024, 'text/plain')]);
            expect(result.processed).toBe(1);
        });
    });

    describe('handleFiles - Remove Button Functionality', () => {
        it('should add remove button to each file item', () => {
            const files = [createMockFile('test.txt', 1024, 'text/plain')];
            handleFiles(files);
            const removeBtn = document.querySelector('.remove-file-btn');
            expect(removeBtn).not.toBeNull();
        });

        it('should remove file item when remove button clicked', () => {
            resetAttachmentTracking();
            handleFiles([createMockFile('test.txt', 1024, 'text/plain')]);
            const fileList = document.getElementById('file-list');
            expect(fileList.children).toHaveLength(1);
            const removeBtn = document.querySelector('.remove-file-btn');
            removeBtn.click();
            expect(fileList.children).toHaveLength(0);
        });

        it('should update stats when file removed', () => {
            resetAttachmentTracking();
            handleFiles([createMockFile('test.txt', 5000, 'text/plain')]);
            expect(getAttachmentStats().totalSize).toBe(5000);
            expect(getAttachmentStats().fileCount).toBe(1);
            document.querySelector('.remove-file-btn').click();
            expect(getAttachmentStats().totalSize).toBe(0);
            expect(getAttachmentStats().fileCount).toBe(0);
        });
    });

    describe('handleFiles - Multiple File Handling', () => {
        it('should process multiple valid files at once', () => {
            const files = [
                createMockFile('file1.txt', 1000, 'text/plain'),
                createMockFile('file2.txt', 2000, 'text/plain'),
                createMockFile('file3.pdf', 3000, 'application/pdf')
            ];
            const result = handleFiles(files);
            expect(result.processed).toBe(3);
            expect(result.stats.fileCount).toBe(3);
            expect(result.stats.totalSize).toBe(6000);
        });

        it('should handle mix of valid and invalid files', () => {
            const files = [
                createMockFile('good1.txt', 1000, 'text/plain'),
                createMockFile('bad.exe', 1000, 'application/x-executable'),
                createMockFile('good2.pdf', 2000, 'application/pdf'),
                createMockFile('bad.js', 500, 'application/javascript')
            ];
            const result = handleFiles(files);
            expect(result.processed).toBe(2);
            expect(result.errors).toHaveLength(2);
        });

        it('should create file list items for each valid file', () => {
            resetAttachmentTracking();
            const files = [
                createMockFile('a.txt', 100, 'text/plain'),
                createMockFile('b.txt', 200, 'text/plain'),
                createMockFile('c.pdf', 300, 'application/pdf')
            ];
            handleFiles(files);
            const fileList = document.getElementById('file-list');
            expect(fileList.children).toHaveLength(3);
        });
    });

    describe('handleFiles - File Display', () => {
        it('should display file name in file list', () => {
            handleFiles([createMockFile('mydocument.txt', 1024, 'text/plain')]);
            const fileList = document.getElementById('file-list');
            expect(fileList.innerHTML).toContain('mydocument.txt');
        });

        it('should display formatted file size', () => {
            handleFiles([createMockFile('test.txt', 5 * 1024 * 1024, 'text/plain')]);
            const fileList = document.getElementById('file-list');
            expect(fileList.innerHTML).toContain('5 MB');
        });

        it('should safely display file names with HTML characters', () => {
            handleFiles([createMockFile('file <name> & "quoted".txt', 1024, 'text/plain')]);
            const fileList = document.getElementById('file-list');
            const nameSpan = fileList.querySelector('span');
            expect(nameSpan.textContent).toBe('file <name> & "quoted".txt');
        });
    });

    describe('handleFiles - Duplicate Files', () => {
        it('should allow adding files with same name', () => {
            resetAttachmentTracking();
            handleFiles([createMockFile('report.txt', 1000, 'text/plain')]);
            handleFiles([createMockFile('report.txt', 1000, 'text/plain')]);
            expect(getAttachmentStats().fileCount).toBe(2);
        });
    });

    describe('Security - XSS Prevention', () => {
        it('should prevent HTML injection in file names', () => {
            const file = createMockFile('test<div onclick="alert(1)">click</div>.txt', 100, 'text/plain');
            handleFiles([file]);
            const fileList = document.getElementById('file-list');
            const divs = fileList.querySelectorAll('div');
            expect(divs.length).toBe(2);
        });

        it('should safely display file names with quotes and special characters', () => {
            const file = createMockFile('test" onmouseover="alert(1).txt', 100, 'text/plain');
            handleFiles([file]);
            const fileList = document.getElementById('file-list');
            const nameSpan = fileList.querySelector('span');
            expect(nameSpan.textContent).toBe('test" onmouseover="alert(1).txt');
            expect(fileList.innerHTML).toContain('test" onmouseover="alert(1).txt');
        });

        it('should not allow script execution through file names', () => {
            const file = createMockFile('<img src=x onerror=alert(1)>.txt', 100, 'text/plain');
            handleFiles([file]);
            const fileList = document.getElementById('file-list');
            expect(fileList.querySelector('img')).toBeNull();
        });
    });

    describe('Edge Cases - Boundary Conditions', () => {
        it('should handle exactly max file count', () => {
            resetAttachmentTracking();
            for (let i = 0; i < ATTACHMENT_CONFIG.maxFileCount; i++) {
                handleFiles([createMockFile(`f${i}.txt`, 100, 'text/plain')]);
            }
            expect(getAttachmentStats().fileCount).toBe(ATTACHMENT_CONFIG.maxFileCount);
        });

        it('should handle file at exactly 1 byte', () => {
            const file = createMockFile('tiny.txt', 1, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });

        it('should handle file at exactly max size', () => {
            const file = createMockFile('max.txt', ATTACHMENT_CONFIG.maxFileSize, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });

        it('should handle file 1 byte over max size', () => {
            const file = createMockFile('over.txt', ATTACHMENT_CONFIG.maxFileSize + 1, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(false);
        });
    });
});

