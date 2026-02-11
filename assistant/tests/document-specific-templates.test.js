/**
 * @jest-environment jsdom
 */

import { DOCUMENT_TEMPLATES, getTemplate, getAllTemplates } from '../../shared/js/document-specific-templates.js';

describe('Document-Specific Templates', () => {
  describe('DOCUMENT_TEMPLATES', () => {
    it('should have all expected templates', () => {
      const expectedIds = ['blank', 'competitorSwitch', 'greenfield', 'expansion', 'enterprise'];
      const actualIds = Object.keys(DOCUMENT_TEMPLATES);
      expect(actualIds).toEqual(expect.arrayContaining(expectedIds));
      expect(actualIds.length).toBe(expectedIds.length);
    });

    it('should have all required properties for each template', () => {
      const requiredProps = ['id', 'name', 'icon', 'description', 'organizationName', 'siteCount', 'currentVendor', 'painPoints'];
      Object.values(DOCUMENT_TEMPLATES).forEach(template => {
        requiredProps.forEach(prop => {
          expect(template).toHaveProperty(prop);
        });
      });
    });

    it('should have matching id property and key', () => {
      Object.entries(DOCUMENT_TEMPLATES).forEach(([key, template]) => {
        expect(template.id).toBe(key);
      });
    });
  });

  describe('getTemplate', () => {
    it('should return correct template for valid ID', () => {
      const template = getTemplate('competitorSwitch');
      expect(template).toBeDefined();
      expect(template.id).toBe('competitorSwitch');
      expect(template.name).toBe('Competitor Switch');
    });

    it('should return null for invalid ID', () => {
      const template = getTemplate('nonexistent');
      expect(template).toBeNull();
    });

    it('should return blank template', () => {
      const template = getTemplate('blank');
      expect(template).toBeDefined();
      expect(template.organizationName).toBe('');
      expect(template.painPoints).toBe('');
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates as array', () => {
      const templates = getAllTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(5);
    });

    it('should include blank template first', () => {
      const templates = getAllTemplates();
      expect(templates[0].id).toBe('blank');
    });

    it('should return template objects with all required fields', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('icon');
        expect(template).toHaveProperty('description');
      });
    });
  });

  describe('Template Content', () => {
    it('competitorSwitch should have pain points about current vendor issues', () => {
      const template = getTemplate('competitorSwitch');
      expect(template.painPoints).toContain('Limited functionality');
    });

    it('greenfield should have currentVendor as None', () => {
      const template = getTemplate('greenfield');
      expect(template.currentVendor).toContain('None');
    });

    it('expansion should reference current vendor', () => {
      const template = getTemplate('expansion');
      expect(template.currentVendor).toContain('partial');
    });

    it('enterprise should have siteCount of 10+', () => {
      const template = getTemplate('enterprise');
      expect(template.siteCount).toBe('10+');
    });
  });
});

