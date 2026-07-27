"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Palette, Upload, Ruler, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct, getSiteSettings, type GlobalSizeChart } from "@/lib/firebase/firestore";
import { generateSlug, generateSKU } from "@/lib/utils";
import { productSchema, type ProductFormData } from "@/lib/validations/product.schema";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Product, SizeStock } from "@/types/product";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

interface ProductFormProps {
  initialData?: Product;
  productId?: string;
}

const QUICK_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "38", "40", "42", "44", "46"];

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [globalSizeCharts, setGlobalSizeCharts] = useState<GlobalSizeChart[]>([]);

  // Custom states for variant adding inputs
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [customSizeInputs, setCustomSizeInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        if (s?.sizeCharts) setGlobalSizeCharts(s.sizeCharts);
      })
      .catch(console.error);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          sku: initialData.sku || generateSKU(),
          description: initialData.description,
          price: initialData.price,
          salePrice: initialData.salePrice,
          category: initialData.category || "all",
          brand: initialData.brand || "DEEP STORE",
          mainImage: initialData.mainImage,
          variants: initialData.variants,
          featured: initialData.featured ?? false,
          bestSeller: initialData.bestSeller ?? false,
          hasSizes: initialData.hasSizes ?? true,
          sizeChartUrl: initialData.sizeChartUrl || "",
          sizeChartType: initialData.sizeChartType || "",
        }
      : {
          category: "all",
          brand: "DEEP STORE",
          variants: [],
          featured: false,
          bestSeller: false,
          hasSizes: true,
          price: 0,
          sku: generateSKU(),
          sizeChartUrl: "",
          sizeChartType: "",
        },
  });

  const watchedMainImage = watch("mainImage");
  const watchedVariants = watch("variants") || [];
  const watchedHasSizes = watch("hasSizes");
  const watchedSizeChartUrl = watch("sizeChartUrl");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue("name", name);
    if (!productId) {
      setValue("slug", generateSlug(name), { shouldValidate: true });
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const loadingToast = toast.loading("جاري رفع صورة الغلاف...");
    try {
      const url = await uploadToCloudinary(file);
      setValue("mainImage", url, { shouldValidate: true });
      toast.success("تم رفع صورة الغلاف بنجاح", { id: loadingToast });
    } catch {
      toast.error("فشل رفع الصورة", { id: loadingToast });
    }
  };

  const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const loadingToast = toast.loading("جاري رفع صورة اللون...");
    try {
      const url = await uploadToCloudinary(file);
      const current = [...watchedVariants];
      current[index] = { ...current[index], image: url };
      setValue("variants", current, { shouldValidate: true });
      toast.success("تم رفع صورة اللون بنجاح", { id: loadingToast });
    } catch {
      toast.error("فشل رفع الصورة", { id: loadingToast });
    }
  };

  const addColorVariant = () => {
    if (!newColorName.trim()) {
      toast.error("يرجى إدخال اسم اللون");
      return;
    }

    const defaultSizes = watchedHasSizes
      ? [
          { size: "S", stock: 10 },
          { size: "M", stock: 10 },
          { size: "L", stock: 10 },
          { size: "XL", stock: 10 },
        ]
      : [{ size: "One Size", stock: 20 }];

    const newVariant = {
      colorName: newColorName.trim(),
      colorHex: newColorHex,
      image: watchedMainImage || "",
      sizes: defaultSizes,
    };

    setValue("variants", [...watchedVariants, newVariant], { shouldValidate: true });
    setNewColorName("");
  };

  const removeColorVariant = (index: number) => {
    const updated = watchedVariants.filter((_, idx) => idx !== index);
    setValue("variants", updated, { shouldValidate: true });
  };

  const addSizeToVariant = (variantIndex: number, size: string) => {
    const variant = watchedVariants[variantIndex];
    if (variant.sizes?.some((s) => s.size.toLowerCase() === size.toLowerCase())) {
      toast.error(`المقاس "${size}" مضاف بالفعل لهذا اللون`);
      return;
    }

    const newSizeStock: SizeStock = { size: size.trim(), stock: 10 };
    const updatedSizes = [...(variant.sizes || []), newSizeStock];
    const updatedVariants = [...watchedVariants];
    updatedVariants[variantIndex] = { ...variant, sizes: updatedSizes };
    
    setValue("variants", updatedVariants, { shouldValidate: true });
  };

  const handleAddCustomSize = (vIdx: number) => {
    const sizeText = (customSizeInputs[vIdx] || "").trim();
    if (!sizeText) {
      toast.error("أدخل اسم أو قيمة المقاس أولاً");
      return;
    }
    addSizeToVariant(vIdx, sizeText);
    setCustomSizeInputs((prev) => ({ ...prev, [vIdx]: "" }));
  };

  const removeSizeFromVariant = (variantIndex: number, sizeIndex: number) => {
    const variant = watchedVariants[variantIndex];
    const updatedSizes = variant.sizes?.filter((_, idx) => idx !== sizeIndex) || [];
    const updatedVariants = [...watchedVariants];
    updatedVariants[variantIndex] = { ...variant, sizes: updatedSizes };
    
    setValue("variants", updatedVariants, { shouldValidate: true });
  };

  const updateSizeStock = (variantIndex: number, sizeIndex: number, stock: number) => {
    const updatedVariants = [...watchedVariants];
    const variant = updatedVariants[variantIndex];
    const sizes = [...(variant.sizes || [])];
    
    sizes[sizeIndex] = { ...sizes[sizeIndex], stock: Math.max(0, stock) };
    updatedVariants[variantIndex] = { ...variant, sizes };
    
    setValue("variants", updatedVariants, { shouldValidate: true });
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!data.mainImage) {
      toast.error("يرجى رفع صورة الغلاف الرئيسية للمنتج أولاً");
      return;
    }

    if (!data.variants || data.variants.length === 0) {
      toast.error("يرجى إضافة لون واحد على الأقل للمنتج");
      return;
    }

    setSaving(true);
    try {
      if (productId) {
        await updateProduct(productId, data);
        toast.success("تم تحديث بيانات المنتج بنجاح 🐺");
      } else {
        await createProduct(data);
        toast.success("تم إضافة المنتج الجديد للمتجر بنجاح 🐺");
      }
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حفظ المنتج");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl pb-16 font-sans dir-rtl text-white" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white">
            {productId ? "تعديل بيانات المنتج" : "إضافة منتج جديد للمتجر"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            إدخال اسم المنتج، الأسعار، الصور، جداول المقاسات، والخيارات المعروضة بالمتجر.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black text-xs rounded-xl hover:scale-105 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
        >
          {saving ? "جاري الحفظ..." : productId ? "حفظ التعديلات" : "نشر المنتج الآن 🐺"}
        </button>
      </div>

      {/* 1. Basic Product Info */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-2xl space-y-6">
        <h2 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider">
          1. المعلومات الأساسية للمنتج
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">اسم المنتج *</label>
            <input
              type="text"
              placeholder="مثال: تيشيرت أوفرسايز ديب ستور أسود"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              {...register("name", { onChange: handleNameChange })}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">رابط المنتج (Slug) *</label>
            <input
              type="text"
              placeholder="oversize-tshirt-black"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              {...register("slug")}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">كود المنتج (SKU) *</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              {...register("sku")}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">الفئة / القسم *</label>
            <input
              type="text"
              placeholder="تيشيرتات، هوديز، بناطيل، إكسسوارات..."
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              {...register("category")}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1.5">وصف المنتج تفصيلياً *</label>
          <textarea
            rows={4}
            placeholder="اكتب خامة المنتج، تعليمات الغسيل، وتفاصيل القَصّة والتصميم..."
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none resize-none"
            {...register("description")}
          />
        </div>
      </div>

      {/* 2. Cover Image & Pricing */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-2xl space-y-6">
        <h2 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider">
          2. صورة الغلاف والأسعار
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">صورة الغلاف الرئيسية *</label>
            <div className="relative aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center p-2 overflow-hidden group">
              {watchedMainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={watchedMainImage} alt="Main Cover" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-4">
                  <Upload size={24} className="mx-auto text-zinc-600 mb-2" />
                  <p className="text-[11px] text-zinc-400 font-bold">رفع صورة المنتج</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">السعر الأساسي (ج.م) *</label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                placeholder="1200"
                {...register("price", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">سعر الخصم التخفيض (ج.م - اختياري)</label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                placeholder="950"
                {...register("salePrice", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Global Size Chart Selector & Options */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Ruler size={18} className="text-amber-400" />
            <h2 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider">
              3. إعدادات المقاسات وجدول المقاسات المخصص للمنتج
            </h2>
          </div>
        </div>

        {/* Option 1: Toggle Product Has Sizes or No Sizes */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white">نوع المنتج: يحتوي على مقاسات متعددة؟</h3>
            <p className="text-[11px] text-zinc-400">
              قم بإيقاف هذا الخيار للمنتجات ذات المقاس الموحد (One Size)، الإكسسوارات، الشنط أو النظارات.
            </p>
          </div>
          <ToggleSwitch
            checked={!!watchedHasSizes}
            onChange={(val) => setValue("hasSizes", val)}
            size="md"
          />
        </div>

        {/* Option 2: Select Global Size Chart from Uploaded Settings */}
        {watchedHasSizes && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-zinc-300">
              اختر صورة جدول المقاسات المخصص لهذا المنتج:
            </label>

            {globalSizeCharts.length === 0 ? (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-amber-400 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>لم يتم رفع جداول مقاسات عامة من الإعدادات بعد. يمكنك رفعها من تبويب (جدول المقاسات العامة) بالإعدادات.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option "No Size Chart" */}
                <label
                  onClick={() => setValue("sizeChartUrl", "")}
                  className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    !watchedSizeChartUrl
                      ? "border-amber-500 bg-amber-500/10 text-amber-400 font-bold"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="sizeChartSelect"
                    checked={!watchedSizeChartUrl}
                    onChange={() => setValue("sizeChartUrl", "")}
                    className="sr-only"
                  />
                  <span>🚫 بدون جدول مقاسات</span>
                </label>

                {globalSizeCharts.map((chart) => {
                  const isSelected = watchedSizeChartUrl === chart.imageUrl;
                  return (
                    <label
                      key={chart.id}
                      onClick={() => setValue("sizeChartUrl", chart.imageUrl)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/10 text-amber-400 font-bold"
                          : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="sizeChartSelect"
                        checked={isSelected}
                        onChange={() => setValue("sizeChartUrl", chart.imageUrl)}
                        className="sr-only"
                      />
                      <div className="w-10 h-10 rounded-lg bg-black border border-zinc-800 overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={chart.imageUrl} alt={chart.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs truncate">{chart.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Color Variants & Sizes Stock */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider">
              4. الألوان والمخزون المتوفر
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">إضافة الألوان المتاحة وإدارة/إضافة المقاسات والمخزون لكل لون بحرية</p>
          </div>
        </div>

        {/* Add Color */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-zinc-400">{newColorHex}</span>
          </div>

          <input
            type="text"
            placeholder="اسم اللون (مثلاً: أسود كربون، كحلي، أوف وايت)"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            className="flex-1 w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          />

          <button
            type="button"
            onClick={addColorVariant}
            className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
          >
            إضافة اللون
          </button>
        </div>

        {/* Variants List */}
        <div className="space-y-6">
          {watchedVariants.map((variant, vIdx) => (
            <div key={vIdx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-zinc-700" style={{ backgroundColor: variant.colorHex }} />
                  <span className="font-bold text-xs text-white">{variant.colorName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeColorVariant(vIdx)}
                  className="text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-2">صورة هذا اللون</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-black border border-zinc-800 overflow-hidden flex items-center justify-center p-1">
                      {variant.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={variant.image} alt="Color" className="w-full h-full object-contain" />
                      ) : (
                        <Palette size={20} className="text-zinc-700" />
                      )}
                    </div>
                    <label className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-bold hover:text-white cursor-pointer">
                      رفع الصورة
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleVariantImageUpload(vIdx, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  {/* Current Active Sizes List */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-2">المقاسات الحالية وكميات المخزون المتوفرة لهذا اللون:</label>
                    <div className="flex flex-wrap gap-2">
                      {variant.sizes?.map((sizeItem, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1.5 bg-zinc-950 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs shadow-sm">
                          <span className="font-extrabold text-amber-400">{sizeItem.size}</span>
                          <span className="text-zinc-500 text-[10px]">الكمية:</span>
                          <input
                            type="number"
                            value={sizeItem.stock}
                            onChange={(e) => updateSizeStock(vIdx, sIdx, parseInt(e.target.value) || 0)}
                            className="w-12 px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-center text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSizeFromVariant(vIdx, sIdx)}
                            className="text-zinc-500 hover:text-red-400 font-bold px-1"
                            title="حذف هذا المقاس"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Sizes Options */}
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      إضافة مقاسات جديدة لهذا اللون (بمزاجك):
                    </label>

                    {/* Quick Size Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_SIZES.map((sz) => {
                        const alreadyHas = variant.sizes?.some((s) => s.size.toLowerCase() === sz.toLowerCase());
                        return (
                          <button
                            key={sz}
                            type="button"
                            disabled={alreadyHas}
                            onClick={() => addSizeToVariant(vIdx, sz)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              alreadyHas
                                ? "bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed opacity-50"
                                : "bg-zinc-900 text-amber-300 border border-zinc-800 hover:bg-amber-500 hover:text-black cursor-pointer active:scale-95"
                            }`}
                          >
                            + {sz}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Size Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="أدخل أي مقاس مخصص بيدك (مثلاً: 50، Oversize 1، 4XL)..."
                        value={customSizeInputs[vIdx] || ""}
                        onChange={(e) => setCustomSizeInputs((prev) => ({ ...prev, [vIdx]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomSize(vIdx);
                          }
                        }}
                        className="flex-1 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomSize(vIdx)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        <Plus size={14} />
                        إضافة المقاس
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
