import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { orderId, publicId } = await req.json();

    if (!orderId || !publicId) {
      return NextResponse.json({ error: "Missing orderId or publicId" }, { status: 400 });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Clear transferScreenshot from Firestore order
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { transferScreenshot: null });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete screenshot error:", err);
    return NextResponse.json({ error: "Failed to delete screenshot" }, { status: 500 });
  }
}
