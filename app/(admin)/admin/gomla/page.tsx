"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  FolderTree,
  Sliders,
  Phone,
  Save,
  Check,
  X,
  Layers,
  Sparkles,
  DollarSign,
  Tag,
  Eye,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  getGomlaCategories,
  createGomlaCategory,
  updateGomlaCategory,
  deleteGomlaCategory,
  getGomlaProducts,
  createGomlaProduct,
  updateGomlaProduct,
  deleteGomlaProduct,
  getSiteSettings,
  updateSiteSettings,
  type SiteSettings,
} from "@/lib/firebase/firestore";
import type { GomlaCategory, GomlaProduct, GomlaPriceTier } from "@/types/gomla";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Spinner } from "@/components/ui/Spinner";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { generateSlug } from "@/lib/utils";

type TabType = "products" | "categories" | "settings";

export default function AdminGomlaPage() {
  const [activeTab, setActiveTab] = useState<TabType>("products");
  const [loading, setLoading] = useState(true);

  // Site Settings state
  const [settings, setSettings] = useState<SiteSettings>({
    gomlaEnabled: true,
    gomlaWhatsappNumber: "",
    gomlaIntroText: "قسم مبيعات الجملة والكميات — أسعار خاصة بالتجار والمحلات 📦⚡",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Gomla Categories State
  const [categories, setCategories] = useState<GomlaCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatNameAr, setNewCatNameAr] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  // Gomla Products State
  const [products, setProducts] = useState<GomlaProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");

  // Product Form Modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodMainImage, setProdMainImage] = useState("");
  const [prodGalleryImages, setProdGalleryImages] = useState<string[]>([]);
  const [prodDescription, setProdDescription] = useState("");
  const [prodMinQuantity, setProdMinQuantity] = useState<number>(12);
  const [prodInStock, setProdInStock] = useState(true);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [priceTiers, setPriceTiers] = useState<GomlaPriceTier[]>([
    { minQuantity: 12, maxQuantity: 49, pricePerUnit: 150, note: "درستة 12 قطعة" },
    { minQuantity: 50, pricePerUnit: 130, note: "كميات محلات (50+ قطعة)" },
  ]);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [siteData, catsData, prodsData] = await Promise.all([
        getSiteSettings(),
        getGomlaCategories(),
        getGomlaProducts(),
      ]);

      if (siteData) {
        setSettings((prev) => ({
          ...prev,
          ...siteData,
          gomlaEnabled: siteData.gomlaEnabled ?? true,
          gomlaWhatsappNumber: siteData.gomlaWhatsappNumber || siteData.whatsappNumber || "",
          gomlaIntroText: siteData.gomlaIntroText || "قسم مبيعات الجملة والكميات — أسعار خاصة بالتجار والمحلات 📦⚡",
        }));
      }

      setCategories(catsData);
      setProducts(prodsData);
    } catch (err) {
      console.error("Failed to load gomla data:", err);
      toast.error("حدث خطأ أثناء تحميل بيانات الجملة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── Settings Handler ───
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSiteSettings({
        gomlaEnabled: settings.gomlaEnabled,
        gomlaWhatsappNumber: settings.gomlaWhatsappNumber?.trim(),
        gomlaIntroText: settings.gomlaIntroText?.trim(),
      });
      toast.success("تم حفظ إعدادات الجملة ورقم الواتساب بنجاح 📦⚡");
    } catch (err) {
      console.error("Failed to update gomla settings:", err);
      toast.error("فشل حفظ إعدادات الجملة");
    } finally {
      setSavingSettings(false);
    }
  };

  // ─── Category Handlers ───
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr.trim()) {
      toast.error("يرجى كتابة اسم قسم الجملة بالعربي");
      return;
    }

    setAddingCat(true);
    try {
      const enName = newCatName.trim() || newCatNameAr.trim();
      await createGomlaCategory({
        name: enName,
        nameAr: newCatNameAr.trim(),
        slug: generateSlug(enName),
        description: newCatDesc.trim() || undefined,
        image: newCatImage || undefined,
        order: categories.length,
      });

      toast.success("تمت إضافة قسم الجملة بنجاح 📦");
      setNewCatName("");
      setNewCatNameAr("");
      setNewCatDesc("");
      setNewCatImage("");
      const updatedCats = await getGomlaCategories();
      setCategories(updatedCats);
    } catch (err) {
      console.error("Failed to add category:", err);
      toast.error("فشل إضافة قسم الجملة");
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`هل أنت تأكد من حذف قسم الجملة "${name}"؟`)) return;
    try {
      await deleteGomlaCategory(id);
      toast.success("تم حذف قسم الجملة بنجاح");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete category:", err);
      toast.error("فشل حذف قسم الجملة");
    }
  };

  // ─── Product Form Handlers ───
  const openNewProductModal = () => {
    setEditingProductId(null);
    setProdName("");
    setProdCategoryId(categories[0]?.id || "");
    setProdMainImage("");
    setProdGalleryImages([]);
    setProdDescription("");
    setProdMinQuantity(12);
    setProdInStock(true);
    setProdFeatured(false);
    setPriceTiers([
      { minQuantity: 12, maxQuantity: 49, pricePerUnit: 150, note: "درستة 12 قطعة" },
      { minQuantity: 50, pricePerUnit: 130, note: "كميات كبيرة (50+ قطعة)" },
    ]);
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: GomlaProduct) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdCategoryId(prod.categoryId);
    setProdMainImage(prod.mainImage);
    setProdGalleryImages(prod.images || []);
    setProdDescription(prod.description || "");
    setProdMinQuantity(prod.minOrderQuantity || 12);
    setProdInStock(prod.inStock ?? true);
    setProdFeatured(prod.featured ?? false);
    setPriceTiers(prod.priceTiers || []);
    setShowProductModal(true);
  };

  const handleAddTier = () => {
    const lastTier = priceTiers[priceTiers.length - 1];
    const newMin = lastTier ? (lastTier.maxQuantity ? lastTier.maxQuantity + 1 : lastTier.minQuantity + 20) : 12;
    setPriceTiers([
      ...priceTiers,
      { minQuantity: newMin, pricePerUnit: 100, note: `كمية أكبر (${newMin}+ قطعة)` },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (priceTiers.length <= 1) {
      toast.error("يجب إضافة شريحة سعر واحدة على الأقل للمنتج الجملة");
      return;
    }
    setPriceTiers(priceTiers.filter((_, i) => i !== index));
  };

  const handleUpdateTier = (index: number, field: keyof GomlaPriceTier, value: any) => {
    const updated = [...priceTiers];
    updated[index] = { ...updated[index], [field]: value };
    setPriceTiers(updated);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      toast.error("يرجى إدخال اسم منتج الجملة");
      return;
    }
    if (!prodCategoryId) {
      toast.error("يرجى اختيار قسم الجملة التابع له المنتج");
      return;
    }
    if (!prodMainImage) {
      toast.error("يرجى رفع الصورة الرئيسية للمنتج الجملة");
      return;
    }
    if (priceTiers.length === 0) {
      toast.error("يرجى تحديد شريحة أسعار واحدة على الأقل حسب الكمية");
      return;
    }

    setSubmittingProduct(true);
    const categoryObj = categories.find((c) => c.id === prodCategoryId);
    const categoryName = categoryObj?.nameAr || categoryObj?.name || "عام";

    try {
      const productPayload = {
        name: prodName.trim(),
        slug: generateSlug(prodName.trim()),
        categoryId: prodCategoryId,
        categoryName,
        mainImage: prodMainImage,
        images: prodGalleryImages,
        description: prodDescription.trim(),
        priceTiers,
        minOrderQuantity: Number(prodMinQuantity) || 12,
        inStock: prodInStock,
        featured: prodFeatured,
      };

      if (editingProductId) {
        await updateGomlaProduct(editingProductId, productPayload);
        toast.success("تم تحديث بيانات منتج الجملة بنجاح ⚡");
      } else {
        await createGomlaProduct(productPayload);
        toast.success("تمت إضافة منتج الجملة الجديد بنجاح 📦");
      }

      setShowProductModal(false);
      const updatedProds = await getGomlaProducts();
      setProducts(updatedProds);
    } catch (err) {
      console.error("Failed to save product:", err);
      toast.error("فشل حفظ منتج الجملة");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`هل أنت تأكد من حذف منتج الجملة "${name}"؟`)) return;
    try {
      await deleteGomlaProduct(id);
      toast.success("تم حذف منتج الجملة بنجاح");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("فشل حذف منتج الجملة");
    }
  };

  const filteredProducts =
    selectedCatFilter === "all"
      ? products
      : products.filter((p) => p.categoryId === selectedCatFilter);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#FF274B] space-y-3">
        <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">جاري تحميل نظام الجملة والمبيعات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto pb-16 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF274B] mb-1">
            <Package size={18} />
            لوحة إدارة مبيعات الجملة والكميات (Gomla Wholesale Hub)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            منتجات، أقسام، وإعدادات الواتساب للتجار
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            أضف منتجات الجملة وحدد الأسعار حسب الكميات واربط طلب العميل مباشرة برقم الواتساب الخاص بك.
          </p>
        </div>

        <button
          onClick={openNewProductModal}
          className="flex items-center gap-2 px-5 py-3 bg-[#FF274B] hover:bg-[#FF274B]/90 text-white font-black text-xs rounded-2xl shadow-lg shadow-[#FF274B]/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>إضافة منتج جملة جديد 📦</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 bg-white dark:bg-[#0E0E10] p-2 rounded-2xl border border-zinc-200 dark:border-white/[0.06] shadow-sm">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "products"
              ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
          }`}
        >
          <Package size={16} />
          <span>قائمة منتجات الجملة ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "categories"
              ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
          }`}
        >
          <FolderTree size={16} />
          <span>أقسام وفئات الجملة ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
          }`}
        >
          <Sliders size={16} />
          <span>إعدادات الواتساب وتفعيل القسم</span>
        </button>
      </div>

      {/* ─── TAB 1: PRODUCTS LIST ─── */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCatFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCatFilter === "all"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.06]"
              }`}
            >
              كل أقسام الجملة ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCatFilter === cat.id
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.06]"
                }`}
              >
                {cat.nameAr || cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-12 text-center space-y-4">
              <Package size={48} className="mx-auto text-zinc-400" />
              <h3 className="text-base font-bold">لا توجد منتجات جملة مضافة بعد</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                قم بإضافة منتج جملة جديد وتحديد شرائح الأسعار لتمكين العملاء والتجار من الطلب مباشرة عبر الواتساب.
              </p>
              <button
                onClick={openNewProductModal}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF274B] text-white text-xs font-bold rounded-xl shadow-md"
              >
                <Plus size={16} />
                إضافة أول منتج جملة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-[#0E0E10] border border-zinc-200 dark:border-white/[0.06] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[10px] font-bold px-3 py-1 rounded-full">
                        {prod.categoryName}
                      </span>
                      {prod.featured && (
                        <span className="absolute top-3 left-3 bg-[#FF274B] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Sparkles size={12} /> مميز
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white line-clamp-1">
                          {prod.name}
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                          {prod.description || "بدون وصف تفصيلي"}
                        </p>
                      </div>

                      {/* Tiers Pricing Table Preview */}
                      <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-white/[0.06]">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          شرائح الأسعار حسب الكمية:
                        </span>
                        <div className="space-y-1">
                          {prod.priceTiers?.map((tier, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-white/[0.04]"
                            >
                              <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                {tier.maxQuantity
                                  ? `${tier.minQuantity} - ${tier.maxQuantity} قطعة`
                                  : `${tier.minQuantity}+ قطعة`}
                                {tier.note ? ` (${tier.note})` : ""}
                              </span>
                              <span className="font-black text-[#FF274B]">
                                {tier.pricePerUnit} ج.م / قطعة
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        prod.inStock
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                      }`}
                    >
                      {prod.inStock ? "متوفر بالجملة" : "نفذت الكمية"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditProductModal(prod)}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-white/[0.08] hover:border-[#FF274B] transition-colors cursor-pointer"
                        title="تعديل المنتج"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-red-500 border border-zinc-200 dark:border-white/[0.08] hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="حذف المنتج"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: CATEGORIES CMS ─── */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Category Form */}
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 space-y-4">
            <h2 className="font-black text-sm text-[#FF274B] uppercase tracking-wider flex items-center gap-2">
              <FolderTree size={16} />
              إضافة قسم جملة جديد
            </h2>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  اسم القسم بالعربي *
                </label>
                <input
                  type="text"
                  placeholder="مثال: قسم هوديز جملة"
                  value={newCatNameAr}
                  onChange={(e) => setNewCatNameAr(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF274B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  الاسم بالإنجليزية (للرابط Slug)
                </label>
                <input
                  type="text"
                  placeholder="مثال: Wholesale Hoodies"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF274B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  وصف مختصر للقسم
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: تشكيلة هوديز وسويت شيرتات خامات ميلتون فاخرة للجملة"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF274B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  صورة غلاف القسم (اختياري)
                </label>
                <ImageUploader
                  multiple={false}
                  images={newCatImage ? [newCatImage] : []}
                  onChange={(imgs) => setNewCatImage(imgs[0] || "")}
                />
              </div>

              <button
                type="submit"
                disabled={addingCat}
                className="w-full py-3 bg-[#FF274B] text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-[#FF274B]/90 transition-all cursor-pointer disabled:opacity-50"
              >
                {addingCat ? "جاري الإضافة..." : "حفظ وسجل قسم الجملة 📦"}
              </button>
            </form>
          </div>

          {/* Existing Categories List */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 space-y-4">
            <h2 className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
              أقسام الجملة المتاحة حالياً ({categories.length})
            </h2>

            {categories.length === 0 ? (
              <p className="text-xs text-zinc-400 py-8 text-center">لم يتم إضافة أقسام جملة بعد.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {cat.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cat.image}
                          alt={cat.nameAr}
                          className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-white/[0.08]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#FF274B]/10 text-[#FF274B] flex items-center justify-center font-bold">
                          <FolderTree size={20} />
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white">
                          {cat.nameAr || cat.name}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{cat.slug}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.nameAr || cat.name)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="حذف هذا القسم"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: SETTINGS & WHATSAPP CMS ─── */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
            <div className="flex items-center gap-2">
              <Sliders size={20} className="text-[#FF274B]" />
              <h2 className="font-black text-base text-zinc-900 dark:text-white">
                إعدادات قسم الجملة ورقم الواتساب الخاص بالطلبات
              </h2>
            </div>
            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full">
              تكامل وتفعيل فوري
            </span>
          </div>

          {/* Toggle Enable Gomla */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                تفعيل قسم الجملة على المتجر للعملاء
                {settings.gomlaEnabled ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">مُفعل حالياً</span>
                ) : (
                  <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">معطل حالياً</span>
                )}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                عند الإيقاف، سيتم إخفاء رابط وقسم الجملة من الهيدر وتوجيه أي زائر لصفحة المتجر الرئيسية.
              </p>
            </div>
            <ToggleSwitch
              checked={!!settings.gomlaEnabled}
              onChange={(val) => setSettings({ ...settings, gomlaEnabled: val })}
              size="md"
            />
          </div>

          {/* Gomla WhatsApp Number */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              رقم واتساب المبيعات المخصص لطلبات الجملة (WhatsApp Number) *
            </label>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
              <input
                type="text"
                placeholder="مثال: 201012345678 (مع كود الدولة وبدون علامة +)"
                value={settings.gomlaWhatsappNumber || ""}
                onChange={(e) => setSettings({ ...settings, gomlaWhatsappNumber: e.target.value })}
                className="w-full pr-11 pl-4 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[#FF274B]"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5">
              عندما يضغط العميل على زر "اطلب جملة عبر الواتساب"، سيفتح تطبيق الواتساب مباشرة للدردشة مع هذا الرقم المكتوب.
            </p>
          </div>

          {/* Intro Text / Banner Copy */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              النص الترحيبي والعنوان الرئيسي لصفحة الجملة
            </label>
            <input
              type="text"
              placeholder="قسم مبيعات الجملة والكميات — أسعار خاصة بالتجار والمحلات 📦⚡"
              value={settings.gomlaIntroText || ""}
              onChange={(e) => setSettings({ ...settings, gomlaIntroText: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B]"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-zinc-200 dark:border-white/[0.06] flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="flex items-center gap-2 px-8 py-3 bg-[#FF274B] hover:bg-[#FF274B]/90 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>{savingSettings ? "جاري الحفظ..." : "حفظ إعدادات ورقم الواتساب ⚡"}</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── ADD / EDIT PRODUCT MODAL ─── */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white dark:bg-[#0E0E10] border border-zinc-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 my-8 shadow-2xl space-y-6 dir-rtl text-right"
              dir="rtl"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowProductModal(false)}
                className="absolute top-6 left-6 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-100 dark:bg-zinc-900 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <Package className="text-[#FF274B]" size={24} />
                  {editingProductId ? "تعديل بيانات منتج الجملة" : "إضافة منتج جملة جديد 📦"}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  أدخل اسم المنتج، اختر القسم، وارفع الصور، ثم أضف شرائح الأسعار المتغيرة حسب الكميات.
                </p>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      اسم منتج الجملة *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: هودي أوفرسايز ميلتون فاخر (جملة)"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF274B]"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      قسم الجملة التابع له *
                    </label>
                    <select
                      value={prodCategoryId}
                      onChange={(e) => setProdCategoryId(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF274B]"
                    >
                      <option value="">اختر القسم...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameAr || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main Image Uploader */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    الصورة الرئيسية للمنتج الجملة *
                  </label>
                  <ImageUploader
                    multiple={false}
                    images={prodMainImage ? [prodMainImage] : []}
                    onChange={(imgs) => setProdMainImage(imgs[0] || "")}
                  />
                </div>

                {/* Secondary Gallery Images */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    صور المعرض الإضافية (اختياري)
                  </label>
                  <ImageUploader
                    multiple={true}
                    images={prodGalleryImages}
                    onChange={setProdGalleryImages}
                  />
                </div>

                {/* Description / Fabric details */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    الوصف وتفاصيل الخامة والدرستات
                  </label>
                  <textarea
                    rows={3}
                    placeholder="تفاصيل الخامة (قطن 100%)، الألوان المتاحة بالدرستة، المقاسات M-L-XL-XXL..."
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF274B]"
                  />
                </div>

                {/* Dynamic Price Tiers Builder */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-3">
                    <div>
                      <h3 className="text-xs font-black text-[#FF274B] flex items-center gap-1.5">
                        <DollarSign size={16} />
                        جدول الأسعار حسب الكميات (Quantity Pricing Tiers)
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        حدد سعر القطعة بالجنيه لكل شريحة كمية (مثال: من 12 إلى 49 قطعة بسعر 150ج).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddTier}
                      className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={14} />
                      إضافة شريحة
                    </button>
                  </div>

                  <div className="space-y-3">
                    {priceTiers.map((tier, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl items-center"
                      >
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 mb-1">الحد الأدنى (قطعة)</label>
                          <input
                            type="number"
                            value={tier.minQuantity}
                            onChange={(e) => handleUpdateTier(idx, "minQuantity", Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 mb-1">الحد الأقصى (اختياري)</label>
                          <input
                            type="number"
                            placeholder="بدون حد أقصى"
                            value={tier.maxQuantity ?? ""}
                            onChange={(e) =>
                              handleUpdateTier(
                                idx,
                                "maxQuantity",
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 mb-1">سعر القطعة (ج.م)</label>
                          <input
                            type="number"
                            value={tier.pricePerUnit}
                            onChange={(e) => handleUpdateTier(idx, "pricePerUnit", Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs font-bold text-[#FF274B]"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-4 sm:pt-0">
                          <input
                            type="text"
                            placeholder="ملاحظة (مثل: درستة)"
                            value={tier.note || ""}
                            onChange={(e) => handleUpdateTier(idx, "note", e.target.value)}
                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-lg text-[11px] font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="p-2 text-zinc-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-bold">المنتج متوفر للجملة حالياً</span>
                    <ToggleSwitch checked={prodInStock} onChange={setProdInStock} size="sm" />
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-bold">تميز المنتج بأعلى الصفحة 🔥</span>
                    <ToggleSwitch checked={prodFeatured} onChange={setProdFeatured} size="sm" />
                  </div>
                </div>

                {/* Submit Modal */}
                <div className="pt-4 border-t border-zinc-200 dark:border-white/[0.06] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.08] text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="px-8 py-2.5 bg-[#FF274B] text-white font-extrabold text-xs rounded-xl shadow-lg hover:bg-[#FF274B]/90 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingProduct ? "جاري الحفظ..." : "حفظ منتج الجملة 📦"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
