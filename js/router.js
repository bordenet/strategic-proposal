/**
 * Router Module
 * Handles client-side routing for multi-project navigation
 */

import { renderProjectsList, renderNewProjectForm } from './views.js';
import { renderProjectView } from './project-view.js';

const routes = {
    'home': renderProjectsList,
    'new-project': renderNewProjectForm,
    'project': renderProjectView
};

let currentRoute = null;
let currentParams = null;

export function navigateTo(route, ...params) {
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
        handler(...params);
    } else {
        navigateTo('home');
    }
}

export function initRouter() {
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
}

function handleHashChange() {
    const hash = window.location.hash.slice(1);
    
    if (!hash) {
        navigateTo('home');
    } else if (hash === 'new') {
        navigateTo('new-project');
    } else if (hash.startsWith('project/')) {
        const projectId = hash.split('/')[1];
        navigateTo('project', projectId);
    } else {
        navigateTo('home');
    }
}

export function getCurrentRoute() {
    return { route: currentRoute, params: currentParams };
}

