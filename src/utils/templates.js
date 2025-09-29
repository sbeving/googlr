// Google Dork template presets organized by category
export const PRESET_CATEGORIES = {
  'Information Disclosure': [
    'site:{domain} filetype:pdf',
    'site:{domain} intitle:"index of"',
    'site:{domain} intext:"password" | intext:"passwd"',
    'site:{domain} intext:"username" | intext:"user"',
    'site:{domain} intext:"sql syntax near" | intext:"syntax error has occurred"',
    'site:{domain} intext:"mysql_fetch_array()"',
    'site:{domain} intext:"Warning: mysql_query()"',
    'site:{domain} ext:log',
    'site:{domain} intitle:"Configuration File For"',
    'site:{domain} intext:"powered by" | intext:"running"'
  ],
  
  'Files & Extensions': [
    'site:{domain} filetype:{ext}',
    'site:{domain} ext:{ext}',
    'filetype:{ext} site:{domain}',
    'filetype:{ext} intext:"{domain}"',
    'site:{domain} (filetype:doc | filetype:pdf | filetype:xls)',
    'site:{domain} filetype:sql',
    'site:{domain} filetype:xml',
    'site:{domain} filetype:env',
    'site:{domain} filetype:conf',
    'site:{domain} filetype:bak'
  ],
  
  'Admin Panels': [
    'site:{domain} inurl:admin',
    'site:{domain} intitle:"Admin"',
    'site:{domain} intitle:"Administration"',
    'site:{domain} inurl:"admin/login"',
    'site:{domain} inurl:"admin/index"',
    'site:{domain} inurl:"admin/config"',
    'site:{domain} inurl:"admin.php"',
    'site:{domain} inurl:"administrator"',
    'site:{domain} intitle:"Admin Panel"',
    'site:{domain} inurl:"cpanel"'
  ],
  
  'Exposed Databases': [
    'site:{domain} inurl:"phpmyadmin"',
    'site:{domain} intitle:"phpMyAdmin"',
    'site:{domain} inurl:"mysql"',
    'site:{domain} intext:"Database Error"',
    'site:{domain} inurl:"db_admin"',
    'site:{domain} intitle:"Adminer"',
    'site:{domain} inurl:"sqlweb"',
    'site:{domain} intext:"ORA-" | intext:"Oracle error"',
    'site:{domain} intext:"Microsoft OLE DB Provider for ODBC Drivers error"',
    'site:{domain} inurl:"dbadmin"'
  ],
  
  'Open Directories': [
    'site:{domain} intitle:"Index of /"',
    'site:{domain} intitle:"Index of" "Parent Directory"',
    'site:{domain} intitle:"Directory Listing For"',
    'site:{domain} "Index of" inurl:ftp',
    'site:{domain} intitle:"Index of" "backup"',
    'site:{domain} intitle:"Index of" "config"',
    'site:{domain} intitle:"Index of" "log"',
    'site:{domain} intitle:"Index of" "admin"',
    'site:{domain} intitle:"Index of" "private"',
    'site:{domain} "Index of" +passwd'
  ],
  
  'Login Pages': [
    'site:{domain} intitle:"Login"',
    'site:{domain} inurl:"login"',
    'site:{domain} inurl:"signin"',
    'site:{domain} intitle:"Sign In"',
    'site:{domain} inurl:"auth"',
    'site:{domain} intitle:"Authentication"',
    'site:{domain} inurl:"wp-login"',
    'site:{domain} intitle:"User Login"',
    'site:{domain} inurl:"user/login"',
    'site:{domain} inurl:"member"'
  ],
  
  'CMS Instances': [
    'site:{domain} inurl:"wp-content"',
    'site:{domain} intext:"Powered by WordPress"',
    'site:{domain} inurl:"drupal"',
    'site:{domain} intext:"Powered by Drupal"',
    'site:{domain} inurl:"joomla"',
    'site:{domain} intext:"Powered by Joomla"',
    'site:{domain} inurl:"administrator/index.php"',
    'site:{domain} intext:"Powered by phpBB"',
    'site:{domain} inurl:"magento"',
    'site:{domain} intext:"Powered by PrestaShop"'
  ]
}

// Function to expand template with variables and generate permutations
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