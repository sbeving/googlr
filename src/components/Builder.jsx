import { useEffect, useState } from 'react'
import { PRESET_CATEGORIES, expandTemplate, generateExplanation } from '../utils/templates.js'
import { validateDork } from '../utils/validator.js'
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

  useEffect(() => {
    // Load saved presets and audit log from localStorage
    const presets = localStorage.getItem('googlr_presets')
    const log = localStorage.getItem('googlr_audit_log')
    
    if (presets) {
      setSavedPresets(JSON.parse(presets))
    }
    if (log) {
      setAuditLog(JSON.parse(log))
    }
  }, [])

  const logAction = (action, details) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      details
    }
    const newLog = [...auditLog, logEntry]
    setAuditLog(newLog)
    localStorage.setItem('googlr_audit_log', JSON.stringify(newLog))
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setSelectedTemplate('')
    setVariables({})
    logAction('CATEGORY_SELECTED', { category })
  }

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template)
    setVariables({})
    logAction('TEMPLATE_SELECTED', { template })
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
    } else {
      setValidationResults([])
      setExplanation('')
      setGeneratedDorks([])
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      logAction('COPY_TO_CLIPBOARD', { dork: text })
      alert('Copied to clipboard!')
    })
  }

  const exportDorks = (format) => {
    if (generatedDorks.length === 0) return
    
    let content = ''
    let filename = ''
    
    if (format === 'txt') {
      content = generatedDorks.join('\n')
      filename = 'google_dorks.txt'
    } else if (format === 'csv') {
      content = 'Dork,Category,Template\n' + 
                generatedDorks.map(dork => `"${dork}","${selectedCategory}","${selectedTemplate}"`).join('\n')
      filename = 'google_dorks.csv'
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    
    logAction('EXPORT_DORKS', { format, count: generatedDorks.length })
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
      timestamp: new Date().toISOString()
    }
    
    const newPresets = [...savedPresets, preset]
    setSavedPresets(newPresets)
    localStorage.setItem('googlr_presets', JSON.stringify(newPresets))
    logAction('PRESET_SAVED', { name })
  }

  const loadPreset = (preset) => {
    setSelectedCategory(preset.category || '')
    setSelectedTemplate(preset.template || '')
    setVariables(preset.variables || {})
    setCustomDork(preset.customDork || '')
    
    if (preset.template && preset.variables) {
      const expanded = expandTemplate(preset.template, preset.variables)
      setGeneratedDorks(expanded)
      
      if (expanded.length > 0) {
        const validation = expanded.map(dork => validateDork(dork))
        setValidationResults(validation)
        setExplanation(generateExplanation(expanded[0]))
      }
    }
    
    logAction('PRESET_LOADED', { name: preset.name })
  }

  const clearAuditLog = () => {
    if (confirm('Are you sure you want to clear the audit log?')) {
      setAuditLog([])
      localStorage.removeItem('googlr_audit_log')
    }
  }

  const openInGoogle = (dork) => {
    if (confirm(`⚠️ WARNING: You are about to open a Google search in a new tab.\n\nDork: ${dork}\n\nEnsure you have permission to search for this information and that you comply with all applicable laws and Google's Terms of Service.\n\nProceed?`)) {
      const url = `https://www.google.com/search?q=${encodeURIComponent(dork)}`
      window.open(url, '_blank')
      logAction('MANUAL_SEARCH_OPENED', { dork })
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
              { key: 'presets', label: '💾 Presets' },
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
                      <button
                        key={index}
                        onClick={() => handleTemplateChange(template)}
                        className={`p-3 text-left rounded-lg border transition-colors w-full ${
                          selectedTemplate === template
                            ? 'bg-accent text-white border-accent'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        <code className="text-sm">{template}</code>
                      </button>
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
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-sm text-gray-500">
                          {preset.category} - {new Date(preset.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => loadPreset(preset)}
                        className="px-3 py-1 bg-accent text-white rounded hover:bg-blue-600"
                      >
                        Load
                      </button>
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