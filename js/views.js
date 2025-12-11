/**
 * Views Module
 * Handles rendering different views for Strategic Proposal Generator
 */

import { getAllProjects, createProject, deleteProject } from './projects.js';
import { formatDate, escapeHtml, confirm, showToast, formatBytes } from './ui.js';
import { navigateTo } from './router.js';

export async function renderProjectsList() {
    const projects = await getAllProjects();
    
    const container = document.getElementById('app-container');
    container.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                My Proposals
            </h2>
            <button id="new-project-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + New Proposal
            </button>
        </div>

        ${projects.length === 0 ? `
            <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span class="text-6xl mb-4 block">📋</span>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No proposals yet
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first strategic proposal for a dealership
                </p>
                <button id="new-project-btn-empty" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    + Create Your First Proposal
                </button>
            </div>
        ` : `
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                ${projects.map(project => `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-3">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    ${escapeHtml(project.dealershipName || project.title)}
                                </h3>
                                <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                ${escapeHtml(project.dealershipLocation || '')} ${project.storeCount ? `• ${project.storeCount} stores` : ''}
                            </p>
                            
                            <div class="mb-4">
                                <div class="flex items-center space-x-2 mb-2">
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Phase ${project.phase}/3</span>
                                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${(project.phase / 3) * 100}%"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Updated ${formatDate(project.updatedAt)}</span>
                                <span class="px-2 py-1 rounded ${project.currentVendor ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'}">
                                    ${project.currentVendor ? `vs ${escapeHtml(project.currentVendor)}` : 'New'}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    `;

    // Event listeners
    const newProjectBtns = container.querySelectorAll('#new-project-btn, #new-project-btn-empty');
    newProjectBtns.forEach(btn => {
        btn.addEventListener('click', () => navigateTo('new-project'));
    });

    const projectCards = container.querySelectorAll('[data-project-id]');
    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-project-btn')) {
                navigateTo('project', card.dataset.projectId);
            }
        });
    });

    const deleteBtns = container.querySelectorAll('.delete-project-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const projectId = btn.dataset.projectId;
            const project = projects.find(p => p.id === projectId);
            
            if (await confirm('Delete Proposal', `Are you sure you want to delete the proposal for "${project.dealershipName || project.title}"?`, 'Delete', 'Cancel')) {
                await deleteProject(projectId);
                showToast('Proposal deleted', 'success');
                renderProjectsList();
            }
        });
    });
}

export function renderNewProjectForm() {
    const container = document.getElementById('app-container');
    container.innerHTML = getNewProjectFormHTML();
    setupNewProjectFormListeners();
}

function getNewProjectFormHTML() {
    return `
        <div class="max-w-4xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Proposals
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Create New Strategic Proposal
                </h2>

                <form id="new-project-form" class="space-y-8">
                    <!-- Dealership Information Section -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            🏢 Dealership Information
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="dealershipName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dealership Name *</label>
                                <input type="text" id="dealershipName" name="dealershipName" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g., Team Auto Group">
                            </div>
                            <div>
                                <label for="dealershipLocation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                <input type="text" id="dealershipLocation" name="dealershipLocation" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g., Dallas, TX">
                            </div>
                            <div>
                                <label for="storeCount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Stores</label>
                                <input type="number" id="storeCount" name="storeCount" min="1" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g., 5">
                            </div>
                            <div>
                                <label for="currentVendor" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Vendor (if any)</label>
                                <input type="text" id="currentVendor" name="currentVendor" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g., Purple Cloud">
                            </div>
                        </div>
                    </section>
                    <!-- Decision Maker Section -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            👤 Decision Maker
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="decisionMakerName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                                <input type="text" id="decisionMakerName" name="decisionMakerName" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g., John Smith">
                            </div>
                            <div>
                                <label for="decisionMakerRole" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role/Title</label>
                                <input type="text" id="decisionMakerRole" name="decisionMakerRole" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="e.g., General Manager, Owner">
                            </div>
                        </div>
                    </section>

                    <!-- Conversation Materials Section -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            💬 Conversation Materials
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label for="conversationTranscripts" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Call Transcripts / Conversation Logs</label>
                                <textarea id="conversationTranscripts" name="conversationTranscripts" rows="6" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Paste call transcripts, email threads, or conversation logs here..."></textarea>
                            </div>
                            <div>
                                <label for="meetingNotes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meeting Notes</label>
                                <textarea id="meetingNotes" name="meetingNotes" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Any meeting notes or discovery call summaries..."></textarea>
                            </div>
                            <div>
                                <label for="painPoints" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Known Pain Points</label>
                                <textarea id="painPoints" name="painPoints" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="List specific pain points identified with current vendor or situation..."></textarea>
                            </div>
                        </div>
                    </section>

                    <!-- File Upload Section -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📎 Attachments
                        </h3>
                        <div id="drop-zone" class="drop-zone rounded-lg p-8 text-center cursor-pointer">
                            <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <p class="text-gray-600 dark:text-gray-400 mb-2">Drop PDF files here or click to upload</p>
                            <p class="text-sm text-gray-500 dark:text-gray-500">Text will be extracted and included in the proposal context</p>
                            <input type="file" id="file-input" accept=".pdf,.txt" multiple class="hidden">
                        </div>
                        <div id="file-list" class="mt-4 space-y-2"></div>
                        <div>
                            <label for="attachmentText" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">Extracted/Pasted Attachment Text</label>
                            <textarea id="attachmentText" name="attachmentText" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Paste text from PDFs or other documents here..."></textarea>
                        </div>
                    </section>

                    <!-- Working Draft Section -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📝 Working Draft (Optional)
                        </h3>
                        <div>
                            <label for="workingDraft" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Existing Proposal Draft</label>
                            <textarea id="workingDraft" name="workingDraft" rows="8" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm" placeholder="If you have an existing draft to refine, paste it here..."></textarea>
                            <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">If provided, the AI will use this as a starting point for refinement.</p>
                        </div>
                    </section>

                    <!-- Additional Context -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            ℹ️ Additional Context
                        </h3>
                        <div>
                            <textarea id="additionalContext" name="additionalContext" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Any other context, special considerations, or instructions..."></textarea>
                        </div>
                    </section>

                    <!-- Submit Buttons -->
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" id="cancel-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Create Proposal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function setupNewProjectFormListeners() {
    // Reset attachment tracking for new form
    resetAttachmentTracking();

    document.getElementById('back-btn').addEventListener('click', () => navigateTo('home'));
    document.getElementById('cancel-btn').addEventListener('click', () => navigateTo('home'));

    // File upload handling
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    // Form submission
    document.getElementById('new-project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        const project = await createProject(formData);
        showToast('Proposal created successfully!', 'success');
        navigateTo('project', project.id);
    });
}

// File attachment configuration
export const ATTACHMENT_CONFIG = {
    maxFileSize: 10 * 1024 * 1024, // 10MB max per file
    maxTotalSize: 50 * 1024 * 1024, // 50MB total
    maxFileCount: 20,
    allowedTypes: ['application/pdf', 'text/plain'],
    allowedExtensions: ['.pdf', '.txt']
};

// Track total file size for the current form
let totalAttachmentSize = 0;
let attachedFileCount = 0;

/**
 * Reset attachment tracking (called when form is reset or page changes)
 */
export function resetAttachmentTracking() {
    totalAttachmentSize = 0;
    attachedFileCount = 0;
}

/**
 * Get current attachment stats
 */
export function getAttachmentStats() {
    return {
        totalSize: totalAttachmentSize,
        fileCount: attachedFileCount,
        remainingSize: ATTACHMENT_CONFIG.maxTotalSize - totalAttachmentSize,
        remainingCount: ATTACHMENT_CONFIG.maxFileCount - attachedFileCount
    };
}

/**
 * Validate a single file
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateFile(file) {
    // Check if file exists
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
        return { valid: false, error: 'File has no name' };
    }

    // Check file size
    if (file.size === 0) {
        return { valid: false, error: `File "${file.name}" is empty` };
    }

    if (file.size > ATTACHMENT_CONFIG.maxFileSize) {
        const maxMB = (ATTACHMENT_CONFIG.maxFileSize / (1024 * 1024)).toFixed(0);
        const fileMB = (file.size / (1024 * 1024)).toFixed(2);
        return {
            valid: false,
            error: `File "${file.name}" (${fileMB}MB) exceeds maximum size of ${maxMB}MB`
        };
    }

    // Check total size limit
    if (totalAttachmentSize + file.size > ATTACHMENT_CONFIG.maxTotalSize) {
        const maxMB = (ATTACHMENT_CONFIG.maxTotalSize / (1024 * 1024)).toFixed(0);
        return {
            valid: false,
            error: `Adding "${file.name}" would exceed total attachment limit of ${maxMB}MB`
        };
    }

    // Check file count limit
    if (attachedFileCount >= ATTACHMENT_CONFIG.maxFileCount) {
        return {
            valid: false,
            error: `Maximum of ${ATTACHMENT_CONFIG.maxFileCount} files allowed`
        };
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!ATTACHMENT_CONFIG.allowedExtensions.includes(extension)) {
        return {
            valid: false,
            error: `File type "${extension}" not allowed. Allowed: ${ATTACHMENT_CONFIG.allowedExtensions.join(', ')}`
        };
    }

    // Check MIME type (if available - some browsers may not provide it)
    if (file.type && !ATTACHMENT_CONFIG.allowedTypes.includes(file.type)) {
        // Only warn, don't block - extension check is primary
        console.warn(`File "${file.name}" has unexpected MIME type: ${file.type}`);
    }

    return { valid: true };
}

/**
 * Validate an array of files
 * @returns {Object} { valid: File[], invalid: Array<{file: File, error: string}> }
 */
export function validateFiles(files) {
    const valid = [];
    const invalid = [];

    Array.from(files).forEach(file => {
        const result = validateFile(file);
        if (result.valid) {
            valid.push(file);
        } else {
            invalid.push({ file, error: result.error });
        }
    });

    return { valid, invalid };
}

/**
 * Format file size for display (re-export from ui.js for backwards compatibility)
 */
export function formatFileSize(bytes) {
    return formatBytes(bytes);
}

/**
 * Handle file uploads with validation
 */
export function handleFiles(files) {
    const fileList = document.getElementById('file-list');
    const attachmentText = document.getElementById('attachmentText');

    if (!fileList || !attachmentText) {
        showToast('Error: Form elements not found', 'error');
        return { processed: 0, errors: ['Form elements not found'] };
    }

    const { valid, invalid } = validateFiles(files);
    const errors = [];

    // Show errors for invalid files
    invalid.forEach(({ error }) => {
        errors.push(error);
        showToast(error, 'error');
    });

    // Process valid files
    valid.forEach(file => {
        // Update tracking
        totalAttachmentSize += file.size;
        attachedFileCount++;

        // Create file list item using DOM APIs to prevent XSS
        const fileItem = document.createElement('div');
        fileItem.className = 'flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg';

        // Create info container
        const infoDiv = document.createElement('div');
        infoDiv.className = 'flex items-center gap-2';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-sm text-gray-700 dark:text-gray-300';
        nameSpan.textContent = file.name; // Safe - uses textContent

        const sizeSpan = document.createElement('span');
        sizeSpan.className = 'text-xs text-gray-500';
        sizeSpan.textContent = `(${formatFileSize(file.size)})`;

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(sizeSpan);

        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-file-btn text-red-500 hover:text-red-700 text-sm';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            totalAttachmentSize -= file.size;
            attachedFileCount--;
            fileItem.remove();
            showToast(`Removed ${escapeHtml(file.name)}`, 'info');
        });

        fileItem.appendChild(infoDiv);
        fileItem.appendChild(removeBtn);
        fileList.appendChild(fileItem);

        // For text files, read content directly
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                // Limit content size for very large text files
                const maxTextLength = 500000; // 500KB of text
                if (content.length > maxTextLength) {
                    const truncated = content.substring(0, maxTextLength);
                    attachmentText.value += `\n\n--- ${file.name} (truncated to ${maxTextLength} chars) ---\n${truncated}\n\n[Content truncated...]`;
                    showToast(`Text from ${file.name} was truncated due to size`, 'warning');
                } else {
                    attachmentText.value += `\n\n--- ${file.name} ---\n${content}`;
                }
            };
            reader.onerror = () => {
                showToast(`Error reading ${file.name}`, 'error');
                errors.push(`Error reading ${file.name}`);
            };
            reader.readAsText(file);
        }
    });

    // Show summary toast
    if (valid.length > 0) {
        const pdfCount = valid.filter(f => f.name.endsWith('.pdf')).length;

        let message = `Added ${valid.length} file(s).`;
        if (pdfCount > 0) {
            message += ` For ${pdfCount} PDF(s), please paste extracted text manually.`;
        }
        showToast(message, 'info');
    }

    return {
        processed: valid.length,
        errors,
        stats: getAttachmentStats()
    };
}

