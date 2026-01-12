/**
 * Error Handler Module
 * Centralized error handling for the Strategic Proposal Generator
 * @module error-handler
 */

import { showToast } from './ui.js';

/**
 * Handle errors with user-friendly messages
 * @param {Error} error - The error object
 * @param {string} [context='Operation'] - Context where the error occurred
 * @returns {void}
 */
export function handleError(error, context = 'Operation') {
    console.error(`[${context}]`, error);

    /** @type {string} */
    let userMessage = 'An unexpected error occurred. Please try again.';

    if (error.message) {
        if (error.message.includes('QuotaExceeded')) {
            userMessage = 'Storage quota exceeded. Please delete some proposals to free up space.';
        } else if (error.message.includes('Failed to fetch')) {
            userMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('JSON')) {
            userMessage = 'Invalid data format. Please check your input.';
        } else {
            userMessage = error.message;
        }
    }

    showToast(userMessage, 'error');
}

/**
 * @template {(...args: any[]) => Promise<any>} T
 * Wrap async functions with error handling
 * @param {T} fn - The async function to wrap
 * @param {string} context - Context for error messages
 * @returns {T} Wrapped function with same signature
 */
export function withErrorHandling(fn, context) {
    /** @type {T} */
    const wrapped = /** @type {T} */ (async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            handleError(/** @type {Error} */ (error), context);
            throw error;
        }
    });
    return wrapped;
}

