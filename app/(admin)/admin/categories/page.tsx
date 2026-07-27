"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Upload, Loader2, Sparkles, FolderPlus } from "lucide-react";
import Image from "next/image";
import { getCategories, createCategory, deleteCategory } from "@/lib/firebase/firestore";
import { generateSlug } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Category } from "@/types/category";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [newName, setNewName] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const loadingToast = toast.loading("جاري رفع صورة الفئة إلى Cloudinary...");
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
      toast.success("تم رفع الصورة بنجاح 🐺", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("فشل رفع الصورة، يرجى المحاولة مرة أخرى", { id: loadingToast });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("يرجى كتابة اسم الفئة أو القسم أولاً");
      return;
    }
    setAdding(true);
    try {
      await createCategory({
        name: newName.trim(),
        subtitle: newSubtitle.trim() || undefined,
        slug: generateSlug(newName.trim()),
        image: imageUrl || undefined,
        order: categories.length,
      });
      setNewName("");
      setNewSubtitle("");
      setImageUrl("");
      toast.success("تم إضافة الفئة الجديدة بنجاح 🐺");
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("فشل إضافة الفئة");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = window.confirm(`هل أنت تأكد من حذف فئة "${name}"؟`);
    if (!isConfirmed) return;
    
    try {
      await deleteCategory(id);
      toast.success("تم حذف الفئة بنجاح");
      loadCategories();
    } catch {
      toast.error("فشل حذف الفئة");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16 font-sans dir-rtl text-white" dir="rtl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <FolderPlus size={14} />
          إدارة الأقسام والفئات الرئيسية
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">الأقسام والفئات</h1>
        <p className="text-zinc-400 text-xs mt-1">
          إضافة وصورة وتصميم الأقسام المعروضة في الصفحة الرئيسية وفي المتجر. الأقسام رئيسية فقط (بدون أقسام فرعية).
        </p>
      </div>

      {/* Add New Category Box */}
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
        <h2 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
          <Sparkles size={16} />
          إضافة فئة جديدة للكتالوج
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image Uploader */}
          <div className="md:col-span-1 space-y-2">
            <label className="block text-xs font-bold text-zinc-300">صورة الفئة (اختياري)</label>
            <div className="relative aspect-[3/4] rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center p-3 overflow-hidden group hover:border-amber-500/50 transition-colors">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt="Category image preview"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold bg-black/80 text-white px-3 py-1.5 rounded-full border border-white/20">
                      تغيير الصورة
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  {uploadingImage ? (
                    <Loader2 size={24} className="animate-spin text-amber-400 mx-auto mb-2" />
                  ) : (
                    <Upload size={24} className="mx-auto text-zinc-600 mb-2 group-hover:text-amber-400 transition-colors" />
                  )}
                  <p className="text-[11px] text-zinc-400 font-bold">
                    {uploadingImage ? "جاري الرفع..." : "اضغط لرفع صورة الفئة"}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">تنسيق عمودي (Portrait) مفضّل</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Text Inputs */}
          <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">اسم الفئة / القسم *</label>
                <input
                  type="text"
                  placeholder="مثال: Casual Shirt، Suits، Hoodies..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">العنوان الفرعي (Subtitle - اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: Shirt ، Modern Fit ، Summer Collection..."
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">يُستغل لإعطاء لمسة جمالية في تصميم بطاقة القسم.</p>
              </div>

              {newName.trim() && (
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 font-mono">
                  الرابط التلقائي (Slug): <span className="text-amber-400 font-bold">/{generateSlug(newName.trim())}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black px-6 py-3.5 rounded-xl font-black text-xs hover:scale-[1.01] transition-all duration-300 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {adding ? (
                <Spinner size="sm" className="border-black border-t-transparent" />
              ) : (
                <Plus size={16} />
              )}
              حفظ وإضافة الفئة
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid List */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-zinc-300">
          الأقسام المتاحة بالكتالوج ({categories.length})
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-4 text-amber-400">
            <Spinner size="lg" />
            <p className="text-xs text-amber-400 font-medium uppercase tracking-widest">جاري تحميل الفئات...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-12 text-center text-zinc-500">
            لا توجد أقسام مضافة بعد. استخدم النموذج أعلاه لإضافة أول قسم.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Category Portrait Image Card */}
                <div className="relative aspect-[3/4] w-full bg-zinc-900 overflow-hidden">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-700">
                      <ImageIcon size={40} className="mb-2" />
                      <span className="text-[10px] text-zinc-500">بدون صورة</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Styled Category Title Overlay */}
                  <div className="absolute bottom-4 left-0 right-0 px-4 text-center">
                    <h3 className="text-white font-bold text-xl drop-shadow-md tracking-tight">
                      {cat.name} {cat.subtitle && <span className="font-serif italic font-normal text-amber-300/90 ml-1">{cat.subtitle}</span>}
                    </h3>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-zinc-300 hover:text-red-400 hover:bg-black/90 transition-all cursor-pointer"
                    title="حذف هذا القسم"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Footer details */}
                <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                  <span className="truncate">/{cat.slug}</span>
                  <span className="text-[10px] text-amber-400/80"># {cat.order + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
