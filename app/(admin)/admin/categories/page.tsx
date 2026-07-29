"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Upload, Loader2, Sparkles, FolderPlus, ChevronRight, ChevronLeft, FolderTree } from "lucide-react";
import Image from "next/image";
import { getCategories, createCategory, deleteCategory, updateCategoryOrder } from "@/lib/firebase/firestore";
import { generateSlug } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Category } from "@/types/category";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [newName, setNewName] = useState("");
  const [newNameAr, setNewNameAr] = useState("");
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
      toast.success("تم رفع صورة الفئة بنجاح 🐺", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("فشل رفع الصورة، يرجى المحاولة مرة أخرى", { id: loadingToast });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("يرجى كتابة اسم الفئة بالإنجليزية (للرابط)");
      return;
    }
    setAdding(true);
    try {
      await createCategory({
        name: newName.trim(),
        nameAr: newNameAr.trim() || newName.trim(),
        subtitle: newSubtitle.trim() || undefined,
        slug: generateSlug(newName.trim()),
        image: imageUrl || undefined,
        order: categories.length,
      });
      setNewName("");
      setNewNameAr("");
      setNewSubtitle("");
      setImageUrl("");
      toast.success("تم إضافة القسم الجديد بنجاح 🐺");
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("فشل إضافة القسم");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = window.confirm(`هل أنت تأكد من حذف قسم "${name}"؟`);
    if (!isConfirmed) return;
    
    try {
      await deleteCategory(id);
      toast.success("تم حذف القسم بنجاح");
      loadCategories();
    } catch {
      toast.error("فشل حذف القسم");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    setCategories(newCategories);

    try {
      await updateCategoryOrder(
        newCategories.map((c, i) => ({ id: c.id, order: i }))
      );
    } catch (err) {
      console.error(err);
      toast.error("فشل إعادة الترتيب");
      loadCategories();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl pb-16 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF274B] mb-1">
            <FolderTree size={16} />
            الأقسام والفئات الفاخرة
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            هيكلية أقسام المتجر الرئيسية
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            إضافة قسم جديد، رفع الصور، والتحكم في ترتيب الظهور بالصفحة الرئيسية والمنيو.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Category Form */}
        <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 shadow-sm dark:shadow-2xl space-y-5 h-fit">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-[#FF274B]">
            <FolderPlus size={16} />
            <span>إضافة قسم جديد</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">الاسم بالعربية *</label>
              <input
                type="text"
                placeholder="مثال: تشكيلة الصيف، بنطلونات..."
                value={newNameAr}
                onChange={(e) => setNewNameAr(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-white/[0.08] rounded-xl bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-white outline-none focus:border-[#FF274B] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">الاسم بالإنجليزية (للرابط) *</label>
              <input
                type="text"
                placeholder="مثال: Summer, Pants..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-white/[0.08] rounded-xl bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-white outline-none focus:border-[#FF274B] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">الوصف الفرعي (Subtitle)</label>
              <input
                type="text"
                placeholder="مثال: أحدث الموديلات العصرية..."
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-white/[0.08] rounded-xl bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-white outline-none focus:border-[#FF274B] font-bold"
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">صورة غلاف القسم</label>
              {imageUrl ? (
                <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/[0.06] bg-zinc-900">
                  <Image src={imageUrl} alt="Category" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/70 text-white hover:bg-black"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-white/[0.1] rounded-2xl cursor-pointer hover:border-[#FF274B] transition-colors bg-zinc-50 dark:bg-zinc-900/30">
                  <Upload size={24} className="text-[#FF274B] mb-2" />
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    {uploadingImage ? "جاري الرفع..." : "اختر صورة الغلاف"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={adding || uploadingImage}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF274B] to-amber-500 text-white font-black text-xs shadow-md shadow-[#FF274B]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {adding ? "جاري الإضافة..." : "حفظ إضافة القسم 🔥"}
            </button>
          </div>
        </div>

        {/* Categories List Display */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black uppercase text-zinc-400 tracking-wider">الأقسام الحالية ({categories.length})</h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#FF274B]">
              <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-12 text-center text-zinc-500 text-xs font-bold">
              لا توجد أقسام مضافة بعد.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-4 flex items-center gap-4 shadow-sm hover:border-[#FF274B]/50 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] shrink-0 relative">
                    {cat.image ? (
                      <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-500 font-black text-xs">
                        DEEP
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-zinc-900 dark:text-white truncate">{cat.nameAr || cat.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{cat.slug}</p>
                    {cat.subtitle && (
                      <p className="text-[10px] text-amber-500 truncate mt-0.5">{cat.subtitle}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleMove(i, "up")}
                      disabled={i === 0}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                    >
                      <ChevronRight size={16} className="rotate-90" />
                    </button>
                    <button
                      onClick={() => handleMove(i, "down")}
                      disabled={i === categories.length - 1}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                    >
                      <ChevronLeft size={16} className="rotate-90" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.nameAr || cat.name)}
                      className="p-1 text-zinc-400 hover:text-[#FF274B]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
