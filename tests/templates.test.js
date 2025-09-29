import { describe, it, expect } from 'vitest'
import { expandTemplate, generateExplanation, PRESET_CATEGORIES } from '../src/utils/templates.js'

describe('Template Engine', () => {
  describe('expandTemplate', () => {
    it('should expand single variable', () => {
      const result = expandTemplate('site:{domain}', { domain: 'example.com' })
      expect(result).toEqual(['site:example.com'])
    })

    it('should expand multiple values', () => {
      const result = expandTemplate('filetype:{ext}', { ext: 'pdf,doc' })
      expect(result).toEqual(['filetype:pdf', 'filetype:doc'])
    })

    it('should handle multiple variables', () => {
      const result = expandTemplate('site:{domain} filetype:{ext}', { 
        domain: 'example.com', 
        ext: 'pdf' 
      })
      expect(result).toEqual(['site:example.com filetype:pdf'])
    })

    it('should create permutations for multiple multi-value variables', () => {
      const result = expandTemplate('site:{domain} filetype:{ext}', { 
        domain: 'example.com,test.com', 
        ext: 'pdf,doc' 
      })
      expect(result).toHaveLength(4)
      expect(result).toContain('site:example.com filetype:pdf')
      expect(result).toContain('site:example.com filetype:doc')
      expect(result).toContain('site:test.com filetype:pdf')
      expect(result).toContain('site:test.com filetype:doc')
    })

    it('should handle empty variables', () => {
      const result = expandTemplate('site:{domain}', { domain: '' })
      expect(result).toEqual([])
    })
  })

  describe('generateExplanation', () => {
    it('should explain site operator', () => {
      const explanation = generateExplanation('site:example.com')
      expect(explanation).toContain('domain: example.com')
    })

    it('should explain file type operator', () => {
      const explanation = generateExplanation('filetype:pdf')
      expect(explanation).toContain('extension: pdf')
    })

    it('should identify security warnings', () => {
      const explanation = generateExplanation('intext:password')
      expect(explanation).toContain('password-related information')
    })

    it('should include safety reminder', () => {
      const explanation = generateExplanation('site:example.com')
      expect(explanation).toContain('permission to test')
    })
  })

  describe('PRESET_CATEGORIES', () => {
    it('should have all required categories', () => {
      const requiredCategories = [
        'Information Disclosure',
        'Files & Extensions', 
        'Admin Panels',
        'Exposed Databases',
        'Open Directories',
        'Login Pages',
        'CMS Instances'
      ]
      
      requiredCategories.forEach(category => {
        expect(PRESET_CATEGORIES).toHaveProperty(category)
        expect(Array.isArray(PRESET_CATEGORIES[category])).toBe(true)
        expect(PRESET_CATEGORIES[category].length).toBeGreaterThan(0)
      })
    })

    it('should have valid template syntax', () => {
      Object.values(PRESET_CATEGORIES).forEach(templates => {
        templates.forEach(template => {
          expect(typeof template).toBe('string')
          expect(template.length).toBeGreaterThan(0)
          // Check for basic Google operators
          expect(template).toMatch(/(site:|filetype:|inurl:|intitle:|intext:|ext:)/)
        })
      })
    })
  })
})