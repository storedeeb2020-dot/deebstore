import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const publicArabicWolf = path.join(process.cwd(), "public", "ديب 3.png");
  const publicWolf = path.join(process.cwd(), "public", "wolf.png");
  const publicWolfIcon = path.join(process.cwd(), "public", "wolf-icon.png");

  // 1. Check for public/ديب 3.png or wolf.png (for live Vercel deployments)
  try {
    if (fs.existsSync(publicArabicWolf)) {
      const fileBuffer = fs.readFileSync(publicArabicWolf);
      return new Response(fileBuffer, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
    }
    if (fs.existsSync(publicWolf)) {
      const fileBuffer = fs.readFileSync(publicWolf);
      return new Response(fileBuffer, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
    }
    if (fs.existsSync(publicWolfIcon)) {
      const fileBuffer = fs.readFileSync(publicWolfIcon);
      return new Response(fileBuffer, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
    }
  } catch (e) {
    console.error("Error reading public wolf image:", e);
  }

  // 2. Local environment fallback
  const srcContent = "C:\\Users\\youse\\.gemini\\antigravity-ide\\brain\\7143436e-db2e-4dd9-8309-d096b857b2cc\\media__1785122093009.png";
  try {
    if (fs.existsSync(srcContent)) {
      const fileBuffer = fs.readFileSync(srcContent);
      return new Response(fileBuffer, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
    }
  } catch (e) {
    console.error("Error serving local wolf icon:", e);
  }

  // 3. Fallback to logo.png
  try {
    const fallbackPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(fallbackPath)) {
      const fileBuffer = fs.readFileSync(fallbackPath);
      return new Response(fileBuffer, { headers: { "Content-Type": "image/png" } });
    }
  } catch (e) {
    console.error("Error serving fallback logo:", e);
  }

  return new Response("Not Found", { status: 404 });
}
