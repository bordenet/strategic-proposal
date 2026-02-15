/**
 * Project View Events Module
 * Handles event listeners for phase interactions in strategic proposals
 * @module project-view-events
 */

import { getProject, updatePhase, updateProject, deleteProject } from './projects.js';
import { getPhaseMetadata, generatePromptForPhase, getFinalMarkdown, getExportFilename, detectPromptPaste } from './workflow.js';
import { showToast, copyToClipboardAsync, showPromptModal, confirm, confirmWithRemember, showDocumentPreviewModal, createActionMenu } from './ui.js';
import { navigateTo } from './router.js';
import { renderPhaseContent } from './project-view-phase.js';
import { showDiffModal } from './project-view-diff.js';

// Injected helpers to avoid circular imports
let extractTitleFromMarkdownFn = null;
let updatePhaseTabStylesFn = null;
let renderProjectViewFn = null;

/**
 * Set helper functions from main module (avoids circular imports)
 */
export function setHelpers(helpers) {
  extractTitleFromMarkdownFn = helpers.extractTitleFromMarkdown;
  updatePhaseTabStylesFn = helpers.updatePhaseTabStyles;
  renderProjectViewFn = helpers.renderProjectView;
}

/**
 * Attach event listeners for phase interactions
 * @param {import('./types.js').Project} project - Project data
 * @param {import('./types.js').PhaseNumber} phase - Current phase number
 * @returns {void}
 */
export function attachPhaseEventListeners(project, phase) {
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const saveResponseBtn = document.getElementById('save-response-btn');
  const responseTextarea = document.getElementById('response-textarea');
  const nextPhaseBtn = document.getElementById('next-phase-btn');

  /**
   * Enable workflow progression after prompt is copied
   */
  const enableWorkflowProgression = async (prompt) => {
    await updatePhase(project.id, phase, prompt, project.phases && project.phases[phase] ? project.phases[phase].response : '', { skipAutoAdvance: true });

    const openAiBtn = document.getElementById('open-ai-btn');
    if (openAiBtn) {
      openAiBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
      openAiBtn.classList.add('hover:bg-green-700');
      openAiBtn.removeAttribute('aria-disabled');
    }

    if (responseTextarea) {
      responseTextarea.disabled = false;
      responseTextarea.classList.remove('opacity-50', 'cursor-not-allowed');
      responseTextarea.focus();
    }
  };

  // CRITICAL: Safari transient activation fix - call copyToClipboardAsync synchronously
  copyPromptBtn?.addEventListener('click', async () => {
    const warningAcknowledged = localStorage.getItem('external-ai-warning-acknowledged');

    if (!warningAcknowledged) {
      const result = await confirmWithRemember(
        'You are about to copy a prompt that may contain proprietary data.\n\n' +
                '• This prompt will be pasted into an external AI service (Claude/Gemini)\n' +
                '• Data sent to these services is processed on third-party servers\n' +
                '• For sensitive documents, use an internal tool like LibreGPT instead\n\n' +
                'Do you want to continue?',
        'External AI Warning',
        { confirmText: 'Copy Prompt', cancelText: 'Cancel' }
      );

      if (!result.confirmed) {
        showToast('Copy cancelled', 'info');
        return;
      }

      if (result.remember) {
        localStorage.setItem('external-ai-warning-acknowledged', 'true');
      }
    }

    let generatedPrompt = null;
    const promptPromise = (async () => {
      const prompt = await generatePromptForPhase(project, phase);
      generatedPrompt = prompt;
      return prompt;
    })();

    copyToClipboardAsync(promptPromise)
      .then(() => {
        showToast('Prompt copied to clipboard!', 'success');
        return enableWorkflowProgression(generatedPrompt);
      })
      .catch((error) => {
        console.error('Failed to copy prompt:', error);
        showToast('Failed to copy to clipboard. Please check browser permissions.', 'error');
      });
  });

  // Update button state as user types
  responseTextarea?.addEventListener('input', () => {
    const hasEnoughContent = responseTextarea.value.trim().length >= 3;
    if (saveResponseBtn) {
      saveResponseBtn.disabled = !hasEnoughContent;
    }
  });

  // Save response handler
  attachSaveResponseHandler(project, phase, saveResponseBtn, responseTextarea);

  // Next phase button
  if (nextPhaseBtn && project.phases && project.phases[phase] && project.phases[phase].completed) {
    nextPhaseBtn.addEventListener('click', async () => {
      const nextPhase = phase + 1;
      const freshProject = await getProject(project.id);
      freshProject.phase = nextPhase;

      updatePhaseTabStylesFn(nextPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, nextPhase);
      attachPhaseEventListeners(freshProject, nextPhase);
    });
  }

  // Setup overflow menu
  attachMoreActionsMenu(project, phase);

  // Export button
  attachExportHandler(project);

  // Compare phases button
  attachCompareHandler(project);
}

/**
 * Attach save response handler
 */
function attachSaveResponseHandler(project, phase, saveResponseBtn, responseTextarea) {
  saveResponseBtn?.addEventListener('click', async () => {
    const response = responseTextarea.value.trim();
    if (response && response.length >= 3) {
      const promptCheck = detectPromptPaste(response);
      if (promptCheck.isPrompt) {
        showToast(promptCheck.reason, 'error');
        return;
      }

      try {
        await updatePhase(project.id, phase, project.phases[phase]?.prompt || '', response);

        if (phase < 3) {
          showToast('Response saved! Moving to next phase...', 'success');
          const updatedProject = await getProject(project.id);
          updatedProject.phase = phase + 1;
          updatePhaseTabStylesFn(phase + 1);
          document.getElementById('phase-content').innerHTML = renderPhaseContent(updatedProject, phase + 1);
          attachPhaseEventListeners(updatedProject, phase + 1);
        } else {
          // Phase 3 complete - extract and update project title if changed
          const extractedTitle = extractTitleFromMarkdownFn(response);
          if (extractedTitle && extractedTitle !== project.dealershipName) {
            await updateProject(project.id, {
              dealershipName: extractedTitle,
              title: `Proposal - ${extractedTitle}`
            });
            showToast(`Phase 3 complete! Title updated to "${extractedTitle}"`, 'success');
          } else {
            showToast('Phase 3 complete! Your proposal is ready.', 'success');
          }
          renderProjectViewFn(project.id);
        }
      } catch (error) {
        console.error('Error saving response:', error);
        showToast(`Failed to save response: ${error.message}`, 'error');
      }
    } else {
      showToast('Please enter at least 3 characters', 'warning');
    }
  });
}

/**
 * Attach more actions menu
 */
function attachMoreActionsMenu(project, phase) {
  const moreActionsBtn = document.getElementById('more-actions-btn');
  if (!moreActionsBtn) return;

  const meta = getPhaseMetadata(phase);
  const phaseData = project.phases && project.phases[phase] ? project.phases[phase] : {};
  const hasPrompt = !!phaseData.prompt;
  const menuItems = [];

  if (hasPrompt) {
    menuItems.push({
      label: 'View Prompt',
      icon: '👁️',
      onClick: () => {
        showPromptModal(project.phases[phase].prompt, `Phase ${phase}: ${meta.name}`);
      }
    });
  }

  menuItems.push({
    label: 'Edit Details',
    icon: '✏️',
    onClick: () => navigateTo('edit', project.id)
  });

  const completedCount = [1, 2, 3].filter(p => project.phases?.[p]?.response).length;
  if (completedCount >= 2) {
    menuItems.push({
      label: 'Compare Phases',
      icon: '🔄',
      onClick: () => {
        const phasesData = {
          1: project.phases?.[1]?.response || '',
          2: project.phases?.[2]?.response || '',
          3: project.phases?.[3]?.response || ''
        };
        const completedPhases = Object.entries(phasesData).filter(([, v]) => v).map(([k]) => parseInt(k));
        showDiffModal(phasesData, completedPhases);
      }
    });
  }

  menuItems.push({ separator: true });

  menuItems.push({
    label: 'Delete...',
    icon: '🗑️',
    destructive: true,
    onClick: async () => {
      const confirmed = await confirm(
        '🗑️ Delete Proposal?',
        'Are you sure you want to delete this proposal? This cannot be undone.',
        'Delete',
        'Cancel'
      );
      if (confirmed) {
        await deleteProject(project.id);
        showToast('Proposal deleted', 'success');
        navigateTo('');
      }
    }
  });

  createActionMenu({
    triggerElement: moreActionsBtn,
    items: menuItems,
    position: 'bottom-end'
  });
}

/**
 * Attach export button handler
 */
function attachExportHandler(project) {
  const exportBtnPhase3 = document.getElementById('export-complete-btn');
  if (exportBtnPhase3) {
    exportBtnPhase3.addEventListener('click', () => {
      const markdown = getFinalMarkdown(project);
      if (markdown) {
        showDocumentPreviewModal(markdown, 'Your Proposal is Ready', getExportFilename(project));
      } else {
        showToast('No proposal content to export', 'warning');
      }
    });
  }
}

/**
 * Attach compare phases handler
 */
function attachCompareHandler(project) {
  const comparePhasesBtn = document.getElementById('compare-phases-btn');
  if (comparePhasesBtn) {
    comparePhasesBtn.addEventListener('click', () => {
      const phasesData = {
        1: project.phases?.[1]?.response || '',
        2: project.phases?.[2]?.response || '',
        3: project.phases?.[3]?.response || ''
      };

      const completedPhases = Object.entries(phasesData).filter(([, v]) => v).map(([k]) => parseInt(k));
      if (completedPhases.length < 2) {
        showToast('At least 2 phases must be completed to compare', 'warning');
        return;
      }

      showDiffModal(phasesData, completedPhases);
    });
  }
}
