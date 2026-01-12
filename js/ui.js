/**
 * UI Utilities Module
 * Handles common UI operations like toasts, modals, loading states
 * @module ui
 */

/** @type {Object.<import('./types.js').ToastType, string>} */
const TOAST_COLORS = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
};

/** @type {Object.<import('./types.js').ToastType, string>} */
const TOAST_ICONS = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
};

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {import('./types.js').ToastType} [type='info'] - Toast type
 * @param {number} [duration=3000] - Duration in milliseconds
 * @returns {void}
 */
export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `${TOAST_COLORS[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 translate-x-full`;
    toast.innerHTML = `
        <span class="text-xl">${TOAST_ICONS[type]}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.classList.remove('translate-x-full'), 10);
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Show loading overlay
 * @param {string} [text='Loading...'] - Loading text to display
 * @returns {void}
 */
export function showLoading(text = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    if (loadingText) loadingText.textContent = text;
    if (overlay) overlay.classList.remove('hidden');
}

/**
 * Hide loading overlay
 * @returns {void}
 */
export function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
}

/**
 * Show a confirmation dialog
 * @param {string} [title='Confirm'] - Dialog title
 * @param {string} [message=''] - Dialog message
 * @param {string} [confirmLabel='Confirm'] - Confirm button label
 * @param {string} [cancelLabel='Cancel'] - Cancel button label
 * @returns {Promise<boolean>} True if confirmed, false if cancelled
 */
export function confirm(title = 'Confirm', message = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md shadow-xl">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">${escapeHtml(title)}</h3>
                <p class="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">${escapeHtml(message)}</p>
                <div class="flex justify-end space-x-3">
                    <button id="cancel-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                        ${escapeHtml(cancelLabel)}
                    </button>
                    <button id="confirm-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        ${escapeHtml(confirmLabel)}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#confirm-btn')?.addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });

        modal.querySelector('#cancel-btn')?.addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        });
    });
}

/**
 * Format an ISO date string as a relative time
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Formatted relative time
 */
export function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format bytes as human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Escape HTML special characters
 * @param {string | null | undefined} text - Text to escape
 * @returns {string} Escaped HTML string
 */
export function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
        return true;
    } catch (error) {
        showToast('Failed to copy to clipboard', 'error');
        return false;
    }
}

/**
 * Show a modal with the full prompt text
 * @param {string} prompt - The prompt text to display
 * @param {string} [title='Full Prompt'] - Modal title
 * @returns {void}
 */
export function showPromptModal(prompt, title = 'Full Prompt') {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">${title}</h3>
                <button id="close-prompt-modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400">✕</button>
            </div>
            <div class="flex-1 overflow-auto p-4">
                <pre class="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">${escapeHtml(prompt)}</pre>
            </div>
            <div class="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button id="copy-modal-prompt" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">📋 Copy</button>
                <button id="close-modal-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelector('#close-prompt-modal')?.addEventListener('click', closeModal);
    modal.querySelector('#close-modal-btn')?.addEventListener('click', closeModal);
    modal.querySelector('#copy-modal-prompt')?.addEventListener('click', () => copyToClipboard(prompt));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}

