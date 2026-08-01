"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Palette, Upload, Ruler, AlertCircle, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct, getSiteSettings, getCategories, type GlobalSizeChart } from "@/lib/firebase/firestore";
import { generateSlug, generateSKU } from "@/lib/utils";
import { productSchema, type ProductFormData } from "@/lib/validations/product.schema";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
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

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([
      getSiteSettings(),
      getCategories(),
    ])
      .then(([s, cats]) => {
        if (s?.sizeCharts) setGlobalSizeCharts(s.sizeCharts);
        setCategoriesList(cats || []);
      })
      .catch(console.error);
  }, []);

  // Compute initial form values safely
  const defaultPriceAfter = initialData ? (initialData.salePrice ?? initialData.price) : 0;
  const defaultPriceBefore = initialData && initialData.salePrice ? initialData.price : undefined;

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
          price: defaultPriceAfter,
          salePrice: defaultPriceBefore,
          category: initialData.category || "",
          brand: initialData.brand || "DEEB STORE",
          mainImage: initialData.mainImage,
          variants: initialData.variants,
          featured: initialData.featured ?? false,
          bestSeller: initialData.bestSeller ?? false,
          hasSizes: initialData.hasSizes ?? true,
          sizeChartUrl: initialData.sizeChartUrl || "",
          sizeChartType: initialData.sizeChartType || "",
        }
      : {
          category: "",
          brand: "DEEB STORE",
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

    const toastId = toast.loading("جاري رفع صورة الغلاف للمنتج...");
    try {
      const url = await uploadToCloudinary(file);
      setValue("mainImage", url, { shouldValidate: true });
      toast.success("تم رفع صورة الغلاف بنجاح 🖼️", { id: toastId });
    } catch {
      toast.error("فشل رفع صورة الغلاف", { id: toastId });
    }
  };

  const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("جاري رفع صورة اللون...");
    try {
      const url = await uploadToCloudinary(file);
      const currentVariants = [...(watch("variants") || [])];
      if (currentVariants[index]) {
        currentVariants[index].image = url;
        setValue("variants", currentVariants, { shouldValidate: true });
      }
      toast.success("تم رفع صورة اللون بنجاح", { id: toastId });
    } catch {
      toast.error("فشل رفع الصورة", { id: toastId });
    }
  };

  const addColorVariant = () => {
    if (!newColorName.trim()) {
      toast.error("يرجى كتابة اسم اللون أولاً (مثل: أسود كربون)");
      return;
    }

    const currentVariants = watch("variants") || [];
    setValue(
      "variants",
      [
        ...currentVariants,
        {
          colorName: newColorName.trim(),
          colorHex: newColorHex,
          image: "",
          sizes: [
            { size: "M", stock: 10 },
            { size: "L", stock: 10 },
            { size: "XL", stock: 10 },
          ],
        },
      ],
      { shouldValidate: true }
    );

    setNewColorName("");
    toast.success(`تمت إضافة اللون (${newColorName.trim()})`);
  };

  const removeColorVariant = (index: number) => {
    const currentVariants = watch("variants") || [];
    setValue(
      "variants",
      currentVariants.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const addSizeToVariant = (variantIndex: number, sizeName: string) => {
    const currentVariants = [...(watch("variants") || [])];
    const variant = currentVariants[variantIndex];
    if (!variant) return;

    const sizes = [...(variant.sizes || [])];
    if (sizes.some((s) => s.size.toLowerCase() === sizeName.trim().toLowerCase())) {
      toast.error("هذا المقاس مضاف بالفعل لهذا اللون");
      return;
    }

    sizes.push({ size: sizeName.trim(), stock: 10 });
    currentVariants[variantIndex] = { ...variant, sizes };
    setValue("variants", currentVariants, { shouldValidate: true });
  };

  const handleAddCustomSize = (variantIndex: number) => {
    const inputVal = customSizeInputs[variantIndex] || "";
    if (!inputVal.trim()) return;
    addSizeToVariant(variantIndex, inputVal);
    setCustomSizeInputs((prev) => ({ ...prev, [variantIndex]: "" }));
  };

  const updateSizeStock = (variantIndex: number, sizeIndex: number, rawStock: number | string) => {
    const currentVariants = [...(watch("variants") || [])];
    const variant = currentVariants[variantIndex];
    if (!variant) return;

    const sizes = [...(variant.sizes || [])];
    if (sizes[sizeIndex]) {
      if (rawStock === "") {
        sizes[sizeIndex].stock = "" as any;
      } else {
        const parsed = parseInt(String(rawStock), 10);
        sizes[sizeIndex].stock = isNaN(parsed) ? ("" as any) : Math.max(0, parsed);
      }
    }
    currentVariants[variantIndex] = { ...variant, sizes };
    setValue("variants", currentVariants, { shouldValidate: true });
  };

  const removeSizeFromVariant = (variantIndex: number, sizeIndex: number) => {
    const currentVariants = [...(watch("variants") || [])];
    const variant = currentVariants[variantIndex];
    if (!variant) return;

    const sizes = variant.sizes?.filter((_, i) => i !== sizeIndex) || [];
    currentVariants[variantIndex] = { ...variant, sizes };
    setValue("variants", currentVariants, { shouldValidate: true });
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

    // Process Price & Sale Price mapping correctly:
    // data.price is "السعر بعد الخصم / السعر الفعلي"
    // data.salePrice is "السعر قبل الخصم (اختياري)"
    let finalPrice = data.price;
    let finalSalePrice: number | undefined = undefined;

    if (data.salePrice && data.salePrice > data.price) {
      finalPrice = data.salePrice; // e.g. 1200 (original before discount)
      finalSalePrice = data.price; // e.g. 950 (discounted actual selling price)
    }

    const sanitizedVariants = (data.variants || []).map((v) => ({
      ...v,
      sizes: (v.sizes || []).map((s) => ({
        ...s,
        stock: typeof s.stock === "number" ? s.stock : parseInt(String(s.stock), 10) || 0,
      })),
    }));

    const payload = {
      ...data,
      variants: sanitizedVariants,
      price: finalPrice,
      salePrice: finalSalePrice,
    };

    setSaving(true);
    try {
      if (productId) {
        await updateProduct(productId, payload);
        toast.success("تم تحديث بيانات المنتج بنجاح 🐺");
      } else {
        await createProduct(payload);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl pb-16 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/[0.06] pb-5">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
            {productId ? "تعديل بيانات المنتج" : "إضافة منتج جديد للمتجر"}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            إدخال اسم المنتج، الأسعار (قبل وبعد الخصم)، الصور، الخيارات، وجداول المقاسات.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 bg-gradient-to-r from-[#FF274B] to-amber-500 text-white font-black text-xs rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#FF274B]/20 disabled:opacity-50 cursor-pointer"
        >
          {saving ? "جاري الحفظ..." : productId ? "حفظ التعديلات" : "نشر المنتج الآن 🐺"}
        </button>
      </div>

      {/* 1. Basic Product Info */}
      <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
        <h2 className="font-extrabold text-sm text-[#FF274B] uppercase tracking-wider">
          1. المعلومات الأساسية للمنتج
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">اسم المنتج *</label>
            <input
              type="text"
              placeholder="مثال: تيشيرت أوفرسايز ديب ستور أسود"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-[#FF274B] focus:outline-none font-bold"
              {...register("name", { onChange: handleNameChange })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">رابط المنتج (Slug) *</label>
            <input
              type="text"
              placeholder="oversize-tshirt-black"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-[#FF274B] focus:outline-none font-bold"
              {...register("slug")}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">كود المنتج (SKU) *</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white font-mono focus:border-[#FF274B] focus:outline-none font-bold"
              {...register("sku")}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">الفئة / القسم (إجباري) *</label>
            <select
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#FF274B] focus:outline-none cursor-pointer font-bold"
              {...register("category")}
            >
              <option value="">-- اختر الفئة / القسم للمنتج --</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.slug || cat.name}>
                  {cat.nameAr ? `${cat.nameAr} (${cat.name})` : cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1 font-bold">{errors.category.message}</p>}
            {categoriesList.length === 0 && (
              <p className="text-amber-500 text-[10px] mt-1 font-bold">
                تنبيه: لا توجد أقسام مسجلة حتى الآن. يمكنك إضافة أقسام من تبويب الأقسام في لوحة التحكم.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">وصف المنتج تفصيلياً *</label>
          <textarea
            rows={4}
            placeholder="اكتب خامة المنتج، تعليمات الغسيل، وتفاصيل القَصّة والتصميم..."
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-[#FF274B] focus:outline-none resize-none font-bold"
            {...register("description")}
          />
        </div>
      </div>

      {/* 2. Cover Image & Pricing */}
      <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
        <h2 className="font-extrabold text-sm text-[#FF274B] uppercase tracking-wider">
          2. صورة الغلاف وتحديد الأسعار (قبل وبعد الخصم)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">صورة الغلاف الرئيسية *</label>
            <div className="relative aspect-square rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/[0.08] flex flex-col items-center justify-center p-2 overflow-hidden group">
              {watchedMainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={watchedMainImage} alt="Main Cover" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-4">
                  <Upload size={24} className="mx-auto text-zinc-400 mb-2" />
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold">رفع صورة المنتج</p>
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

          <div className="sm:col-span-2 space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                السعر بعد الخصم / السعر الفعلي للبيع (ج.م) *
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#FF274B] focus:outline-none font-extrabold"
                placeholder="مثال: 950"
                {...register("price", { valueAsNumber: true })}
              />
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                ✓ هذا هو السعر الحقيقي والفعلي الذي يدفعه العميل الآن عند الشراء.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                السعر قبل الخصم (ج.م - اختياري)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#FF274B] focus:outline-none font-bold"
                placeholder="مثال: 1200"
                {...register("salePrice", { valueAsNumber: true })}
              />
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold mt-1">
                السعر القديم قبل الخصم ليظهر مشطوباً بالمتجر (مثال: <s>1200 ج.م</s>). اتركه فارغاً إذا لم يوجد خصم.
              </p>
            </div>
          </div>
        </div>

        {/* Best Seller Option Toggle */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              عرض هذا المنتج في قائمة الأكثر مبيعاً 🔥 (Best Seller)
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              قم بتفعيل هذا الخيار لظهور المنتج في قسم الأكثر مبيعاً على الصفحة الرئيسية وفي المنيو.
            </p>
          </div>
          <ToggleSwitch
            checked={!!watch("bestSeller")}
            onChange={(val) => setValue("bestSeller", val)}
            size="md"
          />
        </div>
      </div>

      {/* 3. Global Size Chart Selector & Options */}
      <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Ruler size={18} className="text-[#FF274B]" />
            <h2 className="font-extrabold text-sm text-[#FF274B] uppercase tracking-wider">
              3. إعدادات المقاسات وجدول المقاسات المخصص للمنتج
            </h2>
          </div>
        </div>

        {/* Option 1: Toggle Product Has Sizes or No Sizes */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">نوع المنتج: يحتوي على مقاسات متعددة؟</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
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
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              اختر صورة جدول المقاسات المخصص لهذا المنتج:
            </label>

            {globalSizeCharts.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2">
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
                      ? "border-[#FF274B] bg-[#FF274B]/10 text-[#FF274B] font-bold"
                      : "border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
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
                          ? "border-[#FF274B] bg-[#FF274B]/10 text-[#FF274B] font-bold"
                          : "border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="sizeChartSelect"
                        checked={isSelected}
                        onChange={() => setValue("sizeChartUrl", chart.imageUrl)}
                        className="sr-only"
                      />
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/[0.08] overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={chart.imageUrl} alt={chart.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs truncate font-bold">{chart.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Color Variants & Sizes Stock */}
      <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
          <div>
            <h2 className="font-extrabold text-sm text-[#FF274B] uppercase tracking-wider">
              4. الألوان والمخزون المتوفر
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">إضافة الألوان المتاحة وإدارة/إضافة المقاسات والمخزون لكل لون بحرية</p>
          </div>
        </div>

        {/* Add Color */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-zinc-500 font-bold">{newColorHex}</span>
          </div>

          <input
            type="text"
            placeholder="اسم اللون (مثلاً: أسود كربون، كحلي، أوف وايت)"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            className="flex-1 w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-bold"
          />

          <button
            type="button"
            onClick={addColorVariant}
            className="px-5 py-2.5 bg-[#FF274B] text-white font-extrabold text-xs rounded-xl hover:bg-[#FF274B]/90 transition-colors cursor-pointer"
          >
            إضافة اللون
          </button>
        </div>

        {/* Variants List */}
        <div className="space-y-6">
          {watchedVariants.map((variant, vIdx) => (
            <div key={vIdx} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-sm" style={{ backgroundColor: variant.colorHex }} />
                  <span className="font-bold text-xs text-zinc-900 dark:text-white">{variant.colorName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeColorVariant(vIdx)}
                  className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-2">صورة هذا اللون</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-white/[0.08] overflow-hidden flex items-center justify-center p-1">
                      {variant.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={variant.image} alt="Color" className="w-full h-full object-contain" />
                      ) : (
                        <Palette size={20} className="text-zinc-400" />
                      )}
                    </div>
                    <label className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold hover:text-[#FF274B] cursor-pointer shadow-sm">
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
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-2">المقاسات الحالية وكميات المخزون المتوفرة لهذا اللون:</label>
                    <div className="flex flex-wrap gap-2">
                      {variant.sizes?.map((sizeItem, sIdx) => {
                        const currentStockNum = typeof sizeItem.stock === "number" ? sizeItem.stock : parseInt(String(sizeItem.stock), 10) || 0;
                        return (
                          <div key={sIdx} className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 border border-[#FF274B]/30 px-2.5 py-1.5 rounded-xl text-xs shadow-sm">
                            <span className="font-extrabold text-[#FF274B] text-xs min-w-[20px]">{sizeItem.size}</span>
                            <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200 dark:border-white/[0.08]">
                              <button
                                type="button"
                                onClick={() => updateSizeStock(vIdx, sIdx, Math.max(0, currentStockNum - 1))}
                                className="w-6 h-6 rounded-md bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center justify-center hover:bg-[#FF274B] hover:text-white transition-colors text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
                                title="إنقاص القطع"
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                value={sizeItem.stock === undefined || sizeItem.stock === null ? "" : sizeItem.stock}
                                onChange={(e) => updateSizeStock(vIdx, sIdx, e.target.value)}
                                onFocus={(e) => e.target.select()}
                                className="w-10 px-0.5 py-0.5 bg-transparent text-center text-xs text-zinc-900 dark:text-white font-mono focus:outline-none font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => updateSizeStock(vIdx, sIdx, currentStockNum + 1)}
                                className="w-6 h-6 rounded-md bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center justify-center hover:bg-[#FF274B] hover:text-white transition-colors text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
                                title="زيادة القطع"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSizeFromVariant(vIdx, sIdx)}
                              className="text-zinc-400 hover:text-red-500 font-bold px-1 text-sm cursor-pointer"
                              title="حذف هذا المقاس"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Sizes Options */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.06] space-y-3">
                    <label className="block text-[11px] font-bold text-[#FF274B] uppercase tracking-wider">
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
                                ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed opacity-50"
                                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-[#FF274B] hover:text-white cursor-pointer active:scale-95"
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
                        placeholder="أدخل أي مقاس مخصص بيدك (مثلاً: 50، Oversize 1)..."
                        value={customSizeInputs[vIdx] || ""}
                        onChange={(e) => setCustomSizeInputs((prev) => ({ ...prev, [vIdx]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomSize(vIdx);
                          }
                        }}
                        className="flex-1 px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomSize(vIdx)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-[#FF274B] hover:bg-[#FF274B]/90 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
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

      {/* Sticky Mobile Save Bar */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 p-3 bg-white/95 dark:bg-[#0E0E10]/95 backdrop-blur-xl border-t border-zinc-200 dark:border-white/[0.08] shadow-[0_-10px_25px_rgba(0,0,0,0.2)] flex items-center justify-between gap-3 font-sans dir-rtl" dir="rtl">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[11px] font-black text-zinc-900 dark:text-white truncate">
            {watch("name") || (productId ? "تعديل بيانات المنتج" : "منتج جديد")}
          </span>
          <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold truncate">
            {saving ? "جاري الحفظ..." : "جاهز للنشر 🐺"}
          </span>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-[#FF274B] to-amber-500 text-white font-black text-xs rounded-xl shadow-md shadow-[#FF274B]/20 disabled:opacity-50 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          {saving ? "جاري الحفظ..." : productId ? "حفظ التعديلات" : "نشر المنتج 🐺"}
        </button>
      </div>
    </form>
  );
}
