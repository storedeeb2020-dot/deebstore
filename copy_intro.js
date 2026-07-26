const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Copy New Logo
const newLogoSrc = path.join(__dirname, 'logo', 'WhatsApp Image 2026-07-26 at 18.23.08.jpeg');
const logoDest = path.join(publicDir, 'logo.png');

if (fs.existsSync(newLogoSrc)) {
  fs.copyFileSync(newLogoSrc, logoDest);
  console.log('Successfully copied new logo to public/logo.png');
} else {
  console.log('New logo file not found at:', newLogoSrc);
}

// 2. Copy New Video Intro
const videoSrc = path.join(__dirname, 'logo', '9888.mp4');
const videoDest = path.join(publicDir, 'intro.mp4');

if (fs.existsSync(videoSrc)) {
  fs.copyFileSync(videoSrc, videoDest);
  console.log('Successfully copied intro video to public/intro.mp4');
} else {
  console.log('Intro video file not found at:', videoSrc);
}
