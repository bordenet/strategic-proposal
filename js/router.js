/**
 * Router Module
 * Handles client-side routing for multi-project navigation
 */

import { renderProjectsList, renderNewProjectForm } from './views.js';
import { renderProjectView } from './project-view.js';
import storage from './storage.js';

const routes = {
    'home': renderProjectsList,
    'new-project': renderNewProjectForm,
    'project': renderProjectView
};

let currentRoute = null;
let currentParams = null;

/**
 * Update storage info in footer
 * Ensures footer always reflects current project count
 */
export async function updateStorageInfo() {
    try {
        const estimate = await storage.getStorageEstimate();
        const projects = await storage.getAllProjects();

        const storageInfo = document.getElementById('storage-info');
        if (storageInfo) {
            if (estimate) {
                const usedMB = (estimate.usage / (1024 * 1024)).toFixed(1);
                const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0);
                storageInfo.textContent = `${projects.length} proposals • ${usedMB}MB used of ${quotaMB}MB`;
            } else {
                storageInfo.textContent = `${projects.length} proposals stored locally`;
            }
        }
    } catch (error) {
        console.error('Failed to update storage info:', error);
    }
}

export async function navigateTo(route, ...params) {
    currentRoute = route;
    currentParams = params;

    if (route === 'home') {
        window.location.hash = '';
    } else if (route === 'new-project') {
        window.location.hash = '#new';
    } else if (route === 'project' && params[0]) {
        window.location.hash = `#project/${params[0]}`;
    }

    const handler = routes[route];
    if (handler) {
        await handler(...params);
    } else {
        await navigateTo('home');
    }

    // Always update footer after route render
    await updateStorageInfo();
}

export function initRouter() {
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
}

async function handleHashChange() {
    const hash = window.location.hash.slice(1);

    if (!hash) {
        await navigateTo('home');
    } else if (hash === 'new') {
        await navigateTo('new-project');
    } else if (hash.startsWith('project/')) {
        const projectId = hash.split('/')[1];
        await navigateTo('project', projectId);
    } else {
        await navigateTo('home');
    }
}

export function getCurrentRoute() {
    return { route: currentRoute, params: currentParams };
}

