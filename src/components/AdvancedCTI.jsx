import React, { useState, useEffect } from 'react'
import { CTI_FRAMEWORKS, ADVANCED_OPERATORS, THREAT_PATTERNS, EXPORT_TEMPLATES } from '../utils/templates.js'
import { validateDork } from '../utils/validator.js'
import storageManager from '../utils/storage.js'

const AdvancedCTI = ({ onDorkGenerated }) => {
  const [selectedFramework, setSelectedFramework] = useState('')
  const [selectedTechnique, setSelectedTechnique] = useState('')
  const [threatHunting, setThreatHunting] = useState({
    actor: '',
    timeframe: '',
    industry: '',
    geography: ''
  })
  const [iocExtraction, setIocExtraction] = useState({
    type: 'hash',
    format: 'list',
    source: ''
  })
  const [automationRules, setAutomationRules] = useState([])
  const [activeTab, setActiveTab] = useState('frameworks')

  const generateFrameworkDorks = (framework, technique) => {
    if (!CTI_FRAMEWORKS[framework] || !CTI_FRAMEWORKS[framework][technique]) return []
    
    const patterns = CTI_FRAMEWORKS[framework][technique]
    const contextualDorks = patterns.map(pattern => {
      let dork = pattern
      
      // Add temporal context if specified
      if (threatHunting.timeframe) {
        const [start, end] = threatHunting.timeframe.split('-')
        dork += ` daterange:${start}..${end}`
      }
      
      // Add industry context
      if (threatHunting.industry) {
        dork += ` intext:"${threatHunting.industry}"`
      }
      
      // Add geographical context
      if (threatHunting.geography) {
        dork += ` location:"${threatHunting.geography}"`
      }
      
      return dork
    })
    
    return contextualDorks
  }

  const generateThreatHuntingCampaign = () => {
    const { actor, timeframe, industry, geography } = threatHunting
    if (!actor) return []

    const baseDorks = [
      `intext:"${actor}" (intext:"threat" | intext:"APT" | intext:"attack")`,
      `intext:"${actor}" filetype:pdf (intext:"report" | intext:"analysis")`,
      `intext:"${actor}" (intext:"IOC" | intext:"indicator" | intext:"compromise")`,
      `intext:"${actor}" (intext:"campaign" | intext:"operation" | intext:"activity")`,
      `intext:"${actor}" filetype:json | filetype:xml (intext:"STIX" | intext:"MITRE")`
    ]

    return baseDorks.map(dork => {
      let enhancedDork = dork
      
      if (timeframe) {
        const [start, end] = timeframe.split('-')
        enhancedDork += ` daterange:${start}..${end}`
      }
      
      if (industry) {
        enhancedDork += ` intext:"${industry}"`
      }
      
      if (geography) {
        enhancedDork += ` location:"${geography}"`
      }
      
      return enhancedDork
    })
  }

  const generateIOCExtractionDorks = () => {
    const { type, source } = iocExtraction
    if (!source) return []

    const iocPatterns = {
      'hash': [
        `site:${source} intext:"MD5:" | intext:"SHA1:" | intext:"SHA256:"`,
        `site:${source} filetype:txt | filetype:csv intext:"hash"`,
        `site:${source} intext:"malware" (intext:"hash" | intext:"checksum")`
      ],
      'ip': [
        `site:${source} intext:"IP:" | intext:"C2:" | intext:"callback:"`,
        `site:${source} intext:"command and control" | intext:"infrastructure"`,
        `site:${source} filetype:json | filetype:xml intext:"network"`
      ],
      'domain': [
        `site:${source} intext:"domain:" | intext:"hostname:" | intext:"FQDN:"`,
        `site:${source} intext:"malicious domain" | intext:"bad domain"`,
        `site:${source} filetype:csv intext:"domain" | intext:"URL"`
      ],
      'email': [
        `site:${source} intext:"email:" | intext:"sender:" | intext:"from:"`,
        `site:${source} intext:"phishing" | intext:"malicious email"`,
        `site:${source} filetype:eml | filetype:msg`
      ]
    }

    return iocPatterns[type] || []
  }

  const createAutomationRule = () => {
    const rule = {
      id: Date.now(),
      name: prompt('Enter rule name:'),
      trigger: 'manual', // Could be 'scheduled', 'event-driven', etc.
      dorks: [],
      actions: ['extract', 'validate', 'export'],
      created: new Date().toISOString()
    }
    
    if (rule.name) {
      setAutomationRules([...automationRules, rule])
      storageManager.logAction('AUTOMATION_RULE_CREATED', { ruleId: rule.id, name: rule.name })
    }
  }

  const exportToSTIX = (dorks, metadata = {}) => {
    const stixBundle = {
      'type': 'bundle',
      'id': `bundle--${Date.now()}`,
      'spec_version': '2.1',
      'objects': dorks.map((dork, index) => ({
        'type': 'indicator',
        'id': `indicator--${Date.now()}-${index}`,
        'created': new Date().toISOString(),
        'modified': new Date().toISOString(),
        'pattern': `[search:query = '${dork}']`,
        'labels': ['search-query'],
        'name': `Google Dork Query ${index + 1}`,
        'description': `Generated Google dork for CTI research: ${dork}`,
        'x_googlr_metadata': {
          'framework': selectedFramework,
          'technique': selectedTechnique,
          'generated_at': new Date().toISOString(),
          'validation': validateDork(dork),
          ...metadata
        }
      }))
    }

    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `googlr_stix_bundle_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    storageManager.logAction('STIX_EXPORT', { 
      dorksCount: dorks.length, 
      framework: selectedFramework,
      technique: selectedTechnique 
    })
  }

  const exportToMISP = (dorks, metadata = {}) => {
    const mispEvent = {
      'Event': {
        'info': `Googlr CTI Dorks - ${selectedFramework} ${selectedTechnique}`,
        'threat_level_id': '2',
        'analysis': '1',
        'distribution': '1',
        'date': new Date().toISOString().split('T')[0],
        'published': false,
        'Attribute': dorks.map((dork, index) => ({
          'type': 'other',
          'category': 'Other',
          'value': dork,
          'comment': `Google dork query for CTI research - ${selectedFramework}`,
          'to_ids': false,
          'distribution': '1'
        })),
        'Tag': [
          { 'name': 'tlp:white' },
          { 'name': 'type:OSINT' },
          { 'name': 'tool:googlr' },
          { 'name': `framework:${selectedFramework.toLowerCase()}` }
        ]
      }
    }

    const blob = new Blob([JSON.stringify(mispEvent, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `googlr_misp_event_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    storageManager.logAction('MISP_EXPORT', { 
      dorksCount: dorks.length, 
      framework: selectedFramework 
    })
  }

  const handleFrameworkSelection = (framework, technique) => {
    setSelectedFramework(framework)
    setSelectedTechnique(technique)
    
    const dorks = generateFrameworkDorks(framework, technique)
    if (dorks.length > 0 && onDorkGenerated) {
      onDorkGenerated(dorks, { framework, technique, type: 'framework' })
    }
    
    storageManager.logAction('FRAMEWORK_SELECTED', { framework, technique })
  }

  const handleThreatHuntingGenerate = () => {
    const dorks = generateThreatHuntingCampaign()
    if (dorks.length > 0 && onDorkGenerated) {
      onDorkGenerated(dorks, { 
        type: 'threat_hunting', 
        actor: threatHunting.actor,
        timeframe: threatHunting.timeframe,
        industry: threatHunting.industry 
      })
    }
    
    storageManager.logAction('THREAT_HUNTING_GENERATED', threatHunting)
  }

  const handleIOCExtraction = () => {
    const dorks = generateIOCExtractionDorks()
    if (dorks.length > 0 && onDorkGenerated) {
      onDorkGenerated(dorks, { 
        type: 'ioc_extraction', 
        iocType: iocExtraction.type,
        source: iocExtraction.source 
      })
    }
    
    storageManager.logAction('IOC_EXTRACTION_GENERATED', iocExtraction)
  }

  return (
    <div className="space-y-6">
      {/* Advanced CTI Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'frameworks', label: '🎯 CTI Frameworks', icon: '🎯' },
            { key: 'hunting', label: '🔍 Threat Hunting', icon: '🔍' },
            { key: 'ioc', label: '📊 IOC Extraction', icon: '📊' },
            { key: 'automation', label: '⚡ Automation', icon: '⚡' },
            { key: 'export', label: '📤 Professional Export', icon: '📤' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* CTI Frameworks Tab */}
      {activeTab === 'frameworks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">🎯 MITRE ATT&CK Framework</h3>
            <div className="space-y-3">
              {Object.keys(CTI_FRAMEWORKS.MITRE_ATTACK).map(technique => (
                <button
                  key={technique}
                  onClick={() => handleFrameworkSelection('MITRE_ATTACK', technique)}
                  className={`w-full p-3 text-left rounded-lg border transition-all ${
                    selectedFramework === 'MITRE_ATTACK' && selectedTechnique === technique
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{technique}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {CTI_FRAMEWORKS.MITRE_ATTACK[technique].length} dork patterns
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">💎 Diamond Model</h3>
            <div className="space-y-3">
              {Object.keys(CTI_FRAMEWORKS.DIAMOND_MODEL).map(element => (
                <button
                  key={element}
                  onClick={() => handleFrameworkSelection('DIAMOND_MODEL', element)}
                  className={`w-full p-3 text-left rounded-lg border transition-all ${
                    selectedFramework === 'DIAMOND_MODEL' && selectedTechnique === element
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium capitalize">{element.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {CTI_FRAMEWORKS.DIAMOND_MODEL[element].length} dork patterns
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">⚔️ Cyber Kill Chain</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.keys(CTI_FRAMEWORKS.KILL_CHAIN).map(phase => (
                <button
                  key={phase}
                  onClick={() => handleFrameworkSelection('KILL_CHAIN', phase)}
                  className={`p-3 text-center rounded-lg border transition-all ${
                    selectedFramework === 'KILL_CHAIN' && selectedTechnique === phase
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm capitalize">
                    {phase.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {CTI_FRAMEWORKS.KILL_CHAIN[phase].length} patterns
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Threat Hunting Tab */}
      {activeTab === 'hunting' && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🔍 Advanced Threat Hunting Campaign</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Threat Actor / APT Group</label>
                <input
                  type="text"
                  value={threatHunting.actor}
                  onChange={(e) => setThreatHunting({...threatHunting, actor: e.target.value})}
                  placeholder="e.g., APT29, Lazarus, Equation Group"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Frame (YYYY-MM-DD)</label>
                <input
                  type="text"
                  value={threatHunting.timeframe}
                  onChange={(e) => setThreatHunting({...threatHunting, timeframe: e.target.value})}
                  placeholder="2024-01-01-2024-12-31"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Industry</label>
                <select
                  value={threatHunting.industry}
                  onChange={(e) => setThreatHunting({...threatHunting, industry: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Industry</option>
                  <option value="financial">Financial Services</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="government">Government</option>
                  <option value="energy">Energy & Utilities</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail</option>
                  <option value="technology">Technology</option>
                  <option value="defense">Defense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Geographic Region</label>
                <select
                  value={threatHunting.geography}
                  onChange={(e) => setThreatHunting({...threatHunting, geography: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Region</option>
                  <option value="United States">United States</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                  <option value="Middle East">Middle East</option>
                  <option value="Latin America">Latin America</option>
                </select>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleThreatHuntingGenerate}
            disabled={!threatHunting.actor}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
          >
            🔍 Generate Threat Hunting Campaign
          </button>
        </div>
      )}

      {/* IOC Extraction Tab */}
      {activeTab === 'ioc' && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 IOC Extraction & Intelligence Gathering</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IOC Type</label>
              <select
                value={iocExtraction.type}
                onChange={(e) => setIocExtraction({...iocExtraction, type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="hash">File Hashes</option>
                <option value="ip">IP Addresses</option>
                <option value="domain">Domains/URLs</option>
                <option value="email">Email Addresses</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source Domain</label>
              <input
                type="text"
                value={iocExtraction.source}
                onChange={(e) => setIocExtraction({...iocExtraction, source: e.target.value})}
                placeholder="e.g., threat-intelligence.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <select
                value={iocExtraction.format}
                onChange={(e) => setIocExtraction({...iocExtraction, format: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="list">Simple List</option>
                <option value="csv">CSV Format</option>
                <option value="json">JSON Format</option>
                <option value="stix">STIX 2.1</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleIOCExtraction}
            disabled={!iocExtraction.source}
            className="mt-6 w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors"
          >
            📊 Generate IOC Extraction Dorks
          </button>
        </div>
      )}

      {/* Professional Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">📤 Professional CTI Export Formats</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => {
                  const dorks = generateFrameworkDorks(selectedFramework, selectedTechnique)
                  if (dorks.length > 0) {
                    exportToSTIX(dorks, { framework: selectedFramework, technique: selectedTechnique })
                  } else {
                    alert('Please generate some dorks first!')
                  }
                }}
                className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="text-2xl mb-2">🔗</div>
                <div className="font-semibold text-blue-800">Export to STIX 2.1</div>
                <div className="text-sm text-blue-600 mt-1">
                  Structured Threat Information eXpression format for threat intelligence sharing
                </div>
              </button>
              
              <button
                onClick={() => {
                  const dorks = generateFrameworkDorks(selectedFramework, selectedTechnique)
                  if (dorks.length > 0) {
                    exportToMISP(dorks, { framework: selectedFramework, technique: selectedTechnique })
                  } else {
                    alert('Please generate some dorks first!')
                  }
                }}
                className="p-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-semibold text-purple-800">Export to MISP</div>
                <div className="text-sm text-purple-600 mt-1">
                  Malware Information Sharing Platform event format
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedCTI