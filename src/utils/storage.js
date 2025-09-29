// Enhanced localStorage management for Googlr
// Provides smart caching, data validation, and automatic cleanup

const STORAGE_KEYS = {
  PRESETS: 'googlr_presets',
  AUDIT_LOG: 'googlr_audit_log',
  USER_PREFERENCES: 'googlr_user_preferences',
  SESSION_STATE: 'googlr_session_state',
  RECENT_DORKS: 'googlr_recent_dorks',
  FAVORITE_TEMPLATES: 'googlr_favorite_templates',
  SEARCH_HISTORY: 'googlr_search_history',
  USAGE_STATS: 'googlr_usage_stats',
  ETHICS_ACCEPTANCE: 'googlr_ethics_accepted',
  LAST_CLEANUP: 'googlr_last_cleanup'
}

const DEFAULT_PREFERENCES = {
  theme: 'light',
  autoSave: true,
  showValidationWarnings: true,
  maxRecentDorks: 20,
  maxAuditLogEntries: 1000,
  enableAnalytics: true,
  defaultCategory: '',
  compactMode: false,
  exportFormat: 'txt'
}

const CLEANUP_INTERVAL = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB limit

class LocalStorageManager {
  constructor() {
    this.initializeStorage()
    this.setupPeriodicCleanup()
  }

  // Initialize storage with default values
  initializeStorage() {
    if (!this.get(STORAGE_KEYS.USER_PREFERENCES)) {
      this.set(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES)
    }
    
    if (!this.get(STORAGE_KEYS.USAGE_STATS)) {
      this.set(STORAGE_KEYS.USAGE_STATS, {
        sessionsCount: 0,
        dorksGenerated: 0,
        templatesUsed: {},
        categoriesUsed: {},
        lastVisit: null,
        totalTimeSpent: 0
      })
    }

    this.performCleanupIfNeeded()
  }

  // Generic get method with error handling and validation
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      
      const parsed = JSON.parse(item)
      
      // Validate data structure
      if (this.isValidData(key, parsed)) {
        return parsed
      } else {
        console.warn(`Invalid data structure for key: ${key}`)
        localStorage.removeItem(key)
        return defaultValue
      }
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return defaultValue
    }
  }

  // Generic set method with size checking and compression
  set(key, value) {
    try {
      // Check storage size before setting
      if (this.getStorageSize() > MAX_STORAGE_SIZE) {
        this.performEmergencyCleanup()
      }

      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
      
      // Update last modified timestamp
      this.updateMetadata(key)
      
      return true
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error)
      
      // If quota exceeded, try cleanup and retry
      if (error.name === 'QuotaExceededError') {
        this.performEmergencyCleanup()
        try {
          localStorage.setItem(key, JSON.stringify(value))
          return true
        } catch (retryError) {
          console.error('Failed to save after cleanup:', retryError)
          return false
        }
      }
      return false
    }
  }

  // Remove item with cleanup
  remove(key) {
    try {
      localStorage.removeItem(key)
      this.removeMetadata(key)
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
    }
  }

  // Get user preferences with fallback
  getPreferences() {
    return { ...DEFAULT_PREFERENCES, ...this.get(STORAGE_KEYS.USER_PREFERENCES, {}) }
  }

  // Update specific preference
  updatePreference(key, value) {
    const preferences = this.getPreferences()
    preferences[key] = value
    this.set(STORAGE_KEYS.USER_PREFERENCES, preferences)
  }

  // Save preset with enhanced metadata
  savePreset(preset) {
    const presets = this.get(STORAGE_KEYS.PRESETS, [])
    const enhancedPreset = {
      ...preset,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      tags: this.generateTags(preset)
    }
    
    presets.push(enhancedPreset)
    this.set(STORAGE_KEYS.PRESETS, presets)
    this.logAction('PRESET_SAVED', { presetId: enhancedPreset.id })
    
    return enhancedPreset
  }

  // Get presets with sorting and filtering options
  getPresets(options = {}) {
    let presets = this.get(STORAGE_KEYS.PRESETS, [])
    
    // Filter by category if specified
    if (options.category) {
      presets = presets.filter(p => p.category === options.category)
    }
    
    // Filter by tags if specified
    if (options.tags && options.tags.length > 0) {
      presets = presets.filter(p => 
        p.tags && p.tags.some(tag => options.tags.includes(tag))
      )
    }
    
    // Sort presets
    const sortBy = options.sortBy || 'updatedAt'
    const sortOrder = options.sortOrder || 'desc'
    
    presets.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      if (sortBy === 'usageCount') {
        aVal = aVal || 0
        bVal = bVal || 0
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1
      } else {
        return aVal > bVal ? 1 : -1
      }
    })
    
    return presets
  }

  // Update preset usage count
  incrementPresetUsage(presetId) {
    const presets = this.get(STORAGE_KEYS.PRESETS, [])
    const preset = presets.find(p => p.id === presetId)
    
    if (preset) {
      preset.usageCount = (preset.usageCount || 0) + 1
      preset.lastUsed = new Date().toISOString()
      this.set(STORAGE_KEYS.PRESETS, presets)
    }
  }

  // Save recent dork with deduplication
  saveRecentDork(dork, metadata = {}) {
    const preferences = this.getPreferences()
    const recent = this.get(STORAGE_KEYS.RECENT_DORKS, [])
    
    // Remove if already exists (to move to front)
    const filtered = recent.filter(item => item.dork !== dork)
    
    const dorkEntry = {
      dork,
      timestamp: new Date().toISOString(),
      metadata,
      id: this.generateId()
    }
    
    // Add to front
    filtered.unshift(dorkEntry)
    
    // Limit size
    const maxRecent = preferences.maxRecentDorks || 20
    const trimmed = filtered.slice(0, maxRecent)
    
    this.set(STORAGE_KEYS.RECENT_DORKS, trimmed)
    this.updateUsageStats('dorksGenerated')
  }

  // Get recent dorks with optional filtering
  getRecentDorks(limit = null) {
    const recent = this.get(STORAGE_KEYS.RECENT_DORKS, [])
    return limit ? recent.slice(0, limit) : recent
  }

  // Smart audit logging with automatic cleanup
  logAction(action, details = {}) {
    const preferences = this.getPreferences()
    const log = this.get(STORAGE_KEYS.AUDIT_LOG, [])
    
    const logEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action,
      details,
      sessionId: this.getSessionId()
    }
    
    log.push(logEntry)
    
    // Auto-cleanup if too many entries
    const maxEntries = preferences.maxAuditLogEntries || 1000
    if (log.length > maxEntries) {
      log.splice(0, log.length - maxEntries)
    }
    
    this.set(STORAGE_KEYS.AUDIT_LOG, log)
  }

  // Get audit log with filtering
  getAuditLog(options = {}) {
    let log = this.get(STORAGE_KEYS.AUDIT_LOG, [])
    
    // Filter by action type
    if (options.action) {
      log = log.filter(entry => entry.action === options.action)
    }
    
    // Filter by date range
    if (options.since) {
      const since = new Date(options.since)
      log = log.filter(entry => new Date(entry.timestamp) >= since)
    }
    
    // Limit results
    if (options.limit) {
      log = log.slice(-options.limit)
    }
    
    return log.reverse() // Most recent first
  }

  // Session state management
  saveSessionState(state) {
    const sessionState = {
      ...state,
      lastSaved: new Date().toISOString(),
      sessionId: this.getSessionId()
    }
    this.set(STORAGE_KEYS.SESSION_STATE, sessionState)
  }

  getSessionState() {
    const state = this.get(STORAGE_KEYS.SESSION_STATE)
    
    // Check if session is from same browser session
    if (state && state.sessionId === this.getSessionId()) {
      return state
    }
    
    return null
  }

  // Favorite templates management
  addFavoriteTemplate(template, category) {
    const favorites = this.get(STORAGE_KEYS.FAVORITE_TEMPLATES, [])
    
    const favorite = {
      template,
      category,
      addedAt: new Date().toISOString(),
      id: this.generateId()
    }
    
    // Check if already exists
    if (!favorites.some(f => f.template === template)) {
      favorites.push(favorite)
      this.set(STORAGE_KEYS.FAVORITE_TEMPLATES, favorites)
      this.logAction('TEMPLATE_FAVORITED', { template, category })
    }
  }

  removeFavoriteTemplate(template) {
    const favorites = this.get(STORAGE_KEYS.FAVORITE_TEMPLATES, [])
    const filtered = favorites.filter(f => f.template !== template)
    this.set(STORAGE_KEYS.FAVORITE_TEMPLATES, filtered)
    this.logAction('TEMPLATE_UNFAVORITED', { template })
  }

  getFavoriteTemplates() {
    return this.get(STORAGE_KEYS.FAVORITE_TEMPLATES, [])
  }

  // Usage statistics
  updateUsageStats(key, increment = 1) {
    const stats = this.get(STORAGE_KEYS.USAGE_STATS, {})
    
    if (typeof stats[key] === 'number') {
      stats[key] += increment
    } else if (typeof stats[key] === 'object') {
      // For object counters like templatesUsed
      const subKey = arguments[2]
      if (subKey) {
        stats[key][subKey] = (stats[key][subKey] || 0) + increment
      }
    }
    
    stats.lastActivity = new Date().toISOString()
    this.set(STORAGE_KEYS.USAGE_STATS, stats)
  }

  getUsageStats() {
    return this.get(STORAGE_KEYS.USAGE_STATS, {})
  }

  // Search history for analytics
  saveSearchHistory(query, results) {
    const history = this.get(STORAGE_KEYS.SEARCH_HISTORY, [])
    
    const searchEntry = {
      query,
      resultsCount: results.length,
      timestamp: new Date().toISOString(),
      id: this.generateId()
    }
    
    history.push(searchEntry)
    
    // Keep only last 100 searches
    if (history.length > 100) {
      history.splice(0, history.length - 100)
    }
    
    this.set(STORAGE_KEYS.SEARCH_HISTORY, history)
  }

  // Export all data for backup
  exportAllData() {
    const data = {}
    
    Object.values(STORAGE_KEYS).forEach(key => {
      const value = this.get(key)
      if (value !== null) {
        data[key] = value
      }
    })
    
    data.exportedAt = new Date().toISOString()
    data.version = '1.0'
    
    return data
  }

  // Import data with validation
  importData(data, options = {}) {
    const merge = options.merge || false
    const results = { success: [], failed: [], skipped: [] }
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'exportedAt' || key === 'version') return
      
      try {
        if (this.isValidData(key, value)) {
          if (merge && key === STORAGE_KEYS.PRESETS) {
            // Merge presets instead of replacing
            const existing = this.get(key, [])
            const merged = this.mergePresets(existing, value)
            this.set(key, merged)
          } else {
            this.set(key, value)
          }
          results.success.push(key)
        } else {
          results.failed.push(`${key}: Invalid data structure`)
        }
      } catch (error) {
        results.failed.push(`${key}: ${error.message}`)
      }
    })
    
    this.logAction('DATA_IMPORTED', { results })
    return results
  }

  // Cleanup old data
  performCleanupIfNeeded() {
    const lastCleanup = this.get(STORAGE_KEYS.LAST_CLEANUP)
    const now = Date.now()
    
    if (!lastCleanup || (now - new Date(lastCleanup).getTime()) > CLEANUP_INTERVAL) {
      this.performCleanup()
      this.set(STORAGE_KEYS.LAST_CLEANUP, new Date().toISOString())
    }
  }

  performCleanup() {
    // Clean old audit logs
    const preferences = this.getPreferences()
    const auditLog = this.get(STORAGE_KEYS.AUDIT_LOG, [])
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
    const cutoff = new Date(Date.now() - maxAge)
    
    const filteredLog = auditLog.filter(entry => 
      new Date(entry.timestamp) > cutoff
    )
    
    if (filteredLog.length !== auditLog.length) {
      this.set(STORAGE_KEYS.AUDIT_LOG, filteredLog)
    }
    
    // Clean old search history
    const searchHistory = this.get(STORAGE_KEYS.SEARCH_HISTORY, [])
    const recentHistory = searchHistory.filter(entry =>
      new Date(entry.timestamp) > cutoff
    )
    
    if (recentHistory.length !== searchHistory.length) {
      this.set(STORAGE_KEYS.SEARCH_HISTORY, recentHistory)
    }
  }

  performEmergencyCleanup() {
    // Remove oldest audit log entries
    const auditLog = this.get(STORAGE_KEYS.AUDIT_LOG, [])
    if (auditLog.length > 100) {
      this.set(STORAGE_KEYS.AUDIT_LOG, auditLog.slice(-100))
    }
    
    // Remove old search history
    const searchHistory = this.get(STORAGE_KEYS.SEARCH_HISTORY, [])
    if (searchHistory.length > 50) {
      this.set(STORAGE_KEYS.SEARCH_HISTORY, searchHistory.slice(-50))
    }
    
    // Remove old recent dorks
    const recentDorks = this.get(STORAGE_KEYS.RECENT_DORKS, [])
    if (recentDorks.length > 10) {
      this.set(STORAGE_KEYS.RECENT_DORKS, recentDorks.slice(0, 10))
    }
  }

  // Helper methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  generateTags(preset) {
    const tags = []
    
    if (preset.template) {
      if (preset.template.includes('site:')) tags.push('site-specific')
      if (preset.template.includes('filetype:')) tags.push('file-search')
      if (preset.template.includes('admin')) tags.push('admin-panel')
      if (preset.template.includes('login')) tags.push('authentication')
      if (preset.template.includes('password')) tags.push('credentials')
      if (preset.template.includes('config')) tags.push('configuration')
    }
    
    if (preset.category) {
      tags.push(preset.category.toLowerCase().replace(/\s+/g, '-'))
    }
    
    return tags
  }

  getSessionId() {
    if (!this._sessionId) {
      this._sessionId = this.generateId()
    }
    return this._sessionId
  }

  updateMetadata(key) {
    const metadata = this.get('googlr_metadata', {})
    metadata[key] = {
      lastModified: new Date().toISOString(),
      size: localStorage.getItem(key)?.length || 0
    }
    localStorage.setItem('googlr_metadata', JSON.stringify(metadata))
  }

  removeMetadata(key) {
    const metadata = this.get('googlr_metadata', {})
    delete metadata[key]
    localStorage.setItem('googlr_metadata', JSON.stringify(metadata))
  }

  getStorageSize() {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length
      }
    }
    return total
  }

  isValidData(key, data) {
    switch (key) {
      case STORAGE_KEYS.PRESETS:
        return Array.isArray(data) && data.every(preset => 
          preset && typeof preset.name === 'string'
        )
      case STORAGE_KEYS.AUDIT_LOG:
        return Array.isArray(data) && data.every(entry =>
          entry && typeof entry.action === 'string' && entry.timestamp
        )
      case STORAGE_KEYS.USER_PREFERENCES:
        return data && typeof data === 'object'
      default:
        return true
    }
  }

  mergePresets(existing, imported) {
    const existingNames = new Set(existing.map(p => p.name))
    const merged = [...existing]
    
    imported.forEach(preset => {
      if (!existingNames.has(preset.name)) {
        merged.push({
          ...preset,
          id: this.generateId(),
          importedAt: new Date().toISOString()
        })
      }
    })
    
    return merged
  }

  setupPeriodicCleanup() {
    // Run cleanup every hour
    setInterval(() => {
      this.performCleanupIfNeeded()
    }, 60 * 60 * 1000)
  }

  // Clear all data (for privacy/reset)
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    localStorage.removeItem('googlr_metadata')
    this.initializeStorage()
  }
}

// Create singleton instance
const storageManager = new LocalStorageManager()

export default storageManager
export { DEFAULT_PREFERENCES, STORAGE_KEYS }
