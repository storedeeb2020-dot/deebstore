import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const src = "C:\\Users\\youse\\.gemini\\antigravity-ide\\brain\\7143436e-db2e-4dd9-8309-d096b857b2cc\\media__1785122093009.png";
  
  try {
    if (fs.existsSync(src)) {
      const fileBuffer = fs.readFileSync(src);
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }
  } catch (e) {
    console.error("Error serving wolf icon from API:", e);
  }

  // Fallback: if the file cannot be read, serve the logo.png
  try {
    const fallbackPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(fallbackPath)) {
      const fileBuffer = fs.readFileSync(fallbackPath);
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": "image/png"
        }
      });
    }
  } catch (e) {
    console.error("Error serving fallback logo:", e);
  }

  return new Response("Not Found", { status: 404 });
}
