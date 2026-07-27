"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Upload, Loader2, Sparkles, FolderPlus, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { getCategories, createCategory, deleteCategory, updateCategoryOrder } from "@/lib/firebase/firestore";
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

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    const updatedOrders = newCategories.map((cat, i) => ({
      ...cat,
      order: i,
    }));

    setCategories(updatedOrders);

    try {
      await updateCategoryOrder(
        updatedOrders.map((cat) => ({ id: cat.id, order: cat.order }))
      );
      toast.success("تم الترتيب وتغيير أولوية الظهور 🐺");
    } catch (err) {
      console.error(err);
      toast.error("فشل حفظ الترتيب الجديد");
      loadCategories();
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
        <h1 className="text-3xl font-black tracking-tight text-white">الأقسام وترتيب الظهور</h1>
        <p className="text-zinc-400 text-xs mt-1">
          إضافة الأقسام بالإنجليزية (للرابط) وبالعربية (للعرض على الكروت في المتجر).
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
            <label className="block text-xs font-bold text-zinc-300">صورة الفئة (بجودة عالية)</label>
            <div className="relative aspect-[3/4] rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center p-3 overflow-hidden group hover:border-amber-500/50 transition-colors">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt="Category image preview"
                    fill
                    unoptimized
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
                  <p className="text-[10px] text-zinc-500 mt-1">تنسيق عمودي HD مفضّل</p>
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
              {/* Field 1: English Name for URL slug */}
              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1.5">
                  1. اسم الفئة بالإنجليزية (للرابط - English Name & Slug) *
                </label>
                <input
                  type="text"
                  placeholder="مثال: Casual Shirt ، Suits ، Hoodies..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">يُستخدم لبناء رابط الفئة بالإنجليزية.</p>
              </div>

              {/* Field 2: Arabic Display Name */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  2. اسم الفئة بالعربي (الذي يظهر للعميل على الكارت والمنتجات) *
                </label>
                <input
                  type="text"
                  placeholder="مثال: قمصان كاجوال ، بدل ، هوديز عصرية..."
                  value={newNameAr}
                  onChange={(e) => setNewNameAr(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-sans"
                />
                <p className="text-[10px] text-zinc-500 mt-1">هذا هو الاسم الذي يظهر بخط عربي فاخر على بطاقات المتجر والمنتجات.</p>
              </div>

              {/* Field 3: Subtitle */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  3. العنوان الفرعي (Subtitle - اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: Shirt ، Modern Fit ، تشكيلة الصيف..."
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {newName.trim() && (
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 font-mono">
                  رابط الصفحة التلقائي (Slug): <span className="text-amber-400 font-bold">/{generateSlug(newName.trim())}</span>
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
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-zinc-300">
            الأقسام المتاحة بالكتالوج ({categories.length})
          </h2>
          <p className="text-[11px] text-amber-400">استخدم أسهم الترتيب للتقديم أو التأخير ⚡</p>
        </div>

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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Category Portrait Image Card */}
                <div className="relative aspect-[3/4] w-full bg-zinc-900 overflow-hidden">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.nameAr || cat.name}
                      fill
                      unoptimized
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

                  {/* Order Badge Header */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-amber-400 font-black text-xs px-2.5 py-1 rounded-lg border border-amber-500/30">
                    الترتيب #{idx + 1}
                  </div>

                  {/* Styled Category Title Overlay (Displaying Arabic Name with elegant font) */}
                  <div className="absolute bottom-4 left-0 right-0 px-3 text-center">
                    <h3 className="text-white font-extrabold text-base sm:text-xl drop-shadow-md tracking-tight leading-snug">
                      {cat.nameAr || cat.name}
                      {cat.subtitle && (
                        <span className="block text-xs font-normal text-amber-300/90 mt-0.5 opacity-90">
                          {cat.subtitle}
                        </span>
                      )}
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

                {/* Footer details & Reordering Controls */}
                <div className="p-3 bg-zinc-900 border-t border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span className="truncate">/{cat.slug}</span>
                    <span className="text-zinc-500 font-sans font-bold">{cat.name}</span>
                  </div>

                  {/* Up / Down Order Buttons */}
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      className="flex-1 inline-flex items-center justify-center gap-1 bg-zinc-950 hover:bg-amber-500 hover:text-black border border-zinc-800 text-amber-400 rounded-lg py-1.5 text-[11px] font-bold transition-all disabled:opacity-30 disabled:hover:bg-zinc-950 disabled:hover:text-amber-400 cursor-pointer disabled:cursor-not-allowed"
                      title="تقديم للأول"
                    >
                      <ChevronRight size={14} />
                      تقديم
                    </button>
                    <button
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === categories.length - 1}
                      className="flex-1 inline-flex items-center justify-center gap-1 bg-zinc-950 hover:bg-amber-500 hover:text-black border border-zinc-800 text-amber-400 rounded-lg py-1.5 text-[11px] font-bold transition-all disabled:opacity-30 disabled:hover:bg-zinc-950 disabled:hover:text-amber-400 cursor-pointer disabled:cursor-not-allowed"
                      title="تأخير للأخير"
                    >
                      تأخير
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
