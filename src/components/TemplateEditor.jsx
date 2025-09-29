
const TemplateEditor = ({ template, variables, onVariableChange }) => {
  // Extract variables from template
  const extractVariables = (template) => {
    const matches = template.match(/\{([^}]+)\}/g)
    return matches ? matches.map(match => match.slice(1, -1)) : []
  }

  const templateVariables = extractVariables(template)
  const uniqueVariables = [...new Set(templateVariables)]

  // Generate preview with current variables
  const generatePreview = () => {
    let preview = template
    uniqueVariables.forEach(variable => {
      const value = variables[variable] || `{${variable}}`
      const regex = new RegExp(`\\{${variable}\\}`, 'g')
      preview = preview.replace(regex, value)
    })
    return preview
  }

  return (
    <div className="cti-card p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
        📝 Template Editor
        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
          {uniqueVariables.length} variable{uniqueVariables.length !== 1 ? 's' : ''}
        </span>
      </h3>
      
      {/* Template Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          🔧 Raw Template:
        </label>
        <div className="cti-code p-4 rounded-lg border border-gray-600">
          <code className="text-sm text-green-400 break-all">{template}</code>
        </div>
      </div>

      {/* Live Preview */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          👁️ Live Preview:
        </label>
        <div className="cti-code p-4 rounded-lg border border-blue-500/30 bg-blue-900/10">
          <code className="text-sm text-blue-300 break-all">{generatePreview()}</code>
        </div>
      </div>

      {/* Variable Status */}
      {uniqueVariables.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            ⚙️ Variable Status:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {uniqueVariables.map(variable => (
              <div key={variable} className={`p-3 rounded-lg border transition-all ${
                variables[variable] 
                  ? 'border-green-500/30 bg-green-500/10' 
                  : 'border-yellow-500/30 bg-yellow-500/10'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-gray-300">{variable}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    variables[variable] 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {variables[variable] ? '✅ Set' : '⚠️ Empty'}
                  </span>
                </div>
                {variables[variable] && (
                  <div className="mt-1 text-xs text-gray-400 font-mono truncate">
                    "{variables[variable]}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action for Sidebar */}
      <div className="cti-message cti-message-info">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👉</span>
          <div>
            <p className="font-medium text-blue-300 mb-1">Use the Variables Sidebar for faster editing!</p>
            <p className="text-sm text-blue-200">
              Click the ⚙️ button on the right to open the quick variable editor.
            </p>
          </div>
        </div>
      </div>

      {templateVariables.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-sm font-medium">Static Template</p>
          <p className="text-xs mt-1">This template has no configurable variables</p>
        </div>
      )}
    </div>
  )
}

export default TemplateEditor