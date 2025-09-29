import { describe, it, expect } from 'vitest'
import { validateDork, calculateSafetyScore, sanitizeDorkInput } from '../src/utils/validator.js'

describe('Dork Validator', () => {
  describe('validateDork', () => {
    it('should validate a simple dork', () => {
      const result = validateDork('site:example.com')
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it('should detect unbalanced quotes', () => {
      const result = validateDork('site:example.com "test')
      expect(result.errors).toContain('Unbalanced quotes detected')
    })

    it('should detect unbalanced parentheses', () => {
      const result = validateDork('site:example.com (test')
      expect(result.errors).toContain('Unbalanced parentheses detected')
    })

    it('should warn about sensitive searches', () => {
      const result = validateDork('intext:password intext:username')
      expect(result.warnings.some(w => w.includes('password'))).toBe(true)
    })

    it('should detect protocol in site operator', () => {
      const result = validateDork('site:https://example.com')
      expect(result.errors).toContain('Site operator should not include protocol (http/https)')
    })
  })

  describe('calculateSafetyScore', () => {
    it('should give high score to safe dorks', () => {
      const score = calculateSafetyScore('site:example.com filetype:pdf')
      expect(score).toBeGreaterThan(80)
    })

    it('should give lower score to sensitive dorks', () => {
      const score = calculateSafetyScore('intext:password admin login')
      expect(score).toBeLessThan(80)
    })

    it('should give bonus for educational domains', () => {
      const normalScore = calculateSafetyScore('site:somesite.com')
      const eduScore = calculateSafetyScore('site:example.com')
      expect(eduScore).toBeGreaterThan(normalScore)
    })
  })

  describe('sanitizeDorkInput', () => {
    it('should remove dangerous characters', () => {
      const result = sanitizeDorkInput('test<script>alert(1)</script>')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    })

    it('should remove javascript protocol', () => {
      const result = sanitizeDorkInput('javascript:alert(1)')
      expect(result).not.toContain('javascript:')
    })

    it('should limit length', () => {
      const longInput = 'a'.repeat(600)
      const result = sanitizeDorkInput(longInput)
      expect(result.length).toBeLessThanOrEqual(500)
    })
  })
})