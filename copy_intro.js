const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Copy New Store Logo (12222.png)
const logoCandidates = [
  path.join(__dirname, 'logo', '12222.png'),
  path.join(__dirname, 'logo', 'WhatsApp Image 2026-07-26 at 18.23.08.jpeg')
];

const logoDest = path.join(publicDir, 'logo.png');

for (const logoSrc of logoCandidates) {
  if (fs.existsSync(logoSrc)) {
    fs.copyFileSync(logoSrc, logoDest);
    console.log('Successfully updated store logo at public/logo.png from:', logoSrc);
    break;
  }
}
