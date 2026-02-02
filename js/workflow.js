/**
 * Workflow Module
 * Manages the 3-phase adversarial workflow for Strategic Proposal Generator
 * @module workflow
 */

import {
  WORKFLOW_CONFIG,
  generatePhase1Prompt as genPhase1,
  generatePhase2Prompt as genPhase2,
  generatePhase3Prompt as genPhase3
} from './prompts.js';

// Re-export WORKFLOW_CONFIG for backward compatibility
export { WORKFLOW_CONFIG };

/** @type {Object.<number, string>} Prompt templates cache - legacy, kept for backward compatibility */
let promptTemplates = {};

/**
 * Load default prompts from files - legacy function kept for backward compatibility
 * @returns {Promise<void>}
 */
export async function loadDefaultPrompts() {
  for (const phase of WORKFLOW_CONFIG.phases) {
    try {
      const response = await fetch(`prompts/phase${phase.number}.md`);
      if (response.ok) {
        promptTemplates[phase.number] = await response.text();
      }
    } catch (error) {
      console.warn(`Failed to load prompt for phase ${phase.number}:`, error);
    }
  }
}

export class Workflow {
    /** @type {import('./types.js').Project} */
    project;

    /** @type {number} */
    currentPhase;

    /**
     * @param {import('./types.js').Project} project
     */
    constructor(project) {
        this.project = project;
        this.currentPhase = project.phase || 1;
    }

    /**
     * Get the current phase configuration
     * @returns {import('./types.js').PhaseConfig | undefined}
     */
    getCurrentPhase() {
        return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase);
    }

    /**
     * Get the next phase configuration
     * @returns {import('./types.js').PhaseConfig | null}
     */
    getNextPhase() {
        if (this.currentPhase >= WORKFLOW_CONFIG.phaseCount) return null;
        return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase + 1) || null;
    }

    /**
     * Check if workflow is complete
     * @returns {boolean}
     */
    isComplete() {
        return this.currentPhase > WORKFLOW_CONFIG.phaseCount;
    }

    /**
     * Advance to the next phase
     * @returns {boolean} True if advanced, false if already at final phase
     */
    advancePhase() {
        // Allow advancing up to phase 4 (complete state)
        if (this.currentPhase <= WORKFLOW_CONFIG.phaseCount) {
            this.currentPhase++;
            this.project.phase = this.currentPhase;
            return true;
        }
        return false;
    }

    /**
     * Generate the prompt for the current phase
     * Uses prompts.js module for template loading and variable replacement
     * @returns {Promise<string>}
     */
    async generatePrompt() {
      const p = this.project;
      const formData = {
        dealershipName: p.dealershipName,
        dealershipLocation: p.dealershipLocation,
        storeCount: p.storeCount,
        currentVendor: p.currentVendor,
        decisionMakerName: p.decisionMakerName,
        decisionMakerRole: p.decisionMakerRole,
        conversationTranscripts: p.conversationTranscripts,
        meetingNotes: p.meetingNotes,
        painPoints: p.painPoints,
        attachmentText: p.attachmentText,
        workingDraft: p.workingDraft,
        additionalContext: p.additionalContext
      };

      switch (this.currentPhase) {
      case 1:
        return await genPhase1(formData);
      case 2:
        return await genPhase2(formData, p.phase1_output || '[Phase 1 output not yet generated]');
      case 3:
        return await genPhase3(
          formData,
          p.phase1_output || '[Phase 1 output not yet generated]',
          p.phase2_output || '[Phase 2 output not yet generated]'
        );
      default:
        throw new Error(`Invalid phase: ${this.currentPhase}`);
      }
    }

    /**
     * Replace template variables with project data - legacy method kept for backward compatibility
     * @param {string} template
     * @returns {string}
     */
    replaceVariables(template) {
      let result = template;
      const p = this.project;

      // Helper to provide meaningful placeholder for empty values
      const val = (v, label) => v?.trim() || `[${label} not provided]`;
      const optVal = (v) => v?.trim() || '[Not provided]';

      // Dealership information - required fields get specific labels
      result = result.replace(/\{dealershipName\}/g, val(p.dealershipName, 'Dealership name'));
      result = result.replace(/\{dealershipLocation\}/g, optVal(p.dealershipLocation));
      result = result.replace(/\{storeCount\}/g, optVal(p.storeCount));
      result = result.replace(/\{currentVendor\}/g, optVal(p.currentVendor));
      result = result.replace(/\{decisionMakerName\}/g, optVal(p.decisionMakerName));
      result = result.replace(/\{decisionMakerRole\}/g, optVal(p.decisionMakerRole));

      // Conversation and context data
      result = result.replace(/\{conversationTranscripts\}/g, optVal(p.conversationTranscripts));
      result = result.replace(/\{meetingNotes\}/g, optVal(p.meetingNotes));
      result = result.replace(/\{attachmentText\}/g, optVal(p.attachmentText));
      result = result.replace(/\{painPoints\}/g, optVal(p.painPoints));
      result = result.replace(/\{additionalContext\}/g, optVal(p.additionalContext));

      // Working draft (for refinement)
      result = result.replace(/\{workingDraft\}/g, optVal(p.workingDraft));

      // Phase outputs for synthesis
      result = result.replace(/\{phase1_output\}/g, p.phase1_output || '[Phase 1 output not yet generated]');
      result = result.replace(/\{phase2_output\}/g, p.phase2_output || '[Phase 2 output not yet generated]');

      return result;
    }

    /**
     * Save the output for the current phase
     * @param {string} output
     * @returns {void}
     */
    savePhaseOutput(output) {
        const phaseKey = /** @type {'phase1_output' | 'phase2_output' | 'phase3_output'} */ (`phase${this.currentPhase}_output`);
        this.project[phaseKey] = output;
        this.project.updatedAt = new Date().toISOString();
    }

    /**
     * Get the output for a specific phase
     * @param {number} phaseNumber
     * @returns {string}
     */
    getPhaseOutput(phaseNumber) {
        const key = /** @type {'phase1_output' | 'phase2_output' | 'phase3_output'} */ (`phase${phaseNumber}_output`);
        return this.project[key] || '';
    }

    /**
     * Export the project as a Markdown document
     * @returns {string}
     */
    exportAsMarkdown() {
        const attribution = '\n\n---\n\n*Generated with [Strategic Proposal Assistant](https://bordenet.github.io/strategic-proposal/)*';

        let md = `# Strategic Proposal: ${this.project.dealershipName}\n\n`;
        md += `**Created**: ${new Date(this.project.createdAt).toLocaleDateString()}\n`;
        md += `**Last Updated**: ${new Date(this.project.updatedAt).toLocaleDateString()}\n\n`;

        // Include final output (Phase 3) as the main content
        const finalOutput = this.getPhaseOutput(3);
        if (finalOutput) {
            md += finalOutput;
        }

        md += attribution;
        return md;
    }

    /**
     * Get workflow progress as a percentage
     * @returns {number}
     */
    getProgress() {
        return Math.round((this.currentPhase / WORKFLOW_CONFIG.phaseCount) * 100);
    }

    /**
     * Get the last completed phase with its response
     * @returns {{phase: number, response: string} | null}
     */
    getLastCompletedPhase() {
        // Check phases in reverse order to find the last one with output
        for (let i = WORKFLOW_CONFIG.phaseCount; i >= 1; i--) {
            const output = this.getPhaseOutput(i);
            if (output) {
                return { phase: i, response: output };
            }
        }
        return null;
    }
}

/**
 * Get metadata for a specific phase
 * @param {number} phaseNumber
 * @returns {import('./types.js').PhaseConfig | undefined}
 */
export function getPhaseMetadata(phaseNumber) {
    return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}

/**
 * Generate the prompt for a specific phase
 * @param {import('./types.js').Project} project
 * @param {number} phaseNumber
 * @returns {Promise<string>}
 */
export async function generatePromptForPhase(project, phaseNumber) {
    const workflow = new Workflow(project);
    workflow.currentPhase = phaseNumber;
    return await workflow.generatePrompt();
}

/**
 * Export the final document as Markdown
 * @param {import('./types.js').Project} project
 * @returns {string}
 */
export function exportFinalDocument(project) {
    const workflow = new Workflow(project);
    return workflow.exportAsMarkdown();
}

/**
 * Get the final markdown content from a project
 * @param {import('./types.js').Project} project - Project object
 * @returns {string|null} The markdown content or null if none exists
 */
export function getFinalMarkdown(project) {
    const workflow = new Workflow(project);
    const lastPhase = workflow.getLastCompletedPhase();
    if (lastPhase && lastPhase.response) {
        return workflow.exportAsMarkdown();
    }
    return null;
}

/**
 * Generate export filename for a project
 * @param {import('./types.js').Project} project - Project object
 * @returns {string} Filename with .md extension
 */
export function getExportFilename(project) {
    return `${(project.title || 'strategic-proposal').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-proposal.md`;
}

