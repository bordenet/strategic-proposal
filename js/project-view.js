/**
 * Project Detail View Module
 * Handles rendering the proposal workflow view
 */

import { getProject, updatePhase } from './projects.js';
import { getPhaseMetadata, generatePromptForPhase, exportFinalDocument, WORKFLOW_CONFIG } from './workflow.js';
import { escapeHtml, showToast, copyToClipboard, showPromptModal, confirm } from './ui.js';
import { navigateTo } from './router.js';

export async function renderProjectView(projectId) {
    const project = await getProject(projectId);
    
    if (!project) {
        showToast('Proposal not found', 'error');
        navigateTo('home');
        return;
    }

    const container = document.getElementById('app-container');
    container.innerHTML = `
        <div class="mb-6">
            <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center mb-4">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Proposals
            </button>
            
            <div class="flex items-start justify-between">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        ${escapeHtml(project.dealershipName || project.title)}
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400">
                        ${escapeHtml(project.dealershipLocation || '')} ${project.storeCount ? `• ${project.storeCount} stores` : ''}
                        ${project.currentVendor ? `• Currently with ${escapeHtml(project.currentVendor)}` : ''}
                    </p>
                </div>
                <button id="export-document-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Export Proposal
                </button>
            </div>
        </div>

        <!-- Phase Tabs -->
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex space-x-1">
                ${WORKFLOW_CONFIG.phases.map(phase => {
                    const isActive = project.phase === phase.number;
                    const isCompleted = project.phases[phase.number]?.completed;
                    
                    return `
                        <button 
                            class="phase-tab px-6 py-3 font-medium transition-colors ${
                                isActive 
                                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' 
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }"
                            data-phase="${phase.number}"
                        >
                            Phase ${phase.number}: ${phase.name}
                            ${isCompleted ? '<span class="ml-2 text-green-500">✓</span>' : ''}
                        </button>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- Phase Content -->
        <div id="phase-content">
            ${renderPhaseContent(project, project.phase)}
        </div>
    `;

    // Event listeners
    document.getElementById('back-btn').addEventListener('click', () => navigateTo('home'));
    document.getElementById('export-document-btn').addEventListener('click', () => {
        const markdown = exportFinalDocument(project);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proposal-${(project.dealershipName || 'draft').replace(/\s+/g, '-')}.md`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Proposal exported successfully', 'success');
    });
    
    document.querySelectorAll('.phase-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const phase = parseInt(tab.dataset.phase);
            project.phase = phase;
            document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase);
            attachPhaseEventListeners(project, phase);
            
            // Update active tab styling
            document.querySelectorAll('.phase-tab').forEach(t => {
                t.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
                t.classList.add('text-gray-600', 'dark:text-gray-400');
            });
            tab.classList.add('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
            tab.classList.remove('text-gray-600', 'dark:text-gray-400');
        });
    });

    attachPhaseEventListeners(project, project.phase);
}

function renderPhaseContent(project, phaseNumber) {
    const meta = getPhaseMetadata(phaseNumber);
    const phaseData = project.phases[phaseNumber] || { prompt: '', response: '', completed: false };
    
    return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Phase ${phaseNumber}: ${meta.name}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-2">
                    ${meta.description}
                </p>
                <div class="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                    <span class="mr-2">🤖</span>
                    Use with ${meta.aiModel}
                </div>
            </div>

            <!-- Step 1: Generate Prompt -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step 1: Copy Prompt to AI
                </h4>
                <button id="copy-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    📋 Copy Prompt to Clipboard
                </button>
                ${phaseData.prompt ? `
                    <div class="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Prompt:</span>
                            <button class="view-prompt-btn text-blue-600 dark:text-blue-400 hover:underline text-sm">View Full Prompt</button>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">${escapeHtml(phaseData.prompt.substring(0, 200))}...</p>
                    </div>
                ` : ''}
            </div>

            <!-- Step 2: Paste Response -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Step 2: Paste AI Response</h4>
                <textarea id="response-textarea" rows="12" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm" placeholder="Paste the AI's response here...">${escapeHtml(phaseData.response || '')}</textarea>
                <div class="mt-3 flex justify-between items-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">${phaseData.completed ? '✓ Phase completed' : 'Paste response to complete this phase'}</span>
                    <button id="save-response-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Save Response</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Attach event listeners for phase interactions
 */
function attachPhaseEventListeners(project, phase) {
    const copyPromptBtn = document.getElementById('copy-prompt-btn');
    const saveResponseBtn = document.getElementById('save-response-btn');
    const responseTextarea = document.getElementById('response-textarea');

    copyPromptBtn?.addEventListener('click', async () => {
        // Check if warning was previously acknowledged
        const warningAcknowledged = localStorage.getItem('external-ai-warning-acknowledged');

        if (!warningAcknowledged) {
            const confirmed = await confirm(
                '⚠️ External AI Warning',
                'You are about to copy a prompt that may contain proprietary data.\n\n' +
                '• This prompt will be pasted into an external AI service (Claude/Gemini)\n' +
                '• Data sent to these services is processed on third-party servers\n' +
                '• For sensitive documents, use an internal tool like LibreGPT instead\n\n' +
                'Do you want to continue?',
                'Copy Anyway',
                'Cancel'
            );

            if (!confirmed) {
                showToast('Copy cancelled', 'info');
                return;
            }

            // Remember the choice for this session
            localStorage.setItem('external-ai-warning-acknowledged', 'true');
        }

        const prompt = await generatePromptForPhase(project, phase);
        await copyToClipboard(prompt);
        await updatePhase(project.id, phase, prompt, project.phases[phase]?.response || '');
        renderProjectView(project.id);
    });

    saveResponseBtn?.addEventListener('click', async () => {
        const response = responseTextarea.value.trim();
        if (response) {
            await updatePhase(project.id, phase, project.phases[phase]?.prompt || '', response);
            showToast('Response saved successfully!', 'success');
            renderProjectView(project.id);
        } else {
            showToast('Please enter a response', 'warning');
        }
    });

    const viewPromptBtn = document.querySelector('.view-prompt-btn');
    if (viewPromptBtn && project.phases[phase]?.prompt) {
        viewPromptBtn.addEventListener('click', () => {
            const meta = getPhaseMetadata(phase);
            showPromptModal(project.phases[phase].prompt, `Phase ${phase}: ${meta.name}`);
        });
    }
}

