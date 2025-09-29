import React from 'react'

const TemplateEditor = ({ template, variables, onVariableChange }) => {
  // Extract variables from template
  const extractVariables = (template) => {
    const matches = template.match(/\{([^}]+)\}/g)
    return matches ? matches.map(match => match.slice(1, -1)) : []
  }

  const templateVariables = extractVariables(template)
  const uniqueVariables = [...new Set(templateVariables)]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Template Variables</h3>
      
      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">Template:</label>
        <code className="text-sm">{template}</code>
      </div>

      <div className="space-y-4">
        {uniqueVariables.map(variable => (
          <div key={variable}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {variable}
              {variable === 'domain' && <span className="text-gray-500 ml-1">(e.g., example.com)</span>}
              {variable === 'ext' && <span className="text-gray-500 ml-1">(e.g., pdf, doc, xls)</span>}
              {variable === 'path' && <span className="text-gray-500 ml-1">(e.g., admin, login)</span>}
              {variable === 'user' && <span className="text-gray-500 ml-1">(e.g., admin, root)</span>}
            </label>
            <input
              type="text"
              value={variables[variable] || ''}
              onChange={(e) => onVariableChange(variable, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder={`Enter ${variable}...`}
            />
            <div className="text-xs text-gray-500 mt-1">
              Tip: For multiple values, separate with commas (e.g., "pdf,doc,xls")
            </div>
          </div>
        ))}
      </div>

      {templateVariables.length === 0 && (
        <div className="text-gray-500 text-center py-4">
          This template has no variables to configure.
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
        <h4 className="font-medium text-blue-800 mb-2">Variable Tips:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use specific values for targeted searches</li>
          <li>• Multiple values create multiple dork variations</li>
          <li>• Leave blank to use the variable placeholder in the dork</li>
          <li>• Domain should not include protocol (http/https)</li>
        </ul>
      </div>
    </div>
  )
}

export default TemplateEditor