import React, { useState, useEffect } from 'react'

const VariableSidebar = ({ template, variables, onVariableChange, isOpen, onToggle }) => {
  const [sidebarWidth, setSidebarWidth] = useState('320px')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Extract variables from template
  const extractVariables = (template) => {
    if (!template) return []
    const matches = template.match(/\{([^}]+)\}/g)
    return matches ? matches.map(match => match.slice(1, -1)) : []
  }

  const templateVariables = extractVariables(template)
  const uniqueVariables = [...new Set(templateVariables)]

  // Variable type detection for enhanced UI
  const getVariableInfo = (variable) => {
    const varName = variable.toLowerCase()
    
    if (varName.includes('domain') || varName.includes('site') || varName.includes('host')) {
      return {
        type: 'domain',
        icon: '🌐',
        placeholder: 'example.com',
        hint: 'Domain without protocol',
        color: 'blue'
      }
    }
    
    if (varName.includes('ext') || varName.includes('type') || varName.includes('format')) {
      return {
        type: 'extension',
        icon: '📄',
        placeholder: 'pdf,doc,xls',
        hint: 'File extensions',
        color: 'green'
      }
    }
    
    if (varName.includes('path') || varName.includes('dir') || varName.includes('folder')) {
      return {
        type: 'path',
        icon: '📁',
        placeholder: 'admin/config',
        hint: 'Directory path',
        color: 'yellow'
      }
    }
    
    if (varName.includes('user') || varName.includes('username') || varName.includes('account')) {
      return {
        type: 'user',
        icon: '👤',
        placeholder: 'admin,root',
        hint: 'Username or account',
        color: 'purple'
      }
    }
    
    if (varName.includes('keyword') || varName.includes('term') || varName.includes('query')) {
      return {
        type: 'keyword',
        icon: '🔍',
        placeholder: 'confidential,internal',
        hint: 'Search keywords',
        color: 'red'
      }
    }
    
    if (varName.includes('year') || varName.includes('date') || varName.includes('time')) {
      return {
        type: 'date',
        icon: '📅',
        placeholder: '2024',
        hint: 'Date or year',
        color: 'indigo'
      }
    }
    
    // Default for unknown variables
    return {
      type: 'text',
      icon: '💭',
      placeholder: `Enter ${variable}...`,
      hint: 'Custom value',
      color: 'gray'
    }
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
      green: 'border-green-500/30 bg-green-500/10 text-green-300',
      yellow: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
      purple: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
      red: 'border-red-500/30 bg-red-500/10 text-red-300',
      indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
      gray: 'border-gray-500/30 bg-gray-500/10 text-gray-300'
    }
    return colors[color] || colors.gray
  }

  const clearAllVariables = () => {
    uniqueVariables.forEach(variable => {
      onVariableChange(variable, '')
    })
  }

  const hasVariables = uniqueVariables.length > 0
  const hasValues = uniqueVariables.some(variable => variables[variable])

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 transform -translate-y-1/2 z-50 cti-btn cti-btn-primary transition-all duration-300 ${
          isOpen ? 'right-80' : 'right-4'
        }`}
        title={isOpen ? 'Close Variables Sidebar' : 'Open Variables Sidebar'}
      >
        {isOpen ? '✕' : '⚙️'}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Variables Sidebar */}
      <div className={`fixed top-0 right-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 border-l border-gray-700 shadow-2xl z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ width: sidebarWidth }}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              ⚙️ Template Variables
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? '📈' : '📉'}
              </button>
              <button
                onClick={onToggle}
                className="p-1 text-gray-400 hover:text-white transition-colors lg:hidden"
                title="Close sidebar"
              >
                ✕
              </button>
            </div>
          </div>
          
          {template && (
            <div className="text-xs text-gray-400">
              Active Template: <span className="text-blue-400 font-mono">{template.slice(0, 40)}...</span>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className={`flex-1 overflow-y-auto cti-scrollbar ${isCollapsed ? 'hidden' : ''}`}>
          {hasVariables ? (
            <div className="p-4 space-y-4">
              {/* Quick Actions */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={clearAllVariables}
                  disabled={!hasValues}
                  className="flex-1 px-3 py-2 bg-red-600/20 text-red-300 border border-red-500/30 rounded-lg text-sm hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  🗑️ Clear All
                </button>
              </div>

              {/* Variable Inputs */}
              <div className="space-y-4">
                {uniqueVariables.map(variable => {
                  const info = getVariableInfo(variable)
                  const colorClasses = getColorClasses(info.color)
                  
                  return (
                    <div key={variable} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                        <span className="text-lg">{info.icon}</span>
                        <span className="capitalize">{variable}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${colorClasses}`}>
                          {info.type}
                        </span>
                      </label>
                      
                      <input
                        type="text"
                        value={variables[variable] || ''}
                        onChange={(e) => onVariableChange(variable, e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder={info.placeholder}
                      />
                      
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        💡 {info.hint}
                      </div>
                      
                      {variables[variable] && (
                        <div className="text-xs text-green-400 flex items-center gap-1">
                          ✅ Value set: <code className="bg-gray-700 px-1 rounded">{variables[variable].slice(0, 20)}{variables[variable].length > 20 ? '...' : ''}</code>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Variable Tips */}
              <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
                  💡 Variable Tips
                </h4>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>• Multiple values: use commas (pdf,doc,xls)</li>
                  <li>• Leave blank to keep placeholder</li>
                  <li>• Domain: no http/https protocol</li>
                  <li>• Variables update dorks in real-time</li>
                </ul>
              </div>

              {/* Variable Count */}
              <div className="text-center text-xs text-gray-500 border-t border-gray-700 pt-3">
                {uniqueVariables.length} variable{uniqueVariables.length !== 1 ? 's' : ''} • {uniqueVariables.filter(v => variables[v]).length} configured
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-sm">No variables in current template</p>
                <p className="text-xs mt-1">Select a template with {'{variable}'} placeholders</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-700 bg-gray-800/50">
          <div className="text-xs text-gray-500 text-center">
            Quick variable access for faster dork generation
          </div>
        </div>
      </div>
    </>
  )
}

export default VariableSidebar