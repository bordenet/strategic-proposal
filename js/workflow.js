/**
 * Workflow Module
 * Manages the 3-phase adversarial workflow for Strategic Proposal Generator
 */

export const WORKFLOW_CONFIG = {
    phaseCount: 3,
    phases: [
        {
            number: 1,
            name: 'Initial Draft',
            aiModel: 'Claude Sonnet 4',
            aiUrl: 'https://claude.ai/new',
            promptFile: 'prompts/phase1.md',
            description: 'Generate initial proposal from dealership data and conversations'
        },
        {
            number: 2,
            name: 'Adversarial Review',
            aiModel: 'Gemini 2.5 Pro',
            aiUrl: 'https://gemini.google.com/app',
            promptFile: 'prompts/phase2.md',
            description: 'Critique as a shrewd decision-maker evaluating the proposal'
        },
        {
            number: 3,
            name: 'Final Synthesis',
            aiModel: 'Claude Sonnet 4',
            aiUrl: 'https://claude.ai/new',
            promptFile: 'prompts/phase3.md',
            description: 'Synthesize critique into compelling final proposal'
        }
    ]
};

// Prompt templates cache
let promptTemplates = {};

/**
 * Load default prompts from files
 */
export async function loadDefaultPrompts() {
    for (const phase of WORKFLOW_CONFIG.phases) {
        try {
            const response = await fetch(phase.promptFile);
            if (response.ok) {
                promptTemplates[phase.number] = await response.text();
            }
        } catch (error) {
            console.warn(`Failed to load prompt for phase ${phase.number}:`, error);
        }
    }
}

export class Workflow {
    constructor(project) {
        this.project = project;
        this.currentPhase = project.phase || 1;
    }

    getCurrentPhase() {
        return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase);
    }

    getNextPhase() {
        if (this.currentPhase >= WORKFLOW_CONFIG.phaseCount) return null;
        return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase + 1);
    }

    isComplete() {
        return this.currentPhase > WORKFLOW_CONFIG.phaseCount;
    }

    advancePhase() {
        if (this.currentPhase < WORKFLOW_CONFIG.phaseCount) {
            this.currentPhase++;
            this.project.phase = this.currentPhase;
            return true;
        }
        return false;
    }

    async generatePrompt() {
        const phase = this.getCurrentPhase();
        let template = promptTemplates[phase.number] || '';

        // Replace all placeholders with project data
        template = this.replaceVariables(template);
        return template;
    }

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

    savePhaseOutput(output) {
        const phaseKey = `phase${this.currentPhase}_output`;
        this.project[phaseKey] = output;
        this.project.updatedAt = new Date().toISOString();
    }

    getPhaseOutput(phaseNumber) {
        return this.project[`phase${phaseNumber}_output`] || '';
    }

    exportAsMarkdown() {
        let md = `# Strategic Proposal: ${this.project.dealershipName}\n\n`;
        md += `**Created**: ${new Date(this.project.createdAt).toLocaleDateString()}\n`;
        md += `**Last Updated**: ${new Date(this.project.updatedAt).toLocaleDateString()}\n\n`;
        
        // Include final output (Phase 3) as the main content
        const finalOutput = this.getPhaseOutput(3);
        if (finalOutput) {
            md += finalOutput;
        }
        
        return md;
    }

    getProgress() {
        return Math.round((this.currentPhase / WORKFLOW_CONFIG.phaseCount) * 100);
    }
}

export function getPhaseMetadata(phaseNumber) {
    return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}

export async function generatePromptForPhase(project, phaseNumber) {
    const workflow = new Workflow(project);
    workflow.currentPhase = phaseNumber;
    return await workflow.generatePrompt();
}

export function exportFinalDocument(project) {
    const workflow = new Workflow(project);
    return workflow.exportAsMarkdown();
}

