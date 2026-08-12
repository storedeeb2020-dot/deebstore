"use client";

import { useCallback, useState, useId } from "react";
import Image from "next/image";
import { Upload, X, Plus, Loader2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  id?: string;
  multiple?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  id: customId,
  multiple = true,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const autoId = useId();
  const inputId = customId || `image-input-${autoId.replace(/:/g, "")}`;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (fileArray.length === 0) return;

      const targetFiles = multiple ? fileArray : [fileArray[0]];

      setUploading(true);
      try {
        const urls = await Promise.all(
          targetFiles.map((file) => uploadToCloudinary(file))
        );

        if (multiple) {
          onChange([...images, ...urls]);
        } else {
          onChange([urls[0]]);
        }
        toast.success(`${urls.length} image(s) uploaded successfully`);
      } catch {
        toast.error("Upload failed. Please check your Cloudinary configuration.");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange, multiple]
  );

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-black bg-gray-50"
            : "border-gray-200 hover:border-gray-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
              e.target.value = ""; // Reset input so re-uploading same file works
            }
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-gray-400" size={24} />
            <p className="text-sm text-gray-400">Uploading to Cloudinary...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="text-gray-400" size={24} />
            <p className="text-sm font-medium">
              Drop images here or{" "}
              <span className="text-black underline">browse</span>
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, WEBP — transparent background preferred
            </p>
          </div>
        )}
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200"
            >
              <Image
                src={url}
                alt={`Image ${i + 1}`}
                fill
                className="object-contain p-2 bg-gray-50"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(i);
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X size={12} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full z-10">
                  Main
                </span>
              )}
            </div>
          ))}

          {/* Add More Button */}
          {multiple && (
            <button
              type="button"
              onClick={() => document.getElementById(inputId)?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
            >
              <Plus size={20} className="text-gray-400" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
