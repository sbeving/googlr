import { useEffect, useState } from 'react'
import Builder from './components/Builder.jsx'

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl mx-4 p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-red-600 mb-2">⚠️ IMPORTANT LEGAL NOTICE ⚠️</h1>
            <h2 className="text-xl font-semibold text-gray-800">Educational Use Only</h2>
          </div>
          
          <div className="text-left space-y-4 text-gray-700">
            <p className="font-semibold">By using Googlr, you acknowledge and agree to the following:</p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Educational Purpose Only:</strong> This tool is designed exclusively for cybersecurity education, research, and authorized penetration testing.</li>
              <li><strong>Written Permission Required:</strong> You must obtain explicit written permission before testing or gathering information about systems you do not own.</li>
              <li><strong>Legal Compliance:</strong> You are solely responsible for ensuring your use complies with all applicable local, state, and federal laws.</li>
              <li><strong>No Automated Queries:</strong> This tool does not perform automated searches. Any search execution requires your explicit manual action.</li>
              <li><strong>Prohibited Targets:</strong> Do not use this tool to target critical infrastructure, medical systems, educational institutions, or any system without proper authorization.</li>
              <li><strong>Rate Limiting:</strong> Respect search engine terms of service and implement appropriate rate limiting in your testing.</li>
            </ul>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm"><strong>Disclaimer:</strong> The creators of Googlr are not responsible for any misuse of this tool. Use at your own risk and responsibility.</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={handleEthicsDecline}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              I Do Not Agree
            </button>
            <button
              onClick={handleEthicsAccept}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              I Understand and Agree
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">🔍 Googlr</h1>
            <p className="text-gray-300">Educational Google Dork Builder for Security Professionals</p>
            <div className="mt-2 text-sm text-yellow-300">
              ⚠️ For Educational and Authorized Testing Only
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Builder />
      </main>

      <footer className="bg-primary text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} Googlr - Educational Tool | 
            <a href="https://github.com/sbeving/googlr" className="text-blue-400 hover:text-blue-300 ml-1">
              Open Source
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App