/**
 * App Module Tests
 * Tests application initialization, theme toggle, and global event handlers
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Set up localStorage mock BEFORE any imports
const localStorageMock = {
    store: {},
    getItem: vi.fn((key) => localStorageMock.store[key] || null),
    setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
    removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
    clear: vi.fn(() => { localStorageMock.store = {}; })
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// Mock dependencies before importing app
vi.mock('../js/storage.js', () => ({
    default: {
        init: vi.fn().mockResolvedValue(true),
        getSetting: vi.fn().mockResolvedValue(null),
        saveSetting: vi.fn().mockResolvedValue(true),
        getStorageEstimate: vi.fn().mockResolvedValue({ usage: 1024, quota: 1024 * 1024 })
    }
}));

vi.mock('../js/router.js', () => ({
    initRouter: vi.fn()
}));

vi.mock('../js/workflow.js', () => ({
    loadDefaultPrompts: vi.fn().mockResolvedValue(true)
}));

vi.mock('../js/projects.js', () => ({
    exportAllProjects: vi.fn().mockResolvedValue(true),
    importProjects: vi.fn().mockResolvedValue(2)
}));

vi.mock('../js/ui.js', () => ({
    showToast: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    formatBytes: vi.fn(b => `${b} bytes`)
}));

import storage from '../js/storage.js';
import { initRouter } from '../js/router.js';
import { loadDefaultPrompts } from '../js/workflow.js';
import { exportAllProjects } from '../js/projects.js';
import { showToast, showLoading, hideLoading } from '../js/ui.js';

describe('App Module', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <html>
            <body>
                <div id="app-container"></div>
                <button id="theme-toggle"></button>
                <button id="export-all-btn"></button>
                <button id="import-btn"></button>
                <button id="close-proprietary-warning"></button>
                <div id="proprietary-warning"></div>
                <a id="about-link" href="#">About</a>
                <span id="storage-info"></span>
                <div id="toast-container"></div>
            </body>
            </html>
        `;
        vi.clearAllMocks();
        vi.resetModules();
        localStorageMock.store = {};
    });

    afterEach(() => {
        document.documentElement.classList.remove('dark');
    });

    describe('App Initialization', () => {
        it('should import app module and trigger initialization', async () => {
            // Dynamically import to trigger side effects
            await import('../js/app.js');
            // Wait for async init to complete
            await vi.waitFor(() => expect(storage.init).toHaveBeenCalled());
            expect(loadDefaultPrompts).toHaveBeenCalled();
            expect(initRouter).toHaveBeenCalled();
        });

        it('should show loading during initialization', async () => {
            await import('../js/app.js');
            await vi.waitFor(() => expect(showLoading).toHaveBeenCalledWith('Initializing...'));
        });

        it('should hide loading after initialization', async () => {
            await import('../js/app.js');
            await vi.waitFor(() => expect(hideLoading).toHaveBeenCalled());
        });

        it('should handle initialization error', async () => {
            storage.init.mockRejectedValueOnce(new Error('DB Error'));
            await import('../js/app.js');
            await vi.waitFor(() => expect(showToast).toHaveBeenCalledWith(
                'Failed to initialize app. Please refresh the page.',
                'error',
                5000
            ));
        });
    });

    describe('Theme Toggle', () => {
        it('should toggle theme when button clicked', async () => {
            await import('../js/app.js');
            await vi.waitFor(() => expect(storage.init).toHaveBeenCalled());

            const themeBtn = document.getElementById('theme-toggle');
            themeBtn.click();

            // Should toggle to dark
            expect(document.documentElement.classList.contains('dark')).toBe(true);
        });
    });

    describe('Export All Button', () => {
        it('should export all projects when clicked', async () => {
            await import('../js/app.js');
            await vi.waitFor(() => expect(storage.init).toHaveBeenCalled());

            const exportBtn = document.getElementById('export-all-btn');
            exportBtn.click();

            await vi.waitFor(() => expect(exportAllProjects).toHaveBeenCalled());
        });

        it('should show success toast after export', async () => {
            await import('../js/app.js');
            await vi.waitFor(() => expect(storage.init).toHaveBeenCalled());

            const exportBtn = document.getElementById('export-all-btn');
            exportBtn.click();

            await vi.waitFor(() => expect(showToast).toHaveBeenCalledWith(
                'All proposals exported successfully!',
                'success'
            ));
        });
    });

    describe('Proprietary Warning', () => {
        it('should remove warning when dismissed', async () => {
            await import('../js/app.js');
            await vi.waitFor(() => expect(storage.init).toHaveBeenCalled());

            const closeBtn = document.getElementById('close-proprietary-warning');
            closeBtn.click();

            expect(document.getElementById('proprietary-warning')).toBeNull();
        });

        it('should save dismissal to storage', async () => {
            await import('../js/app.js');
            await vi.waitFor(() => expect(storage.init).toHaveBeenCalled());

            const closeBtn = document.getElementById('close-proprietary-warning');
            closeBtn.click();

            expect(storage.saveSetting).toHaveBeenCalledWith('proprietary-warning-dismissed', true);
        });

        it('should auto-remove warning if previously dismissed', async () => {
            storage.getSetting.mockResolvedValueOnce(true);
            await import('../js/app.js');
            await vi.waitFor(() => expect(storage.getSetting).toHaveBeenCalledWith('proprietary-warning-dismissed'));
        });
    });

    describe('About Modal', () => {
        it('should show about modal when link clicked', async () => {
            await import('../js/app.js');
            await vi.waitFor(() => expect(storage.init).toHaveBeenCalled());

            const aboutLink = document.getElementById('about-link');
            aboutLink.click();

            // Modal should be added to body
            const modal = document.querySelector('.fixed.inset-0');
            expect(modal).not.toBeNull();
        });

        it('should close about modal when close button clicked', async () => {
            await import('../js/app.js');
            await vi.waitFor(() => expect(storage.init).toHaveBeenCalled());

            const aboutLink = document.getElementById('about-link');
            aboutLink.click();

            const closeBtn = document.getElementById('close-about-btn');
            closeBtn.click();

            const modal = document.querySelector('.fixed.inset-0');
            expect(modal).toBeNull();
        });
    });
});

