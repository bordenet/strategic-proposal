/**
 * Document-Specific Templates for Strategic Proposal
 * Pre-filled content for common dealership proposal use cases
 * @module document-specific-templates
 */

/**
 * @typedef {Object} StrategicProposalTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Short description
 * @property {string} dealershipName - Pre-filled dealership name
 * @property {string} storeCount - Pre-filled store count
 * @property {string} currentVendor - Pre-filled current vendor
 * @property {string} painPoints - Pre-filled pain points
 */

/** @type {Record<string, StrategicProposalTemplate>} */
export const DOCUMENT_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    dealershipName: '',
    storeCount: '',
    currentVendor: '',
    painPoints: ''
  },
  competitorSwitch: {
    id: 'competitorSwitch',
    name: 'Competitor Switch',
    icon: '🔄',
    description: 'Replace competitor solution',
    dealershipName: '[Dealership Name]',
    storeCount: '',
    currentVendor: '[Current Vendor]',
    painPoints: `- Limited functionality in [specific area]
- Poor response time / support issues
- Pricing concerns (cost per store, hidden fees)
- Integration issues with DMS/CRM
- Lack of customization options`
  },
  greenfield: {
    id: 'greenfield',
    name: 'New Implementation',
    icon: '🌱',
    description: 'First-time solution',
    dealershipName: '[Dealership Name]',
    storeCount: '',
    currentVendor: 'None (manual processes)',
    painPoints: `- Manual call handling overwhelms staff
- Missed calls during peak hours
- No after-hours coverage
- Inconsistent customer experience
- Staff turnover creates training burden`
  },
  expansion: {
    id: 'expansion',
    name: 'Expansion Deal',
    icon: '📈',
    description: 'Existing customer growth',
    dealershipName: '[Dealership Name]',
    storeCount: '',
    currentVendor: 'CallBox (partial)',
    painPoints: `- Current deployment working well, need more coverage
- New acquisitions need onboarding
- Want to standardize across all locations
- Volume growth requires additional capacity`
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Group',
    icon: '🏢',
    description: 'Large dealer group',
    dealershipName: '[Group Name]',
    storeCount: '10+',
    currentVendor: '[Current Vendor(s)]',
    painPoints: `- Inconsistent solutions across locations
- Need centralized reporting/management
- Compliance and brand consistency concerns
- Volume pricing not optimized
- Multiple vendor relationships to manage`
  }
};

/**
 * Get a template by ID
 * @param {string} templateId - The template ID
 * @returns {StrategicProposalTemplate|null} The template or null if not found
 */
export function getTemplate(templateId) {
  return DOCUMENT_TEMPLATES[templateId] || null;
}

/**
 * Get all templates as an array
 * @returns {StrategicProposalTemplate[]} Array of all templates
 */
export function getAllTemplates() {
  return Object.values(DOCUMENT_TEMPLATES);
}

