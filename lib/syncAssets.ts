import fs from "fs";
import path from "path";

export function syncBrandAssets() {
  try {
    const root = process.cwd();
    const publicDir = path.join(root, "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 1. Copy New Logo (WhatsApp Image 2026-07-26 at 18.23.08.jpeg)
    const newLogoSrc = path.join(root, "logo", "WhatsApp Image 2026-07-26 at 18.23.08.jpeg");
    const logoDest = path.join(publicDir, "logo.png");
    if (fs.existsSync(newLogoSrc)) {
      fs.copyFileSync(newLogoSrc, logoDest);
      console.log("Copied new DEEP STORE logo to public/logo.png");
    }

    // 2. Copy Intro Video (9888.mp4)
    const videoSrc = path.join(root, "logo", "9888.mp4");
    const videoDest = path.join(publicDir, "intro.mp4");
    if (fs.existsSync(videoSrc)) {
      fs.copyFileSync(videoSrc, videoDest);
      console.log("Copied DEEP STORE intro video to public/intro.mp4");
    }
  } catch (err) {
    console.error("Brand asset sync error:", err);
  }
}

// Execute immediately on module import
syncBrandAssets();
