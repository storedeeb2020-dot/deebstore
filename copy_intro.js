const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'logo');
const destFile = path.join(__dirname, 'public', 'intro.png');

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  const introFile = files.find(f => f.includes('انترو') || f.includes('intro') || f === 'انترو 1.png');
  if (introFile) {
    fs.copyFileSync(path.join(srcDir, introFile), destFile);
    console.log('Successfully copied intro image:', introFile, 'to', destFile);
  } else {
    console.log('Intro file not found in logo directory, available files:', files);
  }
}
