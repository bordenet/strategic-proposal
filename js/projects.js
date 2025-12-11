/**
 * Project Management Module
 * Handles proposal CRUD operations for Strategic Proposal Generator
 */

import storage from './storage.js';

/**
 * Create a new proposal project with dealership-specific fields
 */
export async function createProject(formData) {
    const project = {
        id: crypto.randomUUID(),
        title: formData.title || `Proposal - ${formData.dealershipName}`,
        
        // Dealership Information
        dealershipName: formData.dealershipName || '',
        dealershipLocation: formData.dealershipLocation || '',
        storeCount: formData.storeCount || '',
        currentVendor: formData.currentVendor || '',
        decisionMakerName: formData.decisionMakerName || '',
        decisionMakerRole: formData.decisionMakerRole || '',
        
        // Input Materials
        conversationTranscripts: formData.conversationTranscripts || '',
        meetingNotes: formData.meetingNotes || '',
        attachmentText: formData.attachmentText || '',
        painPoints: formData.painPoints || '',
        additionalContext: formData.additionalContext || '',
        
        // Working Draft (for refinement workflow)
        workingDraft: formData.workingDraft || '',
        
        // Phase outputs
        phase1_output: '',
        phase2_output: '',
        phase3_output: '',
        
        // Workflow state
        phase: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: {
            1: { prompt: '', response: '', completed: false },
            2: { prompt: '', response: '', completed: false },
            3: { prompt: '', response: '', completed: false }
        }
    };

    await storage.saveProject(project);
    return project;
}

export async function getAllProjects() {
    return await storage.getAllProjects();
}

export async function getProject(id) {
    return await storage.getProject(id);
}

export async function updatePhase(projectId, phase, prompt, response) {
    const project = await storage.getProject(projectId);
    if (!project) throw new Error('Project not found');

    project.phases[phase] = {
        prompt: prompt || '',
        response: response || '',
        completed: !!response
    };

    // Store phase output
    project[`phase${phase}_output`] = response || '';

    // Auto-advance to next phase if current phase is completed
    if (response && phase < 3) {
        project.phase = phase + 1;
    }

    project.updatedAt = new Date().toISOString();
    await storage.saveProject(project);
    return project;
}

export async function updateProject(projectId, updates) {
    const project = await storage.getProject(projectId);
    if (!project) throw new Error('Project not found');

    Object.assign(project, updates);
    project.updatedAt = new Date().toISOString();
    await storage.saveProject(project);
    return project;
}

export async function deleteProject(id) {
    await storage.deleteProject(id);
}

export async function exportProject(projectId) {
    const project = await storage.getProject(projectId);
    if (!project) throw new Error('Project not found');

    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${sanitizeFilename(project.dealershipName)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export async function exportAllProjects() {
    const projects = await storage.getAllProjects();
    
    const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        projectCount: projects.length,
        projects: projects
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategic-proposals-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export async function importProjects(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const content = JSON.parse(e.target.result);
                let imported = 0;

                if (content.version && content.projects) {
                    for (const project of content.projects) {
                        await storage.saveProject(project);
                        imported++;
                    }
                } else if (content.id && content.dealershipName) {
                    await storage.saveProject(content);
                    imported = 1;
                } else {
                    throw new Error('Invalid file format');
                }

                resolve(imported);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function sanitizeFilename(filename) {
    return (filename || 'proposal')
        .replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
        .substring(0, 50);
}

