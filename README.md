# 🔍 Googlr - Educational Google Dork Builder

⚠️ **IMPORTANT LEGAL NOTICE** ⚠️
**This tool is for educational purposes and authorized security testing ONLY. You must obtain explicit written permission before testing any systems you do not own. Misuse of this tool may violate local, state, and federal laws.**

## Overview

Googlr is a single-page static web application designed to help security students and penetration testers learn and craft Google dorks quickly and responsibly. This tool focuses on education and safe dork generation - it does NOT execute automated searches at scale.

## Features

### 🎯 Core Functionality
- **Template-based dork generation** with variable substitution
- **Category presets** for common security testing scenarios
- **Real-time syntax validation** and warnings
- **Plain-language explanations** of what each dork does
- **Export capabilities** (TXT, CSV formats)
- **Save/Load presets** in browser localStorage

### 🛡️ Safety Features
- **Mandatory ethics agreement** before tool access
- **Explicit consent required** for manual searches
- **Rate-limiting warnings** and educational notices
- **Audit logging** of all user actions
- **Validation system** to identify potentially harmful searches
- **No automated queries** - all searches require manual user action

### 📚 Educational Categories
- Information Disclosure
- Files & Extensions
- Admin Panels
- Exposed Databases
- Open Directories
- Login Pages
- CMS Instances

## Safety and Legal Requirements

### ⚠️ Before Using This Tool

1. **Educational Purpose Only**: This tool is designed exclusively for cybersecurity education, research, and authorized penetration testing.

2. **Written Permission Required**: You MUST obtain explicit written permission before testing or gathering information about systems you do not own.

3. **Legal Compliance**: You are solely responsible for ensuring your use complies with all applicable local, state, and federal laws.

4. **Prohibited Targets**: Do NOT use this tool to target:
   - Critical infrastructure
   - Medical systems
   - Educational institutions
   - Government systems
   - Any system without proper authorization

5. **Rate Limiting**: Respect search engine terms of service and implement appropriate rate limiting in your testing.

### 🚫 Abuse Prevention

This tool will not help build dorks targeting:
- Critical infrastructure systems
- Medical or healthcare systems
- Educational institutions
- Government or military systems
- Financial systems without explicit authorization

## Installation and Usage

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sbeving/googlr.git
   cd googlr
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Running Tests

```bash
npm test
```

## GitHub Pages Deployment

This repository is configured for automatic deployment to GitHub Pages via GitHub Actions.

### Setup Instructions

1. **Fork this repository** to your GitHub account

2. **Update configuration**:
   - Edit `package.json` to update the `homepage` field with your GitHub Pages URL
   - Update the `vite.config.js` base path if needed

3. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Select "GitHub Actions" as the source

4. **Deploy**:
   - Push to the `main` branch to trigger automatic deployment
   - Your site will be available at `https://sbeving.github.io/googlr`

### Manual Deployment Alternative

If you prefer manual deployment:

```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## Architecture

### Tech Stack
- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS (via CDN)
- **Storage**: Browser localStorage
- **Deployment**: GitHub Pages with GitHub Actions

### Project Structure
```
googlr/
├── src/
│   ├── components/
│   │   ├── Builder.jsx      # Main builder interface
│   │   ├── TemplateEditor.jsx # Variable input forms
│   │   └── Preview.jsx      # Results and validation
│   ├── utils/
│   │   ├── templates.js     # Template definitions and expansion
│   │   └── validator.js     # Dork validation and safety checks
│   ├── App.jsx             # Main app with ethics modal
│   └── main.jsx            # React entry point
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions deployment
├── public/
│   └── favicon.ico
├── index.html
├── package.json
├── vite.config.js
├── LICENSE
└── README.md
```

## Contributing

Contributions are welcome! Please ensure all contributions:

1. Maintain the educational focus
2. Include appropriate safety warnings
3. Do not enable automated scanning capabilities
4. Follow the existing code style
5. Include tests for new functionality

### Development Guidelines

- Keep the tool focused on education, not automation
- Maintain prominent safety warnings
- Validate all user inputs
- Log user actions for audit purposes
- Provide clear explanations of dork functionality

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

**The creators of Googlr are not responsible for any misuse of this tool. Users are solely responsible for ensuring their actions comply with all applicable laws and obtaining proper authorization before testing any systems.**

This tool is provided "as is" without warranty of any kind. Use at your own risk and responsibility.

## Ethical Use Guidelines

### ✅ Appropriate Uses
- Learning about Google search operators
- Authorized penetration testing with written permission
- Security research on your own systems
- Educational demonstrations in controlled environments
- OSINT research within legal boundaries

### ❌ Inappropriate Uses
- Unauthorized system reconnaissance
- Targeting systems without permission
- Violating terms of service
- Gathering sensitive information without authorization
- Any illegal or unethical activities

---

**Remember: With great power comes great responsibility. Use this tool ethically and legally.**
