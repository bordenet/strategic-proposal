/**
 * IndexedDB Storage Module
 * Handles all client-side data persistence for Strategic Proposal Generator
 */

const DB_NAME = 'strategic-proposal-db';
const DB_VERSION = 1;
const STORE_NAME = 'proposals';

class Storage {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Proposals store
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('updatedAt', 'updatedAt', { unique: false });
                    store.createIndex('title', 'title', { unique: false });
                    store.createIndex('phase', 'phase', { unique: false });
                    store.createIndex('dealershipName', 'dealershipName', { unique: false });
                }

                // Prompts store
                if (!db.objectStoreNames.contains('prompts')) {
                    db.createObjectStore('prompts', { keyPath: 'phase' });
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                // Attachments store (for PDF text content)
                if (!db.objectStoreNames.contains('attachments')) {
                    const attachStore = db.createObjectStore('attachments', { keyPath: 'id' });
                    attachStore.createIndex('proposalId', 'proposalId', { unique: false });
                }
            };
        });
    }

    async getAllProjects() {
        const tx = this.db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('updatedAt');
        
        return new Promise((resolve, reject) => {
            const request = index.openCursor(null, 'prev');
            const projects = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    projects.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(projects);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    async getProject(id) {
        const tx = this.db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveProject(project) {
        project.updatedAt = new Date().toISOString();
        
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        return new Promise((resolve, reject) => {
            const request = store.put(project);
            request.onsuccess = () => resolve(project);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteProject(id) {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getStorageEstimate() {
        if (navigator.storage && navigator.storage.estimate) {
            return await navigator.storage.estimate();
        }
        return null;
    }

    async getSetting(key) {
        const tx = this.db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');

        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result?.value);
            request.onerror = () => reject(request.error);
        });
    }

    async saveSetting(key, value) {
        const tx = this.db.transaction('settings', 'readwrite');
        const store = tx.objectStore('settings');

        return new Promise((resolve, reject) => {
            const request = store.put({ key, value });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

export default new Storage();

