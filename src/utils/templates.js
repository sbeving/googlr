// Advanced Google Dork template presets for CTI professionals
// Comprehensive categories covering all aspects of cyber threat intelligence

export const PRESET_CATEGORIES = {
  'Threat Intelligence': [
    'site:{domain} (intext:"threat" | intext:"malware" | intext:"attack")',
    'site:{domain} filetype:pdf (intext:"incident" | intext:"breach" | intext:"compromise")',
    'site:{domain} intext:"IOC" | intext:"indicator of compromise"',
    'site:{domain} (intext:"APT" | intext:"advanced persistent threat")',
    'site:{domain} intext:"YARA" | intext:"sigma rule"',
    'site:{domain} filetype:xml intext:"STIX" | intext:"TAXII"',
    'site:{domain} intext:"threat hunting" | intext:"threat detection"',
    'site:{domain} (intext:"C2" | intext:"command and control")',
    'site:{domain} intext:"attribution" (intext:"threat actor" | intext:"group")',
    'site:{domain} filetype:json (intext:"mitre" | intext:"att&ck")'
  ],

  'Vulnerability Intelligence': [
    'site:{domain} intext:"CVE-{year}" filetype:pdf',
    'site:{domain} (intext:"0day" | intext:"zero day" | intext:"exploit")',
    'site:{domain} intext:"vulnerability assessment" filetype:doc',
    'site:{domain} (intext:"RCE" | intext:"remote code execution")',
    'site:{domain} intext:"SQL injection" | intext:"XSS" | intext:"CSRF"',
    'site:{domain} intext:"buffer overflow" | intext:"heap overflow"',
    'site:{domain} filetype:py intext:"exploit" | intext:"poc"',
    'site:{domain} intext:"penetration test" | intext:"pentest"',
    'site:{domain} (intext:"CVSS" | intext:"vulnerability score")',
    'site:{domain} intext:"patch" | intext:"hotfix" | intext:"update"'
  ],

  'Malware Analysis': [
    'site:{domain} (intext:"malware" | intext:"trojan" | intext:"backdoor")',
    'site:{domain} filetype:exe | filetype:dll | filetype:bin',
    'site:{domain} intext:"hash" (intext:"md5" | intext:"sha1" | intext:"sha256")',
    'site:{domain} (intext:"sandbox" | intext:"dynamic analysis")',
    'site:{domain} intext:"reverse engineering" | intext:"disassembly"',
    'site:{domain} (intext:"packer" | intext:"obfuscation" | intext:"encryption")',
    'site:{domain} intext:"behavioral analysis" filetype:pdf',
    'site:{domain} (intext:"dropper" | intext:"loader" | intext:"injector")',
    'site:{domain} intext:"ransomware" | intext:"crypto" | intext:"encryption"',
    'site:{domain} filetype:yar | filetype:yara'
  ],

  'Digital Forensics': [
    'site:{domain} (intext:"forensics" | intext:"investigation" | intext:"evidence")',
    'site:{domain} filetype:dd | filetype:img | filetype:vmdk',
    'site:{domain} intext:"memory dump" | intext:"ram capture"',
    'site:{domain} (intext:"timeline" | intext:"artifact" | intext:"metadata")',
    'site:{domain} intext:"registry" | intext:"log analysis"',
    'site:{domain} (intext:"network forensics" | intext:"packet capture")',
    'site:{domain} filetype:pcap | filetype:cap | filetype:pcapng',
    'site:{domain} intext:"disk imaging" | intext:"bit-by-bit copy"',
    'site:{domain} (intext:"chain of custody" | intext:"evidence handling")',
    'site:{domain} intext:"steganography" | intext:"hidden data"'
  ],

  'OSINT Intelligence': [
    'site:{domain} (intext:"email" | intext:"contact" | intext:"@{domain}")',
    'site:{domain} intext:"employee" | intext:"staff" | intext:"personnel"',
    'site:{domain} (intext:"phone" | intext:"mobile" | intext:"telephone")',
    'site:{domain} intext:"address" | intext:"location" | intext:"office"',
    'site:{domain} (intext:"linkedin" | intext:"facebook" | intext:"twitter")',
    'site:{domain} filetype:pdf (intext:"report" | intext:"document")',
    'site:{domain} intext:"org chart" | intext:"organizational"',
    'site:{domain} (intext:"partner" | intext:"vendor" | intext:"supplier")',
    'site:{domain} intext:"acquisition" | intext:"merger" | intext:"subsidiary"',
    'site:{domain} filetype:xlsx | filetype:csv (intext:"data" | intext:"list")'
  ],

  'Credential Intelligence': [
    'site:{domain} (intext:"password" | intext:"passwd" | intext:"credential")',
    'site:{domain} intext:"username" | intext:"user" | intext:"account"',
    'site:{domain} (intext:"login" | intext:"authentication" | intext:"access")',
    'site:{domain} filetype:txt (intext:"pass" | intext:"pwd")',
    'site:{domain} (intext:"API key" | intext:"token" | intext:"secret")',
    'site:{domain} intext:"database" (intext:"user" | intext:"password")',
    'site:{domain} (intext:"ssh" | intext:"private key" | intext:"public key")',
    'site:{domain} filetype:pem | filetype:key | filetype:crt',
    'site:{domain} (intext:"oauth" | intext:"jwt" | intext:"bearer")',
    'site:{domain} intext:"breach" | intext:"leak" | intext:"dump"'
  ],

  'Infrastructure Intelligence': [
    'site:{domain} (intext:"server" | intext:"infrastructure" | intext:"network")',
    'site:{domain} intext:"IP address" | intext:"subnet" | intext:"CIDR"',
    'site:{domain} (intext:"DNS" | intext:"subdomain" | intext:"domain")',
    'site:{domain} intext:"port" | intext:"service" | intext:"protocol"',
    'site:{domain} (intext:"firewall" | intext:"router" | intext:"switch")',
    'site:{domain} filetype:xml | filetype:json (intext:"config" | intext:"settings")',
    'site:{domain} (intext:"cloud" | intext:"AWS" | intext:"Azure" | intext:"GCP")',
    'site:{domain} intext:"VPN" | intext:"tunnel" | intext:"proxy"',
    'site:{domain} (intext:"certificate" | intext:"SSL" | intext:"TLS")',
    'site:{domain} intext:"backup" | intext:"archive" | intext:"snapshot"'
  ],

  'Data Breach Intelligence': [
    'site:{domain} (intext:"breach" | intext:"incident" | intext:"compromise")',
    'site:{domain} intext:"data leak" | intext:"exposure" | intext:"disclosure"',
    'site:{domain} (intext:"PII" | intext:"personally identifiable")',
    'site:{domain} intext:"credit card" | intext:"payment" | intext:"financial"',
    'site:{domain} (intext:"GDPR" | intext:"privacy" | intext:"compliance")',
    'site:{domain} filetype:csv (intext:"customer" | intext:"user" | intext:"client")',
    'site:{domain} (intext:"medical" | intext:"health" | intext:"patient")',
    'site:{domain} intext:"notification" | intext:"disclosure letter"',
    'site:{domain} (intext:"affected" | intext:"impacted" | intext:"stolen")',
    'site:{domain} filetype:pdf intext:"forensic report" | intext:"investigation"'
  ],

  'Dark Web Intelligence': [
    'site:{domain} (intext:"onion" | intext:"tor" | intext:"darknet")',
    'site:{domain} intext:"marketplace" | intext:"forum" | intext:"underground"',
    'site:{domain} (intext:"carding" | intext:"fraud" | intext:"stolen")',
    'site:{domain} intext:"dump" | intext:"database" | intext:"collection"',
    'site:{domain} (intext:"exploit kit" | intext:"malware" | intext:"payload")',
    'site:{domain} intext:"bitcoin" | intext:"cryptocurrency" | intext:"wallet"',
    'site:{domain} (intext:"vendor" | intext:"seller" | intext:"buyer")',
    'site:{domain} intext:"escrow" | intext:"transaction" | intext:"payment"',
    'site:{domain} (intext:"tutorial" | intext:"guide" | intext:"how-to")',
    'site:{domain} filetype:txt (intext:"list" | intext:"combo" | intext:"leak")'
  ],

  'Advanced Persistent Threats': [
    'site:{domain} (intext:"APT" | intext:"nation state" | intext:"state sponsored")',
    'site:{domain} intext:"attribution" | intext:"threat actor" | intext:"group"',
    'site:{domain} (intext:"campaign" | intext:"operation" | intext:"activity")',
    'site:{domain} filetype:pdf (intext:"threat report" | intext:"intelligence")',
    'site:{domain} (intext:"TTPs" | intext:"tactics" | intext:"techniques")',
    'site:{domain} intext:"lateral movement" | intext:"persistence"',
    'site:{domain} (intext:"exfiltration" | intext:"data theft" | intext:"espionage")',
    'site:{domain} intext:"supply chain" | intext:"third party"',
    'site:{domain} (intext:"watering hole" | intext:"spear phishing")',
    'site:{domain} filetype:json intext:"MITRE" | intext:"ATT&CK"'
  ],

  'Cryptocurrency Intelligence': [
    'site:{domain} (intext:"bitcoin" | intext:"ethereum" | intext:"crypto")',
    'site:{domain} intext:"wallet" | intext:"address" | intext:"transaction"',
    'site:{domain} (intext:"blockchain" | intext:"distributed ledger")',
    'site:{domain} intext:"exchange" | intext:"trading" | intext:"market"',
    'site:{domain} (intext:"mining" | intext:"hash rate" | intext:"pool")',
    'site:{domain} intext:"smart contract" | intext:"DeFi" | intext:"NFT"',
    'site:{domain} (intext:"ransomware" | intext:"payment" | intext:"ransom")',
    'site:{domain} filetype:txt (intext:"seed" | intext:"private key")',
    'site:{domain} (intext:"mixer" | intext:"tumbler" | intext:"anonymity")',
    'site:{domain} intext:"ico" | intext:"token" | intext:"crowdfunding"'
  ],

  'Mobile Threat Intelligence': [
    'site:{domain} (intext:"mobile" | intext:"android" | intext:"iOS")',
    'site:{domain} filetype:apk | filetype:ipa',
    'site:{domain} (intext:"app" | intext:"application" | intext:"software")',
    'site:{domain} intext:"jailbreak" | intext:"root" | intext:"exploit"',
    'site:{domain} (intext:"SMS" | intext:"call" | intext:"phone")',
    'site:{domain} intext:"location" | intext:"GPS" | intext:"tracking"',
    'site:{domain} (intext:"permission" | intext:"access" | intext:"privilege")',
    'site:{domain} intext:"BYOD" | intext:"enterprise" | intext:"corporate"',
    'site:{domain} (intext:"MDM" | intext:"mobile device management")',
    'site:{domain} filetype:plist | filetype:xml'
  ],

  'Cloud Security Intelligence': [
    'site:{domain} (intext:"cloud" | intext:"SaaS" | intext:"PaaS" | intext:"IaaS")',
    'site:{domain} (intext:"AWS" | intext:"Amazon" | intext:"EC2" | intext:"S3")',
    'site:{domain} (intext:"Azure" | intext:"Microsoft" | intext:"Office 365")',
    'site:{domain} (intext:"Google Cloud" | intext:"GCP" | intext:"Firebase")',
    'site:{domain} intext:"container" | intext:"Docker" | intext:"Kubernetes"',
    'site:{domain} (intext:"serverless" | intext:"lambda" | intext:"function")',
    'site:{domain} intext:"misconfiguration" | intext:"exposure"',
    'site:{domain} (intext:"IAM" | intext:"identity" | intext:"access management")',
    'site:{domain} filetype:json (intext:"policy" | intext:"role" | intext:"permission")',
    'site:{domain} (intext:"compliance" | intext:"audit" | intext:"governance")'
  ]
}

// Advanced CTI framework mappings and intelligence patterns
export const CTI_FRAMEWORKS = {
  'MITRE_ATTACK': {
    'T1566': ['site:{domain} intext:"phishing" | intext:"spear phishing"', 'site:{domain} filetype:eml | filetype:msg'],
    'T1059': ['site:{domain} intext:"command line" | intext:"powershell" | intext:"cmd"', 'site:{domain} filetype:ps1 | filetype:bat'],
    'T1055': ['site:{domain} intext:"process injection" | intext:"DLL injection"', 'site:{domain} intext:"hollowing" | intext:"injection"'],
    'T1027': ['site:{domain} intext:"obfuscation" | intext:"encoding" | intext:"encryption"', 'site:{domain} intext:"base64" | intext:"encoded"'],
    'T1070': ['site:{domain} intext:"log clearing" | intext:"event log" | intext:"audit"', 'site:{domain} intext:"artifact removal"']
  },
  
  'DIAMOND_MODEL': {
    'adversary': ['site:{domain} intext:"threat actor" | intext:"APT" | intext:"group"', 'site:{domain} intext:"attribution" | intext:"campaign"'],
    'infrastructure': ['site:{domain} intext:"C2" | intext:"command control" | intext:"server"', 'site:{domain} intext:"infrastructure" | intext:"hosting"'],
    'capability': ['site:{domain} intext:"malware" | intext:"exploit" | intext:"tool"', 'site:{domain} intext:"technique" | intext:"method"'],
    'victim': ['site:{domain} intext:"target" | intext:"industry" | intext:"sector"', 'site:{domain} intext:"organization" | intext:"company"']
  },
  
  'KILL_CHAIN': {
    'reconnaissance': ['site:{domain} intext:"reconnaissance" | intext:"footprinting"', 'site:{domain} intext:"OSINT" | intext:"intelligence gathering"'],
    'weaponization': ['site:{domain} intext:"exploit" | intext:"payload" | intext:"dropper"', 'site:{domain} filetype:exe | filetype:dll'],
    'delivery': ['site:{domain} intext:"delivery" | intext:"vector" | intext:"attachment"', 'site:{domain} intext:"phishing" | intext:"watering hole"'],
    'exploitation': ['site:{domain} intext:"vulnerability" | intext:"CVE" | intext:"0day"', 'site:{domain} intext:"exploitation" | intext:"compromise"'],
    'installation': ['site:{domain} intext:"installation" | intext:"persistence" | intext:"backdoor"', 'site:{domain} intext:"implant" | intext:"agent"'],
    'command_control': ['site:{domain} intext:"C2" | intext:"command" | intext:"control"', 'site:{domain} intext:"communication" | intext:"channel"'],
    'actions_objectives': ['site:{domain} intext:"exfiltration" | intext:"theft" | intext:"espionage"', 'site:{domain} intext:"objective" | intext:"goal"']
  }
}

// Advanced search operators for professional use
export const ADVANCED_OPERATORS = {
  'temporal': {
    'daterange': 'daterange:{start_date}..{end_date}',
    'after': 'after:{date}',
    'before': 'before:{date}'
  },
  'precision': {
    'exact_phrase': '"{phrase}"',
    'exclude': '-{term}',
    'wildcard': '{term}*',
    'or_logic': '{term1} | {term2}',
    'and_logic': '{term1} & {term2}'
  },
  'content_type': {
    'cache': 'cache:{url}',
    'related': 'related:{url}',
    'info': 'info:{url}',
    'define': 'define:{term}'
  },
  'location': {
    'location': 'location:{place}',
    'near': 'near:{location}',
    'around': 'around({radius}km):{location}'
  }
}

// Threat intelligence focused dork patterns
export const THREAT_PATTERNS = {
  'IOC_EXTRACTION': [
    'site:{domain} intext:"{hash_type}:" (intext:"malware" | intext:"sample")',
    'site:{domain} intext:"IP:" | intext:"C2:" | intext:"callback:"',
    'site:{domain} filetype:csv | filetype:txt intext:"IOC" | intext:"indicator"',
    'site:{domain} intext:"domain:" | intext:"hostname:" | intext:"FQDN:"'
  ],
  
  'CAMPAIGN_TRACKING': [
    'site:{domain} intext:"campaign" (intext:"{year}" | intext:"{month}")',
    'site:{domain} intext:"operation" | intext:"activity group"',
    'site:{domain} filetype:pdf intext:"threat report" daterange:{start}..{end}',
    'site:{domain} intext:"timeline" | intext:"chronology" intext:"attack"'
  ],
  
  'VULNERABILITY_RESEARCH': [
    'site:{domain} intext:"CVE-{year}-{number}" filetype:pdf | filetype:doc',
    'site:{domain} intext:"0day" | intext:"zero-day" intext:"{vendor}"',
    'site:{domain} intext:"exploit" | intext:"PoC" intext:"{product}"',
    'site:{domain} intext:"vulnerability" intext:"disclosure" after:{date}'
  ]
}

// Professional export templates
export const EXPORT_TEMPLATES = {
  'STIX': {
    'indicator': {
      'type': 'indicator',
      'pattern': '[file:hashes.MD5 = \'{hash}\']',
      'labels': ['malicious-activity']
    },
    'malware': {
      'type': 'malware',
      'name': '{name}',
      'labels': ['trojan', 'backdoor']
    }
  },
  
  'MISP': {
    'event': {
      'Event': {
        'info': '{event_info}',
        'threat_level_id': '2',
        'analysis': '1',
        'distribution': '1'
      }
    }
  },
  
  'YARA': {
    'rule_template': `rule {rule_name} {
    meta:
        description = "{description}"
        author = "{author}"
        date = "{date}"
        source = "Googlr CTI Platform"
    
    strings:
        $s1 = "{string1}"
        $s2 = "{string2}"
    
    condition:
        any of them
}`
  }
}
export const expandTemplate = (template, variables) => {
  if (!template) return []
  
  let expandedTemplates = [template]
  
  // Process each variable
  Object.entries(variables).forEach(([variable, value]) => {
    if (!value || value.trim() === '') return
    
    const placeholder = `{${variable}}`
    const values = value.split(',').map(v => v.trim()).filter(v => v)
    
    if (values.length === 0) return
    
    // Create permutations for multi-value variables
    const newTemplates = []
    expandedTemplates.forEach(tmpl => {
      if (tmpl.includes(placeholder)) {
        values.forEach(val => {
          newTemplates.push(tmpl.replace(new RegExp(`\\{${variable}\\}`, 'g'), val))
        })
      } else {
        newTemplates.push(tmpl)
      }
    })
    
    expandedTemplates = newTemplates
  })
  
  // Remove duplicates and empty strings
  return [...new Set(expandedTemplates)].filter(dork => dork.trim() !== '')
}

// Function to generate plain-language explanation of a dork
export const generateExplanation = (dork) => {
  if (!dork) return ''
  
  let explanation = 'This Google dork will search for:\n\n'
  
  // Analyze different parts of the dork
  const parts = []
  
  // Site restriction
  if (dork.includes('site:')) {
    const siteMatch = dork.match(/site:([^\s]+)/i)
    if (siteMatch) {
      parts.push(`• Results limited to the domain: ${siteMatch[1]}`)
    }
  }
  
  // File type restrictions
  if (dork.includes('filetype:') || dork.includes('ext:')) {
    const fileTypeMatch = dork.match(/(filetype|ext):([^\s]+)/i)
    if (fileTypeMatch) {
      parts.push(`• Files with extension: ${fileTypeMatch[2]}`)
    }
  }
  
  // URL patterns
  if (dork.includes('inurl:')) {
    const inurlMatches = dork.match(/inurl:"?([^"\s]+)"?/gi)
    if (inurlMatches) {
      inurlMatches.forEach(match => {
        const term = match.replace(/inurl:"?([^"\s]+)"?/i, '$1')
        parts.push(`• URLs containing: "${term}"`)
      })
    }
  }
  
  // Title patterns
  if (dork.includes('intitle:')) {
    const intitleMatches = dork.match(/intitle:"?([^"\s]+)"?/gi)
    if (intitleMatches) {
      intitleMatches.forEach(match => {
        const term = match.replace(/intitle:"?([^"\s]+)"?/i, '$1')
        parts.push(`• Page titles containing: "${term}"`)
      })
    }
  }
  
  // Text patterns
  if (dork.includes('intext:')) {
    const intextMatches = dork.match(/intext:"?([^"\s]+)"?/gi)
    if (intextMatches) {
      intextMatches.forEach(match => {
        const term = match.replace(/intext:"?([^"\s]+)"?/i, '$1')
        parts.push(`• Page content containing: "${term}"`)
      })
    }
  }
  
  // OR operations
  if (dork.includes('|')) {
    parts.push('• Using OR logic for alternative terms')
  }
  
  // Parentheses grouping
  if (dork.includes('(') && dork.includes(')')) {
    parts.push('• Using grouped search terms')
  }
  
  // Common vulnerability indicators
  if (dork.toLowerCase().includes('password') || dork.toLowerCase().includes('passwd')) {
    parts.push('⚠️ This dork may reveal password-related information')
  }
  
  if (dork.toLowerCase().includes('admin')) {
    parts.push('⚠️ This dork targets administrative interfaces')
  }
  
  if (dork.toLowerCase().includes('error') || dork.toLowerCase().includes('sql')) {
    parts.push('⚠️ This dork may reveal system errors or database information')
  }
  
  if (dork.toLowerCase().includes('index of')) {
    parts.push('⚠️ This dork searches for directory listings')
  }
  
  explanation += parts.join('\n')
  
  if (parts.length === 0) {
    explanation += '• A custom search query with the specified terms'
  }
  
  explanation += '\n\n🛡️ Remember: Only use this dork on systems you own or have explicit permission to test.'
  
  return explanation
}

// Function to get popular dork examples for education
export const getExampleDorks = () => {
  return [
    {
      dork: 'site:example.com filetype:pdf',
      description: 'Find PDF files on a specific domain',
      category: 'Files & Extensions'
    },
    {
      dork: 'intitle:"Index of" "backup"',
      description: 'Look for exposed backup directories',
      category: 'Open Directories'
    },
    {
      dork: 'inurl:"admin" intitle:"login"',
      description: 'Find admin login pages',
      category: 'Admin Panels'
    },
    {
      dork: 'intext:"sql syntax near" | intext:"syntax error"',
      description: 'Identify potential SQL injection vulnerabilities',
      category: 'Information Disclosure'
    }
  ]
}