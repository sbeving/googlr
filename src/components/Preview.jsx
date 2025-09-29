import { useState } from 'react'

const Preview = ({ dorks, explanation, validationResults, onCopy, onExport, onOpenInGoogle }) => {
  const [showAllDorks, setShowAllDorks] = useState(false)
  const displayLimit = 5

  const getValidationColor = (validation) => {
    if (!validation) return 'text-gray-500'
    if (validation.errors.length > 0) return 'text-red-600'
    if (validation.warnings.length > 0) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getValidationIcon = (validation) => {
    if (!validation) return '❓'
    if (validation.errors.length > 0) return '❌'
    if (validation.warnings.length > 0) return '⚠️'
    return '✅'
  }

  return (
    <div className="space-y-6">
      {/* Generated Dorks */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Generated Dorks</h3>
          {dorks.length > 0 && (
            <div className="space-x-2">
              <button
                onClick={() => onExport('txt')}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Export TXT
              </button>
              <button
                onClick={() => onExport('csv')}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Export CSV
              </button>
            </div>
          )}
        </div>

        {dorks.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p>Configure a template or enter a custom dork to see results</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dorks.slice(0, showAllDorks ? dorks.length : displayLimit).map((dork, index) => {
              const validation = validationResults[index]
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <code className="text-sm bg-white p-2 rounded border flex-1 mr-3 break-all">
                      {dork}
                    </code>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onCopy(dork)}
                        className="px-3 py-1 bg-accent text-white rounded hover:bg-blue-600 text-sm whitespace-nowrap"
                        title="Copy to clipboard"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => onOpenInGoogle(dork)}
                        className="px-3 py-1 bg-warning text-white rounded hover:bg-yellow-600 text-sm whitespace-nowrap"
                        title="Open in Google (manual)"
                      >
                        🔗 Search
                      </button>
                    </div>
                  </div>
                  
                  {validation && (
                    <div className={`text-xs ${getValidationColor(validation)}`}>
                      {getValidationIcon(validation)} 
                      {validation.errors.length > 0 && (
                        <span className="ml-1">Errors: {validation.errors.join(', ')}</span>
                      )}
                      {validation.warnings.length > 0 && (
                        <span className="ml-1">Warnings: {validation.warnings.join(', ')}</span>
                      )}
                      {validation.errors.length === 0 && validation.warnings.length === 0 && (
                        <span className="ml-1">Valid</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            
            {dorks.length > displayLimit && (
              <button
                onClick={() => setShowAllDorks(!showAllDorks)}
                className="w-full py-2 text-accent hover:text-blue-600 text-sm"
              >
                {showAllDorks ? 'Show Less' : `Show All ${dorks.length} Dorks`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">🔍 Dork Explanation</h3>
          <div className="prose prose-sm max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              {explanation.split('\n').map((line, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Validation Summary */}
      {validationResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">🛡️ Validation Summary</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {validationResults.filter(v => v && v.errors.length === 0 && v.warnings.length === 0).length}
              </div>
              <div className="text-sm text-gray-600">Valid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {validationResults.filter(v => v && v.warnings.length > 0 && v.errors.length === 0).length}
              </div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {validationResults.filter(v => v && v.errors.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>

          <div className="space-y-2">
            {validationResults.map((validation, index) => {
              if (!validation || (validation.errors.length === 0 && validation.warnings.length === 0)) {
                return null
              }
              
              return (
                <div key={index} className="p-3 bg-gray-50 rounded border-l-4 border-yellow-400">
                  <div className="text-sm font-medium">Dork #{index + 1}</div>
                  {validation.errors.map((error, i) => (
                    <div key={i} className="text-red-600 text-sm">❌ {error}</div>
                  ))}
                  {validation.warnings.map((warning, i) => (
                    <div key={i} className="text-yellow-600 text-sm">⚠️ {warning}</div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Safety Reminder */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-red-400 mr-3">⚠️</div>
          <div className="text-sm text-red-700">
            <div className="font-medium mb-1">Safety Reminder</div>
            <div>
              Always ensure you have proper authorization before testing any systems. 
              Use these dorks responsibly and in compliance with applicable laws and terms of service.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Preview