import { useEffect, useState } from 'react'
import Builder from './components/Builder.jsx'
import './styles/cti-theme.css'

const App = () => {
  const [showEthicsModal, setShowEthicsModal] = useState(true)
  const [ethicsAccepted, setEthicsAccepted] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('googlr_ethics_accepted')
    if (accepted === 'true') {
      setEthicsAccepted(true)
      setShowEthicsModal(false)
    }
  }, [])

  const handleEthicsAccept = () => {
    localStorage.setItem('googlr_ethics_accepted', 'true')
    setEthicsAccepted(true)
    setShowEthicsModal(false)
  }

  const handleEthicsDecline = () => {
    window.location.href = 'https://www.google.com'
  }

  if (showEthicsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="cti-card max-w-4xl mx-4 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-400 mb-3">🛡️ CTI PROFESSIONAL TERMS</h1>
            <h2 className="text-2xl font-semibold text-gray-200">Advanced Threat Intelligence Platform</h2>
          </div>
          
          <div className="text-left space-y-6 text-gray-300">
            <p className="font-semibold text-lg">By accessing Googlr CTI Pro, you certify your professional status and agree to:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="cti-card p-4">
                  <h3 className="font-semibold text-blue-400 mb-2">🎯 Professional Use Only</h3>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Certified security professionals</li>
                    <li>Authorized penetration testing</li>
                    <li>Threat intelligence research</li>
                    <li>Academic cybersecurity studies</li>
                  </ul>
                </div>
                
                <div className="cti-card p-4">
                  <h3 className="font-semibold text-purple-400 mb-2">📋 Legal Requirements</h3>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Written authorization required</li>
                    <li>Compliance with local/federal laws</li>
                    <li>Respect for terms of service</li>
                    <li>Responsible disclosure practices</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="cti-card p-4">
                  <h3 className="font-semibold text-red-400 mb-2">🚫 Prohibited Activities</h3>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Unauthorized system targeting</li>
                    <li>Critical infrastructure attacks</li>
                    <li>Automated/bulk queries</li>
                    <li>Malicious reconnaissance</li>
                  </ul>
                </div>
                
                <div className="cti-card p-4">
                  <h3 className="font-semibold text-green-400 mb-2">✅ Professional Standards</h3>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>MITRE ATT&CK methodology</li>
                    <li>Diamond Model analysis</li>
                    <li>STIX/MISP integration</li>
                    <li>Threat hunting best practices</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="cti-message cti-message-info">
              <p className="text-sm"><strong>Professional Disclaimer:</strong> This tool provides advanced CTI capabilities for qualified professionals. Users assume full responsibility for compliance with applicable laws and ethical standards.</p>
            </div>
          </div>
          
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={handleEthicsDecline}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ❌ I am not a qualified CTI professional
            </button>
            <button
              onClick={handleEthicsAccept}
              className="cti-btn cti-btn-primary px-8 py-3 font-medium"
            >
              ✅ I certify my professional status and agree
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!ethicsAccepted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 cti-dark">
      <header className="cti-card mb-8 border-0 rounded-none">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
              🎯 Googlr CTI Pro
            </h1>
            <p className="text-xl text-gray-300 mb-2">Advanced Threat Intelligence & OSINT Platform</p>
            <div className="flex justify-center space-x-4 text-sm">
              <span className="cti-status cti-status-success">✅ MITRE ATT&CK</span>
              <span className="cti-status cti-status-success">✅ Diamond Model</span>
              <span className="cti-status cti-status-success">✅ Kill Chain</span>
              <span className="cti-status cti-status-warning">⚠️ Authorized Use Only</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Builder />
      </main>

      <footer className="cti-card border-0 rounded-none mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Googlr CTI Pro - Professional Threat Intelligence Tool | 
            <a href="https://github.com/sbeving/googlr" className="text-blue-400 hover:text-blue-300 ml-1">
              🚀 Open Source
            </a>
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Trusted by CTI professionals worldwide • Built for MITRE ATT&CK • STIX/MISP Compatible
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App