/**
 * UI Module Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    showToast, 
    showLoading, 
    hideLoading, 
    confirm, 
    formatDate, 
    formatBytes, 
    escapeHtml, 
    copyToClipboard 
} from '../js/ui.js';

describe('escapeHtml', () => {
    it('should handle empty strings', () => {
        expect(escapeHtml('')).toBe('');
    });

    it('should handle plain text', () => {
        expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    it('should escape HTML special characters', () => {
        // Test actual escaping of dangerous characters
        const escaped = escapeHtml('<script>alert("xss")</script>');
        expect(escaped).not.toContain('<script>');
        expect(escaped).not.toContain('</script>');
        // Should contain the escaped entities
        expect(escaped.includes('&lt;') || escaped.includes('&amp;')).toBe(true);
    });

    it('should escape ampersands and quotes', () => {
        const escaped = escapeHtml('Tom & Jerry "quoted" text');
        expect(escaped).not.toBe('Tom & Jerry "quoted" text');
        expect(escaped).toContain('&amp;');
    });
});

describe('formatDate', () => {
    it('should return "Just now" for recent dates', () => {
        const now = new Date();
        expect(formatDate(now.toISOString())).toBe('Just now');
    });

    it('should format minutes ago', () => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        expect(formatDate(fiveMinutesAgo.toISOString())).toBe('5 minutes ago');
    });

    it('should format single minute correctly', () => {
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        expect(formatDate(oneMinuteAgo.toISOString())).toBe('1 minute ago');
    });

    it('should format hours ago', () => {
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        expect(formatDate(threeHoursAgo.toISOString())).toBe('3 hours ago');
    });

    it('should format days ago', () => {
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        expect(formatDate(twoDaysAgo.toISOString())).toBe('2 days ago');
    });
});

describe('formatBytes', () => {
    it('should format 0 bytes', () => {
        expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
        expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
        expect(formatBytes(1024)).toBe('1 KB');
        expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
        expect(formatBytes(1048576)).toBe('1 MB');
    });
});

describe('showToast', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="toast-container"></div>';
    });

    it('should create toast element', () => {
        showToast('Test message', 'info');
        const toast = document.querySelector('#toast-container > div');
        expect(toast).not.toBeNull();
        expect(toast.textContent).toContain('Test message');
    });

    it('should use correct color for success type', () => {
        showToast('Success!', 'success');
        const toast = document.querySelector('#toast-container > div');
        expect(toast.className).toContain('bg-green-500');
    });

    it('should use correct color for error type', () => {
        showToast('Error!', 'error');
        const toast = document.querySelector('#toast-container > div');
        expect(toast.className).toContain('bg-red-500');
    });
});

describe('showLoading/hideLoading', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="loading-overlay" class="hidden">
                <span id="loading-text">Loading...</span>
            </div>
        `;
    });

    it('should show loading overlay', () => {
        showLoading('Please wait...');
        const overlay = document.getElementById('loading-overlay');
        expect(overlay.classList.contains('hidden')).toBe(false);
        expect(document.getElementById('loading-text').textContent).toBe('Please wait...');
    });

    it('should hide loading overlay', () => {
        showLoading();
        hideLoading();
        const overlay = document.getElementById('loading-overlay');
        expect(overlay.classList.contains('hidden')).toBe(true);
    });
});

describe('confirm', () => {
    it('should resolve true when confirm button clicked', async () => {
        const confirmPromise = confirm('Test Title', 'Test message', 'OK', 'Cancel');
        
        // Wait for modal to be added to DOM
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const confirmBtn = document.getElementById('confirm-btn');
        confirmBtn.click();
        
        const result = await confirmPromise;
        expect(result).toBe(true);
    });

    it('should resolve false when cancel button clicked', async () => {
        const confirmPromise = confirm('Test Title', 'Test message');
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const cancelBtn = document.getElementById('cancel-btn');
        cancelBtn.click();
        
        const result = await confirmPromise;
        expect(result).toBe(false);
    });
});

