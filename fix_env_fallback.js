const fs = require('fs');
const path = require('path');

const targetDir = '/Users/shahan/Documents/ecom-watch';

// Update Login.jsx, Register.jsx, ForgotPassword.jsx, useApi.js with safe fallback
const filesToFix = [
  'frontend/src/pages/auth/Login.jsx',
  'frontend/src/pages/auth/Register.jsx',
  'frontend/src/pages/ForgotPassword.jsx',
  'frontend/src/hooks/useApi.js'
];

for (const rel of filesToFix) {
  const fullPath = path.join(targetDir, rel);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace raw undefined template literals with safe BASE_URL
    content = content.replace(/import\.meta\.env\.VITE_API_URL(?!\s*\|\|)/g, "(import.meta.env.VITE_API_URL || 'http://localhost:3000')");
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed BASE_URL fallback in:', rel);
  }
}
