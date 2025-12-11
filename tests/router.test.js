/**
 * Router Module Tests
 * Tests client-side routing, navigation, and hash change handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the view modules before importing router
vi.mock('../js/views.js', () => ({
    renderProjectsList: vi.fn(),
    renderNewProjectForm: vi.fn()
}));

vi.mock('../js/project-view.js', () => ({
    renderProjectView: vi.fn()
}));

import { navigateTo, initRouter, getCurrentRoute } from '../js/router.js';
import { renderProjectsList, renderNewProjectForm } from '../js/views.js';
import { renderProjectView } from '../js/project-view.js';

describe('Router Module', () => {
    beforeEach(() => {
        // Reset hash and mocks
        window.location.hash = '';
        vi.clearAllMocks();
    });

    afterEach(() => {
        window.location.hash = '';
    });

    describe('navigateTo', () => {
        it('should navigate to home route', () => {
            navigateTo('home');
            expect(window.location.hash).toBe('');
            expect(renderProjectsList).toHaveBeenCalled();
        });

        it('should navigate to new-project route', () => {
            navigateTo('new-project');
            expect(window.location.hash).toBe('#new');
            expect(renderNewProjectForm).toHaveBeenCalled();
        });

        it('should navigate to project route with id', () => {
            navigateTo('project', 'abc123');
            expect(window.location.hash).toBe('#project/abc123');
            expect(renderProjectView).toHaveBeenCalledWith('abc123');
        });

        it('should fallback to home for unknown route', () => {
            navigateTo('unknown-route');
            expect(renderProjectsList).toHaveBeenCalled();
        });

        it('should handle project route without id', () => {
            navigateTo('project');
            // Without params[0], hash won't be set to project/
            expect(renderProjectView).toHaveBeenCalled();
        });
    });

    describe('getCurrentRoute', () => {
        it('should return current route after navigation', () => {
            navigateTo('new-project');
            const current = getCurrentRoute();
            expect(current.route).toBe('new-project');
            expect(current.params).toEqual([]);
        });

        it('should return route params for project', () => {
            navigateTo('project', 'proj-456');
            const current = getCurrentRoute();
            expect(current.route).toBe('project');
            expect(current.params).toEqual(['proj-456']);
        });
    });

    describe('initRouter', () => {
        it('should add hashchange listener', () => {
            const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
            initRouter();
            expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
            addEventListenerSpy.mockRestore();
        });

        it('should handle initial empty hash', () => {
            window.location.hash = '';
            initRouter();
            expect(renderProjectsList).toHaveBeenCalled();
        });

        it('should handle initial #new hash', () => {
            window.location.hash = '#new';
            vi.clearAllMocks();
            initRouter();
            expect(renderNewProjectForm).toHaveBeenCalled();
        });

        it('should handle initial project hash', () => {
            window.location.hash = '#project/xyz789';
            vi.clearAllMocks();
            initRouter();
            expect(renderProjectView).toHaveBeenCalledWith('xyz789');
        });
    });

    describe('hash change handling', () => {
        beforeEach(() => {
            initRouter();
            vi.clearAllMocks();
        });

        it('should handle hash change to empty', () => {
            window.location.hash = '#new';
            vi.clearAllMocks();
            window.location.hash = '';
            window.dispatchEvent(new HashChangeEvent('hashchange'));
            expect(renderProjectsList).toHaveBeenCalled();
        });

        it('should handle hash change to #new', () => {
            window.location.hash = '';
            vi.clearAllMocks();
            window.location.hash = '#new';
            window.dispatchEvent(new HashChangeEvent('hashchange'));
            expect(renderNewProjectForm).toHaveBeenCalled();
        });

        it('should handle hash change to project', () => {
            window.location.hash = '';
            vi.clearAllMocks();
            window.location.hash = '#project/test-id';
            window.dispatchEvent(new HashChangeEvent('hashchange'));
            expect(renderProjectView).toHaveBeenCalledWith('test-id');
        });

        it('should fallback to home for unknown hash', () => {
            window.location.hash = '#unknown/path';
            window.dispatchEvent(new HashChangeEvent('hashchange'));
            expect(renderProjectsList).toHaveBeenCalled();
        });
    });
});

