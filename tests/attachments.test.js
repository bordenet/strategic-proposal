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
} from '../js/attachments.js';

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
            // formatFileSize now delegates to formatBytes (no trailing zeros)
            expect(formatFileSize(1024)).toBe('1 KB');
            expect(formatFileSize(5120)).toBe('5 KB');
        });

        it('should format MB correctly', () => {
            // formatFileSize now delegates to formatBytes (no trailing zeros)
            expect(formatFileSize(1024 * 1024)).toBe('1 MB');
            expect(formatFileSize(5.5 * 1024 * 1024)).toBe('5.5 MB');
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
});
