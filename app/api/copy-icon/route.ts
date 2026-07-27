import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const src = "C:\\Users\\youse\\.gemini\\antigravity-ide\\brain\\7143436e-db2e-4dd9-8309-d096b857b2cc\\media__1785122093009.png";
  const dest = path.join(process.cwd(), "public", "wolf-icon.png");
  
  const status: any = {
    srcExists: false,
    destExists: false,
    copied: false,
    error: null,
    srcPath: src,
    destPath: dest
  };

  try {
    status.srcExists = fs.existsSync(src);
    status.destExists = fs.existsSync(dest);
    
    if (status.srcExists) {
      fs.copyFileSync(src, dest);
      status.copied = true;
      status.destExistsAfter = fs.existsSync(dest);
      
      // Also delete the old intro file if it exists
      const oldFile = path.join(process.cwd(), "components", "intros", "NXTIntro.tsx");
      status.oldFileExists = fs.existsSync(oldFile);
      if (status.oldFileExists) {
        fs.unlinkSync(oldFile);
        status.oldFileDeleted = true;
      }
    } else {
      status.error = "Source file does not exist at path: " + src;
    }
  } catch (e: any) {
    status.error = e.message || String(e);
  }

  return NextResponse.json(status);
}
