"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Upload, Trash2, Palette, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/lib/firebase/firestore";
import { generateSlug, generateSKU } from "@/lib/utils";
import { productSchema, type ProductFormData } from "@/lib/validations/product.schema";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Product, SizeStock } from "@/types/product";

interface ProductFormProps {
  initialData?: Product;
  productId?: string;
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size", "38", "40", "42", "44"];

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Custom states for variant adding inputs
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  // Custom Size Input per Variant Index
  const [customSizeInputs, setCustomSizeInputs] = useState<Record<number, string>>({});

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
          sizeChartType: initialData.sizeChartType || "tshirt",
        }
      : {
          category: "all",
          brand: "DEEP STORE",
          variants: [],
          featured: false,
          bestSeller: false,
          price: 0,
          sku: generateSKU(),
          sizeChartType: "tshirt",
        },
  });

  const watchedMainImage = watch("mainImage");
  const watchedVariants = watch("variants") || [];
  const watchedSizeChartType = watch("sizeChartType") || "tshirt";

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue("name", name);
    if (!productId) {
      setValue("slug", generateSlug(name), { shouldValidate: true });
    }
  };

  // Upload main cover image to Cloudinary
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const loadingToast = toast.loading("Uploading primary image...");
    try {
      const url = await uploadToCloudinary(file);
      setValue("mainImage", url, { shouldValidate: true });
      toast.success("Primary image uploaded successfully", { id: loadingToast });
    } catch {
      toast.error("Failed to upload image", { id: loadingToast });
    }
  };

  // Upload color-specific variant image
  const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const loadingToast = toast.loading("Uploading color image...");
    try {
      const url = await uploadToCloudinary(file);
      const current = [...watchedVariants];
      current[index] = { ...current[index], image: url };
      setValue("variants", current, { shouldValidate: true });
      toast.success("Color image uploaded successfully", { id: loadingToast });
    } catch {
      toast.error("Failed to upload image", { id: loadingToast });
    }
  };

  // Add new color variant card
  const addColorVariant = () => {
    if (!newColorName.trim()) {
      toast.error("Please enter a color name");
      return;
    }

    if (watchedVariants.some((v) => v.colorHex.toLowerCase() === newColorHex.toLowerCase())) {
      toast.error("A variant with this color hex already exists");
      return;
    }

    const newVariant = {
      colorName: newColorName.trim(),
      colorHex: newColorHex,
      image: "",
      sizes: [
        { size: "S", stock: 10 },
        { size: "M", stock: 10 },
        { size: "L", stock: 10 },
        { size: "XL", stock: 10 },
      ],
    };

    setValue("variants", [...watchedVariants, newVariant], { shouldValidate: true });
    setNewColorName("");
  };

  const removeColorVariant = (index: number) => {
    const updated = watchedVariants.filter((_, idx) => idx !== index);
    setValue("variants", updated, { shouldValidate: true });
  };

  // Add a size to a color variant with default stock
  const addSizeToVariant = (variantIndex: number, size: string) => {
    const variant = watchedVariants[variantIndex];
    if (variant.sizes.some((s) => s.size.toLowerCase() === size.toLowerCase())) {
      toast.error(`Size "${size}" is already added to this color`);
      return;
    }

    const newSizeStock: SizeStock = { size: size.trim(), stock: 10 };
    const updatedSizes = [...variant.sizes, newSizeStock];
    
    const updatedVariants = [...watchedVariants];
    updatedVariants[variantIndex] = { ...variant, sizes: updatedSizes };
    
    setValue("variants", updatedVariants, { shouldValidate: true });
  };

  // Add Custom Size typed by user
  const handleAddCustomSize = (variantIndex: number) => {
    const raw = customSizeInputs[variantIndex] || "";
    const size = raw.trim();
    if (!size) {
      toast.error("Enter custom size name");
      return;
    }
    addSizeToVariant(variantIndex, size);
    setCustomSizeInputs((prev) => ({ ...prev, [variantIndex]: "" }));
  };

  // Remove a size from a color variant
  const removeSizeFromVariant = (variantIndex: number, sizeIndex: number) => {
    const variant = watchedVariants[variantIndex];
    const updatedSizes = variant.sizes.filter((_, idx) => idx !== sizeIndex);
    
    const updatedVariants = [...watchedVariants];
    updatedVariants[variantIndex] = { ...variant, sizes: updatedSizes };
    
    setValue("variants", updatedVariants, { shouldValidate: true });
  };

  // Update specific size stock input
  const updateSizeStock = (variantIndex: number, sizeIndex: number, stock: number) => {
    const updatedVariants = [...watchedVariants];
    const variant = updatedVariants[variantIndex];
    const sizes = [...variant.sizes];
    
    sizes[sizeIndex] = { ...sizes[sizeIndex], stock: Math.max(0, stock) };
    updatedVariants[variantIndex] = { ...variant, sizes };
    
    setValue("variants", updatedVariants, { shouldValidate: true });
  };

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      if (productId) {
        await updateProduct(productId, data);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(data);
        toast.success("Product created successfully!");
      }
      router.push("/admin/products");
    } catch {
      toast.error("Failed to save product. Please check all variant inputs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-4xl font-sans">
      
      {/* 1. Basic Info Panel */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        <h2 className="font-black text-xs text-zinc-900 uppercase tracking-widest mb-6">معلومات المنتج الأساسية</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              اسم المنتج
            </label>
            <input
              className="w-full px-4 py-3 border border-zinc-100 rounded-xl text-xs bg-white focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-200/50 transition-all font-semibold text-zinc-800 placeholder:text-zinc-400"
              placeholder="مثال: هودي مينيمال"
              {...register("name")}
              onChange={handleNameChange}
            />
            {errors.name && (
              <p className="text-red-500 text-[10px] font-bold mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Slug (رابط المنتج)
            </label>
            <input
              className="w-full px-4 py-3 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-200/50 transition-all font-mono font-semibold text-zinc-600"
              placeholder="minimalist-hoodie"
              readOnly
              {...register("slug")}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              كود المنتج (SKU)
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-3 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-200/50 transition-all font-mono font-black text-zinc-800 uppercase"
                placeholder="DEEP-XXXX"
                {...register("sku")}
              />
              {!productId && (
                <button
                  type="button"
                  onClick={() => setValue("sku", generateSKU())}
                  className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-[10px] font-bold text-zinc-600 transition-all whitespace-nowrap"
                  title="توليد كود جديد"
                >
                  🔄 جديد
                </button>
              )}
            </div>
            {errors.sku && (
              <p className="text-red-500 text-[10px] font-bold mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.sku.message}
              </p>
            )}
            <p className="text-[9px] text-zinc-400 mt-1">الكود يظهر في رابط المنتج — لا يمكن تكراره</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              الوصف
            </label>
            <textarea
              className="w-full px-4 py-3 border border-zinc-100 rounded-xl text-xs bg-white focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-200/50 transition-all font-medium text-zinc-800 placeholder:text-zinc-400 resize-none"
              rows={4}
              placeholder="وصف القماش، المقاس، التصميم، تعليمات الغسيل..."
              {...register("description")}
            />
          </div>
        </div>
      </div>


      {/* 2. Cover / Main Image Card */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        <h2 className="font-black text-xs text-zinc-900 uppercase tracking-widest mb-2">Main Catalog Image</h2>
        <p className="text-[10px] text-zinc-400 font-medium mb-6">
          Primary cover image shown on the product card inside the shop listing.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden p-2 relative">
            {watchedMainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={watchedMainImage} alt="Main Preview" className="object-contain w-full h-full" />
            ) : (
              <span className="text-[10px] text-zinc-300 font-black">DEEP COVER</span>
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <label className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] hover:bg-zinc-800 transition-all cursor-pointer shadow-md shadow-zinc-900/10">
              <Upload size={12} />
              Upload Card Cover
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleMainImageUpload}
              />
            </label>
            <p className="text-[9px] text-zinc-400 font-mono leading-none truncate max-w-md">
              {watchedMainImage || "No cover image uploaded yet"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Pricing */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        <h2 className="font-black text-xs text-zinc-900 uppercase tracking-widest mb-6">PRICING (السعر)</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Price (EGP) — السعر الأساسي
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-zinc-100 rounded-xl text-xs bg-white focus:outline-none focus:border-zinc-300 transition-all font-semibold text-zinc-800 placeholder:text-zinc-400"
              placeholder="e.g. 1200"
              {...register("price", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Sale Price (EGP) — سعر الخصم (اختياري)
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-zinc-100 rounded-xl text-xs bg-white focus:outline-none focus:border-zinc-300 transition-all font-semibold text-zinc-800 placeholder:text-zinc-400"
              placeholder="e.g. 950"
              {...register("salePrice", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      {/* 3.5 Size Chart Selection Panel */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-4">
        <div>
          <h2 className="font-black text-xs text-zinc-900 uppercase tracking-widest">جدول المقاسات (SIZE CHART GUIDE)</h2>
          <p className="text-[10px] text-zinc-400 font-medium mt-1">اختر صورة جدول المقاسات المناسبة للمنتج ليتم عرضها للعميل في صفحة الشراء</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              watchedSizeChartType === "tshirt"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-lg"
                : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 text-zinc-800"
            }`}
          >
            <input
              type="radio"
              value="tshirt"
              {...register("sizeChartType")}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-300/30 flex-shrink-0 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/size-chart-tshirt.png" alt="T-Shirts Size Chart" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-black">👕 جدول مقاسات التيشرتات (T-Shirts)</p>
              <p className={`text-[10px] ${watchedSizeChartType === "tshirt" ? "text-zinc-300" : "text-zinc-400"}`}>
                Oversize & Box Fit T-Shirts
              </p>
            </div>
          </label>

          <label
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              watchedSizeChartType === "pants"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-lg"
                : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 text-zinc-800"
            }`}
          >
            <input
              type="radio"
              value="pants"
              {...register("sizeChartType")}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-300/30 flex-shrink-0 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/size-chart-pants.png" alt="Pants Size Chart" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-black">👖 جدول مقاسات البناطيل (Pants)</p>
              <p className={`text-[10px] ${watchedSizeChartType === "pants" ? "text-zinc-300" : "text-zinc-400"}`}>
                Length & Waist Chart
              </p>
            </div>
          </label>
        </div>

        {/* Live Size Chart Preview */}
        <div className="border border-zinc-100 rounded-xl p-3 bg-zinc-50 flex flex-col items-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">معاينة جدول المقاسات المختار للمنتج:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={watchedSizeChartType === "pants" ? "/size-chart-pants.png" : "/size-chart-tshirt.png"}
            alt="Selected Size Chart"
            className="max-h-56 object-contain rounded-lg border border-zinc-200 shadow-sm"
          />
        </div>
      </div>

      {/* 4. Variants & Stock */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black text-xs text-zinc-900 uppercase tracking-widest">Color Variants & Stock</h2>
            <p className="text-[10px] text-zinc-400 font-medium mt-1">
              Add colors and customize sizes for each color variant.
            </p>
          </div>
        </div>

        {/* Add Color Creator */}
        <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl mb-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-9 h-9 rounded-xl border-none cursor-pointer bg-transparent"
            />
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">{newColorHex}</span>
          </div>

          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Color name (e.g. Black, Navy, Off-White)"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColorVariant())}
              className="w-full px-4 py-2.5 border border-zinc-100 rounded-xl text-xs bg-white focus:outline-none focus:border-zinc-300 transition-all font-semibold text-zinc-800 placeholder:text-zinc-400"
            />
          </div>

          <button
            type="button"
            onClick={addColorVariant}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-md shadow-zinc-900/10"
          >
            <Plus size={12} />
            Add Variant
          </button>
        </div>

        {/* Variant Cards List */}
        <div className="space-y-6">
          {watchedVariants.map((variant, variantIdx) => (
            <div 
              key={variant.colorHex}
              className="border border-zinc-100 rounded-2xl p-5 space-y-4 hover:border-zinc-300 transition-all duration-300 bg-white"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-zinc-50 pb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-zinc-200" 
                    style={{ backgroundColor: variant.colorHex }}
                  />
                  <span className="text-xs font-black text-zinc-900">{variant.colorName}</span>
                  <span className="text-[9px] text-zinc-400 font-mono">({variant.colorHex})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeColorVariant(variantIdx)}
                  className="text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* Variant Image upload */}
                <div className="md:col-span-4 flex flex-col items-center justify-center border border-dashed border-zinc-100 rounded-2xl p-4 bg-zinc-50/50">
                  <div className="w-24 h-24 rounded-xl bg-white border border-zinc-100 flex items-center justify-center overflow-hidden p-1 relative mb-3">
                    {variant.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={variant.image} alt="Color Preview" className="object-contain w-full h-full" />
                    ) : (
                      <Palette size={18} className="text-zinc-300" />
                    )}
                  </div>
                  
                  <label className="inline-flex items-center gap-1.5 bg-white text-zinc-700 border border-zinc-200 px-3.5 py-2 rounded-lg font-bold text-[10px] hover:bg-zinc-50 transition-all cursor-pointer">
                    <Upload size={10} />
                    Upload Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleVariantImageUpload(variantIdx, e)}
                    />
                  </label>
                </div>

                {/* Variant Sizes & Fulfillment Stock */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      FULFILLMENT STOCK LEVELS
                    </span>
                    
                    {/* Quick Add size tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {AVAILABLE_SIZES.map((size) => {
                        const isAdded = variant.sizes.some((s) => s.size.toLowerCase() === size.toLowerCase());
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => addSizeToVariant(variantIdx, size)}
                            disabled={isAdded}
                            className={`px-2.5 py-1 rounded text-[9px] font-bold border transition-all ${
                              isAdded
                                ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-950"
                            }`}
                          >
                            + {size}
                          </button>
                        );
                      })}
                    </div>

                    {/* CUSTOM SIZE INPUT BOX (إضافة مقاس مخصص بكتابتك) */}
                    <div className="flex items-center gap-2 mb-4 p-2 bg-zinc-50 border border-zinc-100 rounded-xl">
                      <input
                        type="text"
                        placeholder="إضافة مقاس مخصص بيدك (مثال: 38, 40, 3XL, Oversized...)"
                        value={customSizeInputs[variantIdx] || ""}
                        onChange={(e) => setCustomSizeInputs((prev) => ({ ...prev, [variantIdx]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomSize(variantIdx);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-900 bg-white focus:outline-none focus:border-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomSize(variantIdx)}
                        className="px-3.5 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
                      >
                        + إضافة مقاس
                      </button>
                    </div>
                    
                    {/* Size and stock inputs list */}
                    {variant.sizes.length === 0 ? (
                      <p className="text-[10px] text-zinc-400 font-medium italic py-2">
                        No sizes configured. Add sizes using the buttons above.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        {variant.sizes.map((sizeStock, sizeIdx) => (
                          <div 
                            key={sizeStock.size}
                            className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-1.5"
                          >
                            <span className="text-[10px] font-black text-zinc-800 min-w-[32px]">{sizeStock.size}</span>
                            <div className="flex-1 flex items-center gap-1 bg-white border border-zinc-100 rounded-lg px-2 py-0.5">
                              <span className="text-[8px] font-bold text-zinc-400 uppercase">Stock</span>
                              <input 
                                type="number"
                                value={sizeStock.stock}
                                onChange={(e) => updateSizeStock(variantIdx, sizeIdx, parseInt(e.target.value) || 0)}
                                className="w-full text-xs font-bold text-zinc-900 border-none outline-none focus:ring-0 p-0 text-right"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSizeFromVariant(variantIdx, sizeIdx)}
                              className="text-zinc-400 hover:text-red-500 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-5 py-3 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition-all shadow-md shadow-zinc-900/10 disabled:opacity-50"
        >
          {saving ? "Saving..." : productId ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
