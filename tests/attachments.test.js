/**
 * Attachment Handling Tests - Exhaustive Coverage
 * Tests file uploads, validation, edge cases, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    ATTACHMENT_CONFIG,
    validateFile,
    validateFiles,
    formatFileSize,
    handleFiles,
    resetAttachmentTracking,
    getAttachmentStats
} from '../js/views.js';

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

// Helper to create mock File objects
function createMockFile(name, size, type = 'text/plain') {
    const content = 'x'.repeat(Math.min(size, 1000)); // Content for small files
    const blob = new Blob([content], { type });
    const file = new File([blob], name, { type });
    // Override size for testing large files
    Object.defineProperty(file, 'size', { value: size, writable: false });
    return file;
}

describe('Attachment Handling', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="app-container"></div>
            <div id="toast-container"></div>
            <div id="file-list"></div>
            <textarea id="attachmentText"></textarea>
        `;
        resetAttachmentTracking();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('ATTACHMENT_CONFIG', () => {
        it('should have correct max file size (10MB)', () => {
            expect(ATTACHMENT_CONFIG.maxFileSize).toBe(10 * 1024 * 1024);
        });

        it('should have correct max total size (50MB)', () => {
            expect(ATTACHMENT_CONFIG.maxTotalSize).toBe(50 * 1024 * 1024);
        });

        it('should have correct max file count (20)', () => {
            expect(ATTACHMENT_CONFIG.maxFileCount).toBe(20);
        });

        it('should allow PDF and TXT files only', () => {
            expect(ATTACHMENT_CONFIG.allowedTypes).toContain('application/pdf');
            expect(ATTACHMENT_CONFIG.allowedTypes).toContain('text/plain');
            expect(ATTACHMENT_CONFIG.allowedTypes).toHaveLength(2);
        });

        it('should have correct allowed extensions', () => {
            expect(ATTACHMENT_CONFIG.allowedExtensions).toContain('.pdf');
            expect(ATTACHMENT_CONFIG.allowedExtensions).toContain('.txt');
            expect(ATTACHMENT_CONFIG.allowedExtensions).toHaveLength(2);
        });
    });

    describe('formatFileSize', () => {
        it('should format 0 bytes correctly', () => {
            expect(formatFileSize(0)).toBe('0 Bytes');
        });

        it('should format bytes correctly', () => {
            expect(formatFileSize(500)).toBe('500 Bytes');
        });

        it('should format KB correctly', () => {
            expect(formatFileSize(1024)).toBe('1.0 KB');
            expect(formatFileSize(5120)).toBe('5.0 KB');
        });

        it('should format MB correctly', () => {
            expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
            expect(formatFileSize(5.5 * 1024 * 1024)).toBe('5.50 MB');
        });
    });

    describe('validateFile - Basic Validation', () => {
        it('should reject null/undefined files', () => {
            expect(validateFile(null).valid).toBe(false);
            expect(validateFile(undefined).valid).toBe(false);
            expect(validateFile(null).error).toBe('No file provided');
        });

        it('should accept valid text file', () => {
            const file = createMockFile('test.txt', 1024, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should accept valid PDF file', () => {
            const file = createMockFile('document.pdf', 1024, 'application/pdf');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });
    });

    describe('validateFile - File Size Limits', () => {
        it('should reject empty files (0 bytes)', () => {
            const file = createMockFile('empty.txt', 0, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('is empty');
        });

        it('should accept file at exactly max size', () => {
            const file = createMockFile('maxsize.txt', ATTACHMENT_CONFIG.maxFileSize, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });

        it('should reject file exceeding max size', () => {
            const file = createMockFile('toolarge.txt', ATTACHMENT_CONFIG.maxFileSize + 1, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('exceeds maximum size');
            expect(result.error).toContain('10MB');
        });

        it('should include file size in error message', () => {
            const file = createMockFile('huge.txt', 15 * 1024 * 1024, 'text/plain');
            const result = validateFile(file);
            expect(result.error).toContain('15.00MB');
        });
    });

    describe('validateFile - File Type Restrictions', () => {
        it('should reject .exe files', () => {
            const file = createMockFile('virus.exe', 1024, 'application/x-executable');
            const result = validateFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('.exe');
            expect(result.error).toContain('not allowed');
        });

        it('should reject .js files', () => {
            const file = createMockFile('script.js', 1024, 'application/javascript');
            const result = validateFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('.js');
        });

        it('should reject .html files', () => {
            const file = createMockFile('page.html', 1024, 'text/html');
            const result = validateFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('.html');
        });

        it('should reject .docx files (Word documents)', () => {
            const file = createMockFile('document.docx', 1024, 'application/vnd.openxmlformats');
            const result = validateFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('.docx');
        });

        it('should reject image files', () => {
            const file = createMockFile('photo.jpg', 1024, 'image/jpeg');
            const result = validateFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('.jpg');
        });

        it('should show allowed extensions in error message', () => {
            const file = createMockFile('bad.xyz', 1024, 'application/octet-stream');
            const result = validateFile(file);
            expect(result.error).toContain('.pdf');
            expect(result.error).toContain('.txt');
        });
    });

    describe('validateFile - Edge Cases', () => {
        it('should handle files with multiple extensions', () => {
            const file = createMockFile('file.tar.txt', 1024, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });

        it('should handle files with uppercase extensions', () => {
            const file = createMockFile('DOCUMENT.PDF', 1024, 'application/pdf');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });

        it('should handle files with mixed case extensions', () => {
            const file = createMockFile('notes.TxT', 1024, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });

        it('should handle files with spaces in name', () => {
            const file = createMockFile('my document.txt', 1024, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });

        it('should handle files with special characters in name', () => {
            const file = createMockFile('report (2023-final).pdf', 1024, 'application/pdf');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });

        it('should handle files with unicode characters in name', () => {
            const file = createMockFile('报告.pdf', 1024, 'application/pdf');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });

        it('should handle files with very long names', () => {
            const longName = 'a'.repeat(200) + '.txt';
            const file = createMockFile(longName, 1024, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });

        it('should handle file with no extension', () => {
            const file = createMockFile('README', 1024, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('not allowed');
        });

        it('should handle file with only extension', () => {
            const file = createMockFile('.txt', 1024, 'text/plain');
            const result = validateFile(file);
            expect(result.valid).toBe(true);
        });
    });

    describe('validateFiles - Batch Validation', () => {
        it('should validate empty file list', () => {
            const result = validateFiles([]);
            expect(result.valid).toHaveLength(0);
            expect(result.invalid).toHaveLength(0);
        });

        it('should separate valid and invalid files', () => {
            const files = [
                createMockFile('good.txt', 1024, 'text/plain'),
                createMockFile('bad.exe', 1024, 'application/x-executable'),
                createMockFile('ok.pdf', 1024, 'application/pdf')
            ];
            const result = validateFiles(files);
            expect(result.valid).toHaveLength(2);
            expect(result.invalid).toHaveLength(1);
            expect(result.invalid[0].error).toContain('.exe');
        });

        it('should preserve file order in results', () => {
            const files = [
                createMockFile('first.txt', 1024, 'text/plain'),
                createMockFile('second.txt', 2048, 'text/plain'),
                createMockFile('third.txt', 3072, 'text/plain')
            ];
            const result = validateFiles(files);
            expect(result.valid[0].name).toBe('first.txt');
            expect(result.valid[1].name).toBe('second.txt');
            expect(result.valid[2].name).toBe('third.txt');
        });
    });

    describe('Attachment Tracking', () => {
        it('should reset tracking correctly', () => {
            resetAttachmentTracking();
            const stats = getAttachmentStats();
            expect(stats.totalSize).toBe(0);
            expect(stats.fileCount).toBe(0);
        });

        it('should calculate remaining capacity', () => {
            resetAttachmentTracking();
            const stats = getAttachmentStats();
            expect(stats.remainingSize).toBe(ATTACHMENT_CONFIG.maxTotalSize);
            expect(stats.remainingCount).toBe(ATTACHMENT_CONFIG.maxFileCount);
        });
    });

    describe('handleFiles - Integration', () => {
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
            // Keep toast container but remove file-list and attachmentText
            document.body.innerHTML = '<div id="toast-container"></div>';
            const files = [createMockFile('test.txt', 1024, 'text/plain')];
            const result = handleFiles(files);
            expect(result.errors).toContain('Form elements not found');
        });
    });

    describe('handleFiles - File Count Limits', () => {
        it('should reject files when max count exceeded', () => {
            resetAttachmentTracking();
            // Add files up to limit
            for (let i = 0; i < ATTACHMENT_CONFIG.maxFileCount; i++) {
                handleFiles([createMockFile(`file${i}.txt`, 100, 'text/plain')]);
            }
            // Try to add one more
            const result = handleFiles([createMockFile('onemore.txt', 100, 'text/plain')]);
            expect(result.processed).toBe(0);
            expect(result.errors[0]).toContain('Maximum of 20 files');
        });
    });

    describe('handleFiles - Total Size Limits', () => {
        it('should reject file when total size would be exceeded', () => {
            resetAttachmentTracking();
            // Add multiple files to get close to total limit (50MB)
            // Each file is 9MB (under the 10MB per-file limit)
            for (let i = 0; i < 5; i++) {
                handleFiles([createMockFile(`file${i}.txt`, 9 * 1024 * 1024, 'text/plain')]);
            }
            // Now at 45MB, try to add 8MB more (would make 53MB, over 50MB limit)
            const result = handleFiles([createMockFile('toomuch.txt', 8 * 1024 * 1024, 'text/plain')]);
            expect(result.processed).toBe(0);
            expect(result.errors[0]).toContain('would exceed total attachment limit');
        });

        it('should accept file when it fits within total size limit', () => {
            resetAttachmentTracking();
            // Add 45MB worth
            for (let i = 0; i < 5; i++) {
                handleFiles([createMockFile(`file${i}.txt`, 9 * 1024 * 1024, 'text/plain')]);
            }
            // Add 5MB more (50MB total, exactly at limit)
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
            expect(fileList.innerHTML).toContain('5.00 MB');
        });

        it('should safely display file names with HTML characters', () => {
            // Use angle brackets and ampersands (avoiding closing tags that happy-dom mangles)
            handleFiles([createMockFile('file <name> & "quoted".txt', 1024, 'text/plain')]);
            const fileList = document.getElementById('file-list');
            // Should use textContent which preserves the exact string
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
            // Use div instead of script (happy-dom mangles script tags)
            const file = createMockFile('test<div onclick="alert(1)">click</div>.txt', 100, 'text/plain');
            handleFiles([file]);
            const fileList = document.getElementById('file-list');
            // No injected div should be created
            const divs = fileList.querySelectorAll('div');
            // Only our wrapper divs should exist, no injected ones
            expect(divs.length).toBe(2); // file item wrapper + info div
        });

        it('should safely display file names with quotes and special characters', () => {
            const file = createMockFile('test" onmouseover="alert(1).txt', 100, 'text/plain');
            handleFiles([file]);
            const fileList = document.getElementById('file-list');
            // The textContent should preserve the exact file name
            const nameSpan = fileList.querySelector('span');
            expect(nameSpan.textContent).toBe('test" onmouseover="alert(1).txt');
            // But innerHTML will have it escaped
            expect(fileList.innerHTML).toContain('test" onmouseover="alert(1).txt');
        });

        it('should not allow script execution through file names', () => {
            const file = createMockFile('<img src=x onerror=alert(1)>.txt', 100, 'text/plain');
            handleFiles([file]);
            const fileList = document.getElementById('file-list');
            // No actual img element should be created
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

