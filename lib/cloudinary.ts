// Cloudinary upload helper (client-side)
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "rsy2kpcm";
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "nxt_products";

  formData.append("upload_preset", preset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudinary");
  }

  const data = await response.json();
  return data.secure_url as string;
}

export async function uploadMultipleToCloudinary(files: File[]): Promise<string[]> {
  const uploads = files.map((file) => uploadToCloudinary(file));
  return Promise.all(uploads);
}

export function getCloudinaryPublicId(url: string): string {
  // Extract public_id from Cloudinary URL
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return "";
  // Skip version if present (v1234567)
  const afterUpload = parts.slice(uploadIndex + 1);
  const withoutVersion = afterUpload[0]?.startsWith("v")
    ? afterUpload.slice(1)
    : afterUpload;
  const filename = withoutVersion.join("/");
  // Remove extension
  return filename.replace(/\.[^/.]+$/, "");
}

export async function deleteFromCloudinary(urls: string | string[]): Promise<void> {
  const urlArray = Array.isArray(urls) ? urls : [urls];
  const publicIds = urlArray.map(getCloudinaryPublicId).filter(Boolean);

  if (publicIds.length === 0) return;

  try {
    await fetch("/api/admin/cloudinary/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicIds }),
    });
  } catch (err) {
    console.error("Failed to delete images from Cloudinary:", err);
  }
}
