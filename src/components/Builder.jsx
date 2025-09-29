import { useEffect, useState } from 'react'
import { PRESET_CATEGORIES, expandTemplate, generateExplanation } from '../utils/templates.js'
import { validateDork } from '../utils/validator.js'
import storageManager from '../utils/storage.js'
import Preview from './Preview.jsx'
import TemplateEditor from './TemplateEditor.jsx'

const Builder = () => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [variables, setVariables] = useState({})
  const [customDork, setCustomDork] = useState('')
  const [generatedDorks, setGeneratedDorks] = useState([])
  const [explanation, setExplanation] = useState('')
  const [validationResults, setValidationResults] = useState([])
  const [savedPresets, setSavedPresets] = useState([])
  const [activeTab, setActiveTab] = useState('templates')
  const [auditLog, setAuditLog] = useState([])
  const [recentDorks, setRecentDorks] = useState([])
  const [favoriteTemplates, setFavoriteTemplates] = useState([])
  const [userPreferences, setUserPreferences] = useState({})
  const [usageStats, setUsageStats] = useState({})
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [sessionRestored, setSessionRestored] = useState(false)

  useEffect(() => {
    // Load all data from enhanced localStorage manager
    const loadData = async () => {
      try {
        // Load preferences first
        const preferences = storageManager.getPreferences()
        setUserPreferences(preferences)
        setAutoSaveEnabled(preferences.autoSave)

        // Load saved data
        const presets = storageManager.getPresets({ sortBy: 'updatedAt' })
        const log = storageManager.getAuditLog({ limit: 100 })
        const recent = storageManager.getRecentDorks(preferences.maxRecentDorks || 20)
        const favorites = storageManager.getFavoriteTemplates()
        const stats = storageManager.getUsageStats()

        setSavedPresets(presets)
        setAuditLog(log)
        setRecentDorks(recent)
        setFavoriteTemplates(favorites)
        setUsageStats(stats)

        // Try to restore session state
        const sessionState = storageManager.getSessionState()
        if (sessionState && preferences.autoSave) {
          setSelectedCategory(sessionState.selectedCategory || '')
          setSelectedTemplate(sessionState.selectedTemplate || '')
          setVariables(sessionState.variables || {})
          setCustomDork(sessionState.customDork || '')
          setActiveTab(sessionState.activeTab || 'templates')
          setSessionRestored(true)
          
          // Regenerate dorks if session had them
          if (sessionState.selectedTemplate && sessionState.variables) {
            const expanded = expandTemplate(sessionState.selectedTemplate, sessionState.variables)
            setGeneratedDorks(expanded)
            if (expanded.length > 0) {
              const validation = expanded.map(dork => validateDork(dork))
              setValidationResults(validation)
              setExplanation(generateExplanation(expanded[0]))
            }
          }
        }

        // Update usage stats
        storageManager.updateUsageStats('sessionsCount')
        
        // Set default category from preferences
        if (!sessionState && preferences.defaultCategory) {
          setSelectedCategory(preferences.defaultCategory)
        }

        // Log session start
        storageManager.logAction('SESSION_STARTED', { 
          restored: !!sessionState,
          preferences: Object.keys(preferences)
        })
      } catch (error) {
        console.error('Error loading data from localStorage:', error)
        storageManager.logAction('LOAD_ERROR', { error: error.message })
      }
    }

    loadData()
  }, [])

  // Auto-save session state when changes occur
  useEffect(() => {
    if (autoSaveEnabled && sessionRestored) {
      const sessionState = {
        selectedCategory,
        selectedTemplate,
        variables,
        customDork,
        activeTab,
        lastActivity: new Date().toISOString()
      }
      
      // Debounce the save operation
      const timeoutId = setTimeout(() => {
        storageManager.saveSessionState(sessionState)
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [selectedCategory, selectedTemplate, variables, customDork, activeTab, autoSaveEnabled, sessionRestored])

  const logAction = (action, details) => {
    storageManager.logAction(action, details)
    
    // Update local state for immediate UI feedback
    const newLog = storageManager.getAuditLog({ limit: 100 })
    setAuditLog(newLog)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setSelectedTemplate('')
    setVariables({})
    
    // Update usage stats
    storageManager.updateUsageStats('categoriesUsed', 1, category)
    
    // Update preferences if this becomes frequent category
    const stats = storageManager.getUsageStats()
    const categoryStats = stats.categoriesUsed || {}
    const mostUsed = Object.keys(categoryStats).reduce((a, b) => 
      categoryStats[a] > categoryStats[b] ? a : b, category
    )
    
    if (mostUsed === category && categoryStats[category] > 3) {
      storageManager.updatePreference('defaultCategory', category)
    }
    
    logAction('CATEGORY_SELECTED', { category })
  }

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template)
    setVariables({})
    
    // Update usage stats
    storageManager.updateUsageStats('templatesUsed', 1, template)
    
    logAction('TEMPLATE_SELECTED', { template, category: selectedCategory })
  }

  const handleVariableChange = (variable, value) => {
    const newVariables = { ...variables, [variable]: value }
    setVariables(newVariables)
    
    if (selectedTemplate) {
      const expanded = expandTemplate(selectedTemplate, newVariables)
      setGeneratedDorks(expanded)
      
      if (expanded.length > 0) {
        const validation = expanded.map(dork => validateDork(dork))
        setValidationResults(validation)
        setExplanation(generateExplanation(expanded[0]))
        
        // Save recent dorks automatically
        expanded.forEach(dork => {
          storageManager.saveRecentDork(dork, {
            template: selectedTemplate,
            category: selectedCategory,
            variables: newVariables
          })
        })
        
        // Update recent dorks state
        setRecentDorks(storageManager.getRecentDorks(userPreferences.maxRecentDorks || 20))
      }
    }
  }

  const handleCustomDorkChange = (value) => {
    setCustomDork(value)
    if (value.trim()) {
      const validation = [validateDork(value)]
      setValidationResults(validation)
      setExplanation(generateExplanation(value))
      setGeneratedDorks([value])
      
      // Save to recent dorks if valid
      if (validation[0] && validation[0].errors.length === 0) {
        storageManager.saveRecentDork(value, {
          type: 'custom',
          createdAt: new Date().toISOString()
        })
        setRecentDorks(storageManager.getRecentDorks(userPreferences.maxRecentDorks || 20))
      }
    } else {
      setValidationResults([])
      setExplanation('')
      setGeneratedDorks([])
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      logAction('COPY_TO_CLIPBOARD', { dork: text })
      storageManager.updateUsageStats('dorksGenerated')
      alert('Copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Copied to clipboard!')
    })
  }

  const exportDorks = (format) => {
    if (generatedDorks.length === 0) return
    
    let content = ''
    let filename = ''
    
    const timestamp = new Date().toISOString().split('T')[0]
    
    if (format === 'txt') {
      content = `# Googlr Export - ${timestamp}\n`
      content += `# Category: ${selectedCategory}\n`
      content += `# Template: ${selectedTemplate}\n`
      content += `# Generated: ${generatedDorks.length} dorks\n\n`
      content += generatedDorks.join('\n')
      filename = `googlr_dorks_${timestamp}.txt`
    } else if (format === 'csv') {
      content = 'Dork,Category,Template,Validation,Timestamp\n'
      content += generatedDorks.map((dork, index) => {
        const validation = validationResults[index]
        const status = validation ? 
          (validation.errors.length > 0 ? 'Error' : 
           validation.warnings.length > 0 ? 'Warning' : 'Valid') : 'Unknown'
        return `"${dork}","${selectedCategory}","${selectedTemplate}","${status}","${new Date().toISOString()}"`
      }).join('\n')
      filename = `googlr_dorks_${timestamp}.csv`
    } else if (format === 'json') {
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          category: selectedCategory,
          template: selectedTemplate,
          variables,
          totalDorks: generatedDorks.length
        },
        dorks: generatedDorks.map((dork, index) => ({
          dork,
          validation: validationResults[index],
          explanation: index === 0 ? explanation : generateExplanation(dork)
        }))
      }
      content = JSON.stringify(exportData, null, 2)
      filename = `googlr_export_${timestamp}.json`
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    
    logAction('EXPORT_DORKS', { format, count: generatedDorks.length, filename })
  }

  const savePreset = () => {
    const name = prompt('Enter preset name:')
    if (!name) return
    
    const preset = {
      name,
      category: selectedCategory,
      template: selectedTemplate,
      variables,
      customDork,
      description: prompt('Enter description (optional):') || ''
    }
    
    const savedPreset = storageManager.savePreset(preset)
    
    // Update local state
    const updatedPresets = storageManager.getPresets({ sortBy: 'updatedAt' })
    setSavedPresets(updatedPresets)
    
    // Show success message
    alert(`Preset "${name}" saved successfully!`)
  }

  const loadPreset = (preset) => {
    setSelectedCategory(preset.category || '')
    setSelectedTemplate(preset.template || '')
    setVariables(preset.variables || {})
    setCustomDork(preset.customDork || '')
    
    // Update usage count
    if (preset.id) {
      storageManager.incrementPresetUsage(preset.id)
    }
    
    if (preset.template && preset.variables) {
      const expanded = expandTemplate(preset.template, preset.variables)
      setGeneratedDorks(expanded)
      
      if (expanded.length > 0) {
        const validation = expanded.map(dork => validateDork(dork))
        setValidationResults(validation)
        setExplanation(generateExplanation(expanded[0]))
      }
    }
    
    // Refresh presets to show updated usage count
    const updatedPresets = storageManager.getPresets({ sortBy: 'updatedAt' })
    setSavedPresets(updatedPresets)
    
    logAction('PRESET_LOADED', { name: preset.name, id: preset.id })
  }

  const clearAuditLog = () => {
    const options = ['Clear all logs', 'Clear logs older than 7 days', 'Clear logs older than 30 days']
    const choice = prompt(`Choose clearing option:\n0: ${options[0]}\n1: ${options[1]}\n2: ${options[2]}\n\nEnter 0, 1, or 2:`)
    
    if (choice === null) return
    
    const choiceIndex = parseInt(choice)
    if (choiceIndex < 0 || choiceIndex > 2) {
      alert('Invalid choice')
      return
    }
    
    if (confirm(`Are you sure you want to ${options[choiceIndex].toLowerCase()}?`)) {
      if (choiceIndex === 0) {
        storageManager.set('googlr_audit_log', [])
        setAuditLog([])
      } else {
        const days = choiceIndex === 1 ? 7 : 30
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        const filteredLog = storageManager.getAuditLog().filter(entry => 
          new Date(entry.timestamp) > cutoff
        )
        storageManager.set('googlr_audit_log', filteredLog)
        setAuditLog(filteredLog)
      }
      
      logAction('AUDIT_LOG_CLEARED', { option: options[choiceIndex] })
    }
  }

  const openInGoogle = (dork) => {
    // Check rate limiting
    const recentSearches = storageManager.getAuditLog({ 
      action: 'MANUAL_SEARCH_OPENED',
      since: new Date(Date.now() - 60000) // Last minute
    })
    
    if (recentSearches.length >= 3) {
      alert('⚠️ Rate limit exceeded. Please wait before opening more searches.')
      return
    }
    
    const validation = validateDork(dork)
    let warningMessage = `⚠️ WARNING: You are about to open a Google search in a new tab.\n\nDork: ${dork}\n\n`
    
    if (validation.warnings.length > 0) {
      warningMessage += `Validation Warnings:\n${validation.warnings.join('\n')}\n\n`
    }
    
    if (validation.errors.length > 0) {
      warningMessage += `Validation Errors:\n${validation.errors.join('\n')}\n\n`
      warningMessage += 'This dork may not work correctly. Continue anyway?\n\n'
    }
    
    warningMessage += 'Ensure you have permission to search for this information and that you comply with all applicable laws and Google\'s Terms of Service.\n\nProceed?'
    
    if (confirm(warningMessage)) {
      const url = `https://www.google.com/search?q=${encodeURIComponent(dork)}`
      window.open(url, '_blank')
      logAction('MANUAL_SEARCH_OPENED', { 
        dork, 
        validation: validation.errors.length === 0 && validation.warnings.length === 0,
        timestamp: new Date().toISOString()
      })
      
      // Save to search history
      storageManager.saveSearchHistory(dork, [{ url }])
    }
  }

  // New smart features
  const addToFavorites = (template, category) => {
    storageManager.addFavoriteTemplate(template, category)
    setFavoriteTemplates(storageManager.getFavoriteTemplates())
    alert('Template added to favorites!')
  }

  const removeFromFavorites = (template) => {
    storageManager.removeFavoriteTemplate(template)
    setFavoriteTemplates(storageManager.getFavoriteTemplates())
    alert('Template removed from favorites!')
  }

  const isFavoriteTemplate = (template) => {
    return favoriteTemplates.some(fav => fav.template === template)
  }

  const loadRecentDork = (recentDork) => {
    if (recentDork.metadata?.template) {
      setSelectedTemplate(recentDork.metadata.template)
      setSelectedCategory(recentDork.metadata.category || '')
      setVariables(recentDork.metadata.variables || {})
      setCustomDork('')
    } else {
      setCustomDork(recentDork.dork)
      setSelectedTemplate('')
      setSelectedCategory('')
      setVariables({})
    }
    
    logAction('RECENT_DORK_LOADED', { dorkId: recentDork.id })
  }

  const bulkExportPresets = () => {
    const data = storageManager.exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `googlr_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    logAction('BULK_EXPORT', { itemCount: Object.keys(data).length })
  }

  const bulkImportPresets = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          const results = storageManager.importData(data, { merge: true })
          
          // Refresh local state
          setSavedPresets(storageManager.getPresets({ sortBy: 'updatedAt' }))
          setAuditLog(storageManager.getAuditLog({ limit: 100 }))
          setRecentDorks(storageManager.getRecentDorks())
          setFavoriteTemplates(storageManager.getFavoriteTemplates())
          
          alert(`Import completed!\nSuccess: ${results.success.length}\nFailed: ${results.failed.length}\nSkipped: ${results.skipped.length}`)
        } catch (error) {
          alert('Error importing data: ' + error.message)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const deletePreset = (presetId) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      const presets = storageManager.get('googlr_presets', [])
      const filtered = presets.filter(p => p.id !== presetId)
      storageManager.set('googlr_presets', filtered)
      setSavedPresets(storageManager.getPresets({ sortBy: 'updatedAt' }))
      logAction('PRESET_DELETED', { presetId })
    }
  }

  const clearRecentDorks = () => {
    if (confirm('Clear all recent dorks?')) {
      storageManager.set('googlr_recent_dorks', [])
      setRecentDorks([])
      logAction('RECENT_DORKS_CLEARED')
    }
  }

  const toggleAutoSave = () => {
    const newValue = !autoSaveEnabled
    setAutoSaveEnabled(newValue)
    storageManager.updatePreference('autoSave', newValue)
    logAction('AUTO_SAVE_TOGGLED', { enabled: newValue })
  }

  const getUsageSummary = () => {
    const stats = storageManager.getUsageStats()
    return {
      totalSessions: stats.sessionsCount || 0,
      totalDorks: stats.dorksGenerated || 0,
      favoriteCategory: Object.keys(stats.categoriesUsed || {}).reduce((a, b) => 
        (stats.categoriesUsed[a] || 0) > (stats.categoriesUsed[b] || 0) ? a : b, 'None'
      ),
      favoriteTemplate: Object.keys(stats.templatesUsed || {}).reduce((a, b) => 
        (stats.templatesUsed[a] || 0) > (stats.templatesUsed[b] || 0) ? a : b, 'None'
      )
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'templates', label: '📝 Templates' },
              { key: 'custom', label: '⚙️ Custom' },
              { key: 'recent', label: '🕒 Recent' },
              { key: 'favorites', label: '⭐ Favorites' },
              { key: 'presets', label: '💾 Presets' },
              { key: 'stats', label: '📈 Stats' },
              { key: 'audit', label: '📊 Audit Log' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Editor */}
        <div className="space-y-6">
          {activeTab === 'templates' && (
            <>
              {/* Category Selection */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Select Category</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.keys(PRESET_CATEGORIES).map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        selectedCategory === category
                          ? 'bg-accent text-white border-accent'
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Selection */}
              {selectedCategory && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Select Template</h3>
                  <div className="space-y-2">
                    {PRESET_CATEGORIES[selectedCategory].map((template, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <button
                          onClick={() => handleTemplateChange(template)}
                          className={`p-3 text-left rounded-lg border transition-colors flex-1 ${
                            selectedTemplate === template
                              ? 'bg-accent text-white border-accent'
                              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                          }`}
                        >
                          <code className="text-sm">{template}</code>
                        </button>
                        <button
                          onClick={() => isFavoriteTemplate(template) 
                            ? removeFromFavorites(template) 
                            : addToFavorites(template, selectedCategory)
                          }
                          className={`p-2 rounded-lg border transition-colors ${
                            isFavoriteTemplate(template)
                              ? 'bg-yellow-100 text-yellow-600 border-yellow-300'
                              : 'bg-gray-100 text-gray-400 border-gray-300 hover:text-yellow-500'
                          }`}
                          title={isFavoriteTemplate(template) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          ⭐
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Template Editor */}
              {selectedTemplate && (
                <TemplateEditor
                  template={selectedTemplate}
                  variables={variables}
                  onVariableChange={handleVariableChange}
                />
              )}
            </>
          )}

          {activeTab === 'custom' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Custom Dork</h3>
              <textarea
                value={customDork}
                onChange={(e) => handleCustomDorkChange(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Enter your custom Google dork here..."
              />
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Recent Dorks</h3>
                <button
                  onClick={clearRecentDorks}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear All
                </button>
              </div>
              
              {recentDorks.length === 0 ? (
                <p className="text-gray-500">No recent dorks</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentDorks.map((recentDork, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <code className="text-sm bg-white p-2 rounded border flex-1 mr-3 break-all">
                          {recentDork.dork}
                        </code>
                        <button
                          onClick={() => loadRecentDork(recentDork)}
                          className="px-3 py-1 bg-accent text-white rounded hover:bg-blue-600 text-sm whitespace-nowrap"
                        >
                          Load
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(recentDork.timestamp).toLocaleString()}
                        {recentDork.metadata?.category && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {recentDork.metadata.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Favorite Templates</h3>
              
              {favoriteTemplates.length === 0 ? (
                <p className="text-gray-500">No favorite templates. Click the ⭐ button next to templates to add them here.</p>
              ) : (
                <div className="space-y-2">
                  {favoriteTemplates.map((favorite, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(favorite.category)
                          handleTemplateChange(favorite.template)
                        }}
                        className="p-3 text-left rounded-lg border transition-colors flex-1 bg-gray-50 hover:bg-gray-100 border-gray-200"
                      >
                        <div className="flex justify-between items-center">
                          <code className="text-sm">{favorite.template}</code>
                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded">
                            {favorite.category}
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={() => removeFromFavorites(favorite.template)}
                        className="p-2 rounded-lg border bg-yellow-100 text-yellow-600 border-yellow-300 hover:bg-yellow-200"
                        title="Remove from favorites"
                      >
                        ⭐
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Usage Statistics</h3>
                <div className="flex gap-2">
                  <button
                    onClick={toggleAutoSave}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      autoSaveEnabled 
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    Auto-save: {autoSaveEnabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={bulkExportPresets}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Export Data
                  </button>
                  <button
                    onClick={bulkImportPresets}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Import Data
                  </button>
                </div>
              </div>
              
              {(() => {
                const summary = getUsageSummary()
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{summary.totalSessions}</div>
                      <div className="text-sm text-blue-700">Total Sessions</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{summary.totalDorks}</div>
                      <div className="text-sm text-green-700">Dorks Generated</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{summary.favoriteCategory}</div>
                      <div className="text-sm text-purple-700">Most Used Category</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-xs font-mono text-orange-600 break-all">
                        {summary.favoriteTemplate.length > 30 
                          ? summary.favoriteTemplate.substring(0, 30) + '...'
                          : summary.favoriteTemplate
                        }
                      </div>
                      <div className="text-sm text-orange-700">Most Used Template</div>
                    </div>
                    
                    <div className="col-span-2 mt-4">
                      <h4 className="font-medium mb-2">Storage Usage</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="font-medium">{savedPresets.length}</div>
                          <div className="text-gray-600">Presets</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="font-medium">{recentDorks.length}</div>
                          <div className="text-gray-600">Recent Dorks</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="font-medium">{favoriteTemplates.length}</div>
                          <div className="text-gray-600">Favorites</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Saved Presets</h3>
                <button
                  onClick={savePreset}
                  disabled={!selectedTemplate && !customDork}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                  Save Current
                </button>
              </div>
              
              {savedPresets.length === 0 ? (
                <p className="text-gray-500">No saved presets</p>
              ) : (
                <div className="space-y-2">
                  {savedPresets.map((preset, index) => (
                    <div key={preset.id || index} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium">{preset.name}</div>
                          {preset.description && (
                            <div className="text-sm text-gray-600 mt-1">{preset.description}</div>
                          )}
                          <div className="text-sm text-gray-500 mt-1">
                            {preset.category} • {new Date(preset.createdAt || preset.timestamp).toLocaleDateString()}
                            {preset.usageCount > 0 && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                Used {preset.usageCount} times
                              </span>
                            )}
                          </div>
                          {preset.tags && preset.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {preset.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                                  {tag}
                                </span>
                              ))}
                              {preset.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                                  +{preset.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadPreset(preset)}
                            className="px-3 py-1 bg-accent text-white rounded hover:bg-blue-600 text-sm"
                          >
                            Load
                          </button>
                          {preset.id && (
                            <button
                              onClick={() => deletePreset(preset.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      {preset.template && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <code className="text-xs text-gray-700">{preset.template}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Audit Log</h3>
                <button
                  onClick={clearAuditLog}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear Log
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {auditLog.length === 0 ? (
                  <p className="text-gray-500">No actions logged</p>
                ) : (
                  <div className="space-y-2">
                    {auditLog.slice().reverse().map((entry, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="font-medium">{entry.action}</div>
                        <div className="text-gray-600">{new Date(entry.timestamp).toLocaleString()}</div>
                        {entry.details && (
                          <div className="text-gray-500 mt-1">
                            {JSON.stringify(entry.details)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Preview
            dorks={generatedDorks}
            explanation={explanation}
            validationResults={validationResults}
            onCopy={copyToClipboard}
            onExport={exportDorks}
            onOpenInGoogle={openInGoogle}
          />
        </div>
      </div>
    </div>
  )
}

export default Builder