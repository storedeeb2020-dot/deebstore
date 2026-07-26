import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "rsy2kpcm",
  api_key: process.env.CLOUDINARY_API_KEY || "465742566736284",
  api_secret: process.env.CLOUDINARY_API_SECRET || "Z5wQ3L-w1oA4xZfL-xX7",
});

export async function POST(req: Request) {
  try {
    const { publicId, publicIds } = await req.json();
    const idsToDelete: string[] = publicIds || (publicId ? [publicId] : []);

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { message: "No public IDs provided" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      idsToDelete.map((id) =>
        cloudinary.uploader.destroy(id, { invalidate: true }).catch((err) => {
          console.error("Cloudinary destroy error for", id, err);
          return { result: "error", id };
        })
      )
    );

    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    console.error("Cloudinary delete route error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
