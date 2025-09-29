// Google Dork validator to check for common issues and security concerns

export const validateDork = (dork) => {
  const errors = []
  const warnings = []
  
  if (!dork || dork.trim() === '') {
    errors.push('Dork cannot be empty')
    return { errors, warnings }
  }
  
  // Check for balanced quotes
  const quoteCount = (dork.match(/"/g) || []).length
  if (quoteCount % 2 !== 0) {
    errors.push('Unbalanced quotes detected')
  }
  
  // Check for balanced parentheses
  const openParens = (dork.match(/\(/g) || []).length
  const closeParens = (dork.match(/\)/g) || []).length
  if (openParens !== closeParens) {
    errors.push('Unbalanced parentheses detected')
  }
  
  // Check for suspicious or potentially harmful patterns
  const suspiciousPatterns = [
    { pattern: /intext:.*password.*intext:.*username/i, message: 'Searching for both passwords and usernames' },
    { pattern: /intext:.*credit.*card/i, message: 'Searching for credit card information' },
    { pattern: /intext:.*ssn|social.*security/i, message: 'Searching for social security numbers' },
    { pattern: /intext:.*medical|patient/i, message: 'Searching for medical records' },
    { pattern: /intext:.*"index of".*password/i, message: 'Searching for password files in directories' }
  ]
  
  suspiciousPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(dork)) {
      warnings.push(`Potentially sensitive search: ${message}`)
    }
  })
  
  // Check for overly broad searches that might cause issues
  const broadPatterns = [
    { pattern: /^[^:]*$/, message: 'Very broad search without operators' },
    { pattern: /site:\*/, message: 'Wildcard site operator may not work as expected' }
  ]
  
  broadPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(dork)) {
      warnings.push(message)
    }
  })
  
  // Check for common Google operator mistakes
  const operatorMistakes = [
    { pattern: /site\s*:\s*http/i, message: 'Site operator should not include protocol (http/https)' },
    { pattern: /filetype\s*:\s*\./, message: 'Filetype operator should not include dot before extension' },
    { pattern: /inurl\s*:\s*https?:\/\//, message: 'Inurl operator should not include full URLs' }
  ]
  
  operatorMistakes.forEach(({ pattern, message }) => {
    if (pattern.test(dork)) {
      errors.push(message)
    }
  })
  
  // Check for deprecated or less effective operators
  const deprecatedPatterns = [
    { pattern: /link:/i, message: 'The "link:" operator is deprecated and rarely works' },
    { pattern: /info:/i, message: 'The "info:" operator has limited functionality' }
  ]
  
  deprecatedPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(dork)) {
      warnings.push(message)
    }
  })
  
  // Check for potentially rate-limiting patterns
  if (dork.length > 200) {
    warnings.push('Very long dork may hit search engine limits')
  }
  
  // Check for multiple OR operators that might be inefficient
  const orCount = (dork.match(/\|/g) || []).length
  if (orCount > 5) {
    warnings.push('Multiple OR operators may make search less effective')
  }
  
  // Check for security education red flags
  const redFlags = [
    { pattern: /gov\.|\.mil\.|\.edu\./i, message: 'Targeting government, military, or educational domains requires special care' },
    { pattern: /bank|financial|healthcare/i, message: 'Targeting financial or healthcare domains requires special authorization' },
    { pattern: /intext:.*"confidential"|"classified"|"restricted"/i, message: 'Searching for classified information' }
  ]
  
  redFlags.forEach(({ pattern, message }) => {
    if (pattern.test(dork)) {
      warnings.push(`⚠️ CAUTION: ${message}`)
    }
  })
  
  return { errors, warnings }
}

// Function to suggest improvements for common dork issues
export const suggestImprovements = (dork) => {
  const suggestions = []
  
  if (!dork) return suggestions
  
  // Suggest site operator for more focused searches
  if (!dork.includes('site:') && !dork.includes('inurl:')) {
    suggestions.push('Consider adding a "site:" operator to limit results to specific domains')
  }
  
  // Suggest file type restrictions for document searches
  if (dork.includes('password') || dork.includes('config') || dork.includes('backup')) {
    if (!dork.includes('filetype:') && !dork.includes('ext:')) {
      suggestions.push('Consider adding file type restrictions (filetype:txt, filetype:conf, etc.)')
    }
  }
  
  // Suggest using quotes for exact phrases
  const words = dork.split(/\s+/).filter(word => 
    !word.includes(':') && 
    !word.includes('(') && 
    !word.includes(')') && 
    !word.includes('|') &&
    word.length > 3
  )
  
  if (words.length > 1 && !dork.includes('"')) {
    suggestions.push('Consider using quotes for exact phrase matching')
  }
  
  return suggestions
}

// Function to check if a dork is educational/safe
export const isEducationalDork = (dork) => {
  const educationalPatterns = [
    /site:example\.com/i,
    /site:test\.com/i,
    /site:demo\./i,
    /site:.*\.test/i
  ]
  
  return educationalPatterns.some(pattern => pattern.test(dork))
}

// Function to sanitize user input
export const sanitizeDorkInput = (input) => {
  if (!input) return ''
  
  // Remove potentially harmful characters
  let sanitized = input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .trim()
  
  // Limit length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500)
  }
  
  return sanitized
}

// Function to generate a safety score for a dork
export const calculateSafetyScore = (dork) => {
  let score = 100 // Start with perfect score
  
  const validation = validateDork(dork)
  
  // Deduct points for errors and warnings
  score -= validation.errors.length * 20
  score -= validation.warnings.length * 10
  
  // Deduct points for sensitive searches
  const sensitiveTerms = [
    'password', 'passwd', 'admin', 'login', 'config', 'backup',
    'database', 'mysql', 'sql', 'error', 'debug', 'test'
  ]
  
  sensitiveTerms.forEach(term => {
    if (dork.toLowerCase().includes(term)) {
      score -= 5
    }
  })
  
  // Add points for educational domains
  if (isEducationalDork(dork)) {
    score += 20
  }
  
  // Ensure score stays within bounds
  return Math.max(0, Math.min(100, score))
}

// Export validation categories for UI
export const VALIDATION_CATEGORIES = {
  SYNTAX: 'syntax',
  SECURITY: 'security',
  EFFECTIVENESS: 'effectiveness',
  ETHICS: 'ethics'
}