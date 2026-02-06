/**
 * Views Module
 * Handles rendering different views for Strategic Proposal Generator
 * @module views
 */

import { getAllProjects, createProject, updateProject, getProject, deleteProject } from './projects.js';
import { formatDate, escapeHtml, confirm, showToast, showDocumentPreviewModal } from './ui.js';
import { navigateTo } from './router.js';
import { getFinalMarkdown, getExportFilename } from './workflow.js';
import {
  ATTACHMENT_CONFIG,
  validateFile,
  validateFiles,
  formatFileSize,
  handleFiles,
  resetAttachmentTracking,
  getAttachmentStats
} from './attachments.js';
import { getAllTemplates, getTemplate } from './document-specific-templates.js';

// Re-export attachment functions for backwards compatibility
export {
  ATTACHMENT_CONFIG,
  validateFile,
  validateFiles,
  formatFileSize,
  handleFiles,
  resetAttachmentTracking,
  getAttachmentStats
};

/**
 * Render the projects list view
 * @returns {Promise<void>}
 */
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
                ${projects.map(project => {
    // Check if all phases are complete
    const isComplete = project.phases &&
                        project.phases[1]?.completed &&
                        project.phases[2]?.completed &&
                        project.phases[3]?.completed;
    return `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-3">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    ${escapeHtml(project.dealershipName || project.title)}
                                </h3>
                                <div class="flex items-center space-x-2">
                                    ${isComplete ? `
                                    <button class="preview-project-btn text-gray-400 hover:text-blue-600 transition-colors" data-project-id="${project.id}" title="Preview & Copy">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    ` : ''}
                                    <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}" title="Delete">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                ${escapeHtml(project.dealershipLocation || '')} ${project.storeCount ? `• ${project.storeCount} stores` : ''}
                            </p>

                            <div class="mb-4">
                                <div class="flex items-center space-x-2 mb-2">
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Phase ${Math.min(project.phase, 3)}/3</span>
                                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${Math.min((project.phase / 3) * 100, 100)}%"></div>
                                    </div>
                                </div>
                                <div class="flex space-x-1">
                                    ${[1, 2, 3].map(phase => `
                                        <div class="flex-1 h-1 rounded ${project.phases && project.phases[phase] && project.phases[phase].completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}"></div>
                                    `).join('')}
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
                `;}).join('')}
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
      if (!e.target.closest('.delete-project-btn') && !e.target.closest('.preview-project-btn')) {
        navigateTo('project', card.dataset.projectId);
      }
    });
  });

  // Preview buttons (for completed projects)
  const previewBtns = container.querySelectorAll('.preview-project-btn');
  previewBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const markdown = getFinalMarkdown(project);
        if (markdown) {
          showDocumentPreviewModal(markdown, 'Your Proposal is Ready', getExportFilename(project));
        } else {
          showToast('No content to preview', 'warning');
        }
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

/**
 * Render the new project form view
 * @returns {void}
 */
export function renderNewProjectForm() {
  const container = document.getElementById('app-container');
  if (!container) return;
  container.innerHTML = getNewProjectFormHTML();
  setupNewProjectFormListeners();
}

/**
 * Generate HTML for the new project form
 * @returns {string} HTML string
 */
function getNewProjectFormHTML() {
  return `
        <div class="max-w-6xl mx-auto">
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

                <!-- Template Selector -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Choose a Template
                    </label>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3" id="template-selector">
                        ${getAllTemplates().map(t => `
                            <button type="button"
                                class="template-btn p-3 border-2 rounded-lg text-center transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${t.id === 'blank' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}"
                                data-template-id="${t.id}">
                                <span class="text-2xl block mb-1">${t.icon}</span>
                                <span class="text-sm font-medium text-gray-900 dark:text-white block">${t.name}</span>
                                <span class="text-xs text-gray-500 dark:text-gray-400">${t.description}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <form id="new-project-form" class="space-y-8">
                    <!-- Dealership Information Section -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            🏢 Dealership Information
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="dealershipName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dealership Name *</label>
                                <input type="text" id="dealershipName" name="dealershipName" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Team Auto Group">
                            </div>
                            <div>
                                <label for="dealershipLocation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                <input type="text" id="dealershipLocation" name="dealershipLocation" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Dallas, TX">
                            </div>
                            <div>
                                <label for="storeCount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Stores</label>
                                <input type="number" id="storeCount" name="storeCount" min="1" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., 5">
                            </div>
                            <div>
                                <label for="currentVendor" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Vendor (if any)</label>
                                <input type="text" id="currentVendor" name="currentVendor" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Purple Cloud">
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
                                <input type="text" id="decisionMakerName" name="decisionMakerName" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., John Smith">
                            </div>
                            <div>
                                <label for="decisionMakerRole" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role/Title</label>
                                <input type="text" id="decisionMakerRole" name="decisionMakerRole" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., General Manager, Owner">
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
                                <textarea id="conversationTranscripts" name="conversationTranscripts" rows="6" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Paste call transcripts, email threads, or conversation logs here..."></textarea>
                            </div>
                            <div>
                                <label for="meetingNotes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meeting Notes</label>
                                <textarea id="meetingNotes" name="meetingNotes" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Any meeting notes or discovery call summaries..."></textarea>
                            </div>
                            <div>
                                <label for="painPoints" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Known Pain Points</label>
                                <textarea id="painPoints" name="painPoints" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="List specific pain points identified with current vendor or situation..."></textarea>
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
                            <textarea id="attachmentText" name="attachmentText" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Paste text from PDFs or other documents here..."></textarea>
                        </div>
                    </section>

                    <!-- Working Draft Section -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📝 Working Draft (Optional)
                        </h3>
                        <div>
                            <label for="workingDraft" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Existing Proposal Draft</label>
                            <textarea id="workingDraft" name="workingDraft" rows="8" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm" placeholder="If you have an existing draft to refine, paste it here..."></textarea>
                            <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">If provided, the AI will use this as a starting point for refinement.</p>
                        </div>
                    </section>

                    <!-- Additional Context -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            ℹ️ Additional Context
                        </h3>
                        <div>
                            <textarea id="additionalContext" name="additionalContext" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Any other context, special considerations, or instructions..."></textarea>
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

/**
 * Set up event listeners for the new project form
 * @returns {void}
 */
function setupNewProjectFormListeners() {
  // Reset attachment tracking for new form
  resetAttachmentTracking();

  document.getElementById('back-btn')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('cancel-btn')?.addEventListener('click', () => navigateTo('home'));

  // Template selector click handlers
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.dataset.templateId;
      const template = getTemplate(templateId);

      if (template) {
        // Update selection UI
        document.querySelectorAll('.template-btn').forEach(b => {
          b.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
          b.classList.add('border-gray-200', 'dark:border-gray-600');
        });
        btn.classList.remove('border-gray-200', 'dark:border-gray-600');
        btn.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');

        // Populate form fields with template content
        const fields = ['dealershipName', 'storeCount', 'currentVendor', 'painPoints'];
        fields.forEach(field => {
          const el = document.getElementById(field);
          if (el && template[field] !== undefined) {
            el.value = template[field];
          }
        });
      }
    });
  });

  // File upload handling
  const dropZone = document.getElementById('drop-zone');
  const fileInput = /** @type {HTMLInputElement | null} */ (document.getElementById('file-input'));

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer?.files) {
        handleFiles(e.dataTransfer.files);
      }
    });
    fileInput.addEventListener('change', (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      if (target.files) {
        handleFiles(target.files);
      }
    });
  }

  // Form submission
  const form = document.getElementById('new-project-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = /** @type {HTMLFormElement} */ (e.target);
    const formData = Object.fromEntries(new FormData(target));
    const project = await createProject(/** @type {import('./types.js').ProjectFormData} */ (formData));
    showToast('Proposal created successfully!', 'success');
    navigateTo('project', project.id);
  });
}

/**
 * Render the edit project form
 * @param {string} projectId - ID of the project to edit
 * @returns {Promise<void>}
 */
export async function renderEditProjectForm(projectId) {
  const project = await getProject(projectId);
  if (!project) {
    showToast('Proposal not found', 'error');
    navigateTo('home');
    return;
  }

  const container = document.getElementById('app-container');
  if (!container) return;
  container.innerHTML = getEditProjectFormHTML(project);
  setupEditProjectFormListeners(project);
}

/**
 * Generate HTML for the edit project form
 * @param {import('./types.js').Project} project - Project to edit
 * @returns {string} HTML string
 */
function getEditProjectFormHTML(project) {
  return `
        <div class="max-w-6xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Proposal
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Edit Proposal Details
                </h2>

                <form id="edit-project-form" class="space-y-8">
                    <!-- Dealership Information Section -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            🏢 Dealership Information
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="dealershipName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dealership Name <span class="text-red-500">*</span></label>
                                <input type="text" id="dealershipName" name="dealershipName" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Team Auto Group" value="${escapeHtml(project.dealershipName || '')}">
                            </div>
                            <div>
                                <label for="dealershipLocation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                <input type="text" id="dealershipLocation" name="dealershipLocation" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Dallas, TX" value="${escapeHtml(project.dealershipLocation || '')}">
                            </div>
                            <div>
                                <label for="storeCount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Stores</label>
                                <input type="number" id="storeCount" name="storeCount" min="1" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., 5" value="${escapeHtml(project.storeCount || '')}">
                            </div>
                            <div>
                                <label for="currentVendor" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Vendor (if any)</label>
                                <input type="text" id="currentVendor" name="currentVendor" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Purple Cloud" value="${escapeHtml(project.currentVendor || '')}">
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
                                <input type="text" id="decisionMakerName" name="decisionMakerName" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., John Smith" value="${escapeHtml(project.decisionMakerName || '')}">
                            </div>
                            <div>
                                <label for="decisionMakerRole" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role/Title</label>
                                <input type="text" id="decisionMakerRole" name="decisionMakerRole" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., General Manager, Owner" value="${escapeHtml(project.decisionMakerRole || '')}">
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
                                <textarea id="conversationTranscripts" name="conversationTranscripts" rows="6" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Paste call transcripts, email threads, or conversation logs here...">${escapeHtml(project.conversationTranscripts || '')}</textarea>
                            </div>
                            <div>
                                <label for="meetingNotes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meeting Notes</label>
                                <textarea id="meetingNotes" name="meetingNotes" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Any meeting notes or discovery call summaries...">${escapeHtml(project.meetingNotes || '')}</textarea>
                            </div>
                            <div>
                                <label for="painPoints" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Known Pain Points</label>
                                <textarea id="painPoints" name="painPoints" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="List specific pain points identified with current vendor or situation...">${escapeHtml(project.painPoints || '')}</textarea>
                            </div>
                        </div>
                    </section>

                    <!-- Additional Context -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            ℹ️ Additional Context
                        </h3>
                        <div>
                            <textarea id="additionalContext" name="additionalContext" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Any other context, special considerations, or instructions...">${escapeHtml(project.additionalContext || '')}</textarea>
                        </div>
                    </section>

                    <!-- Submit Buttons -->
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" id="cancel-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * Set up event listeners for the edit project form
 * @param {import('./types.js').Project} project - Project being edited
 * @returns {void}
 */
function setupEditProjectFormListeners(project) {
  document.getElementById('back-btn')?.addEventListener('click', () => navigateTo('project', project.id));
  document.getElementById('cancel-btn')?.addEventListener('click', () => navigateTo('project', project.id));

  // Form submission
  const form = document.getElementById('edit-project-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = /** @type {HTMLFormElement} */ (e.target);
    const formData = Object.fromEntries(new FormData(target));
    // Update title based on dealership name
    formData.title = `Proposal - ${formData.dealershipName}`;
    await updateProject(project.id, formData);
    showToast('Proposal updated successfully!', 'success');
    navigateTo('project', project.id);
  });
}
