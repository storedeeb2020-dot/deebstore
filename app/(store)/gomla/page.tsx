"use client";

import { useState, useEffect } from "react";
import {
  Package,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Search,
  Info,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getGomlaProducts,
  getGomlaCategories,
  subscribeToSiteSettings,
  type SiteSettings,
} from "@/lib/firebase/firestore";
import type { GomlaProduct, GomlaCategory, GomlaPriceTier } from "@/types/gomla";
import { Spinner } from "@/components/ui/Spinner";
import Link from "next/link";

export default function StoreGomlaPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<GomlaProduct[]>([]);
  const [categories, setCategories] = useState<GomlaCategory[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Filters & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State for Selected Product Detail & Order Calculation
  const [selectedProduct, setSelectedProduct] = useState<GomlaProduct | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [orderQuantity, setOrderQuantity] = useState<number>(12);

  useEffect(() => {
    const unsub = subscribeToSiteSettings((data) => {
      if (data) setSettings(data);
    });

    Promise.all([getGomlaProducts(), getGomlaCategories()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => unsub();
  }, []);

  // Sync min order quantity when product modal opens
  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIndex(0);
      setOrderQuantity(selectedProduct.minOrderQuantity || 12);
    }
  }, [selectedProduct]);

  // Helper to determine applicable tier for a given quantity
  const getApplicableTier = (prod: GomlaProduct, qty: number): GomlaPriceTier => {
    if (!prod.priceTiers || prod.priceTiers.length === 0) {
      return { minQuantity: 1 };
    }
    const sorted = [...prod.priceTiers].sort((a, b) => b.minQuantity - a.minQuantity);
    const matched = sorted.find((t) => qty >= t.minQuantity);
    return matched || sorted[sorted.length - 1];
  };

  const handleOpenWhatsAppOrder = (prod: GomlaProduct, qty: number) => {
    const whatsappNum = (settings?.gomlaWhatsappNumber || settings?.whatsappNumber || "201012345678").replace(/\D/g, "");
    const tier = getApplicableTier(prod, qty);
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    const textMessage = `السلام عليكم ورحمة الله وبركاته، أرغب في الاستفسار عن أسعار وطلب جملة من متجر ديب ستور DEEB STORE 📦⚡

📦 اسم المنتج: ${prod.name}
🏷️ القسم: ${prod.categoryName || "قسم الجملة"}
🔢 الكمية المطلوبة: ${qty} قطعة ${tier.note ? `(${tier.note})` : ""}

يرجى إرسال تفاصيل السعر والخصم المتاح لهذه الكمية.
رابط المنتج: ${pageUrl}`;

    const encodedText = encodeURIComponent(textMessage);
    const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  // Filter products by category and search
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === "all" || prod.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen py-24 flex flex-col items-center justify-center text-[#FF274B] space-y-4">
        <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          جاري تحميل قسم مبيعات الجملة والكميات...
        </p>
      </div>
    );
  }

  // If gomla is explicitly disabled in settings
  if (settings && settings.gomlaEnabled === false) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <Package size={64} className="text-zinc-400" />
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
          قسم الجملة غير متاح حالياً
        </h1>
        <p className="text-xs text-zinc-500 max-w-md">
          قسم الجملة والتجار متوقف مؤقتاً للتحديث. يمكنكم تصفح تشكيلة متجرنا الرئيسية بالأسعار القطاعية.
        </p>
        <Link
          href="/#products"
          className="px-6 py-3 bg-[#FF274B] text-white font-bold text-xs rounded-xl shadow-lg hover:bg-[#FF274B]/90 transition-all"
        >
          الانتقال للمتجر الرئيسي ←
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-sans dir-rtl pb-24" dir="rtl">
      {/* ─── HERO HEADER BANNER ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-white py-16 sm:py-24 border-b border-zinc-800">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF274B]/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 border border-white/10 text-amber-400 text-xs font-bold backdrop-blur-md"
          >
            <Sparkles size={14} />
            <span>الأسعار والتفاصيل عبر الواتساب للتجار والمحلات 📦💬</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight"
          >
            {settings?.gomlaIntroText || "قسم مبيعات الجملة والكميات — الأسعار عبر الواتساب للتجار والمحلات 📦⚡"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-zinc-300 max-w-2xl mx-auto leading-relaxed"
          >
            اختر منتجات الجملة المناسبة لتجارتك، حدد الكميات المطلوبة، واطلب معرفة السعر والخصم المتاح فوراً عبر محادثة الواتساب المباشرة مع إدارة المتجر.
          </motion.p>

          {/* Key Advantages */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-right">
            {[
              { title: "أسعار عبر الواتساب", desc: "خصومات خاصة وفورية بحجم الكمية" },
              { title: "خامات الستريت وير", desc: "أجود أقمشة قطنية وميلتون" },
              { title: "طلب مباشر بالواتساب", desc: "تواصل شخصي وسريع مع الأدمن" },
              { title: "شحن لكافة المحافظات", desc: "توصيل آمن لجميع المحافظات" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <CheckCircle2 size={14} />
                  <span>{item.title}</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FILTERS & PRODUCTS MAIN SECTION ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8">
        {/* Search & Category Filter Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-[#0E0E10] p-4 rounded-3xl border border-zinc-200 dark:border-white/[0.06] shadow-sm">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              كل أقسام الجملة ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {cat.nameAr || cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="ابحث عن منتج جملة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-2xl text-xs font-bold focus:outline-none focus:border-[#FF274B]"
            />
          </div>
        </div>

        {/* ─── PRODUCTS GRID ─── */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-8">
            <Package size={56} className="mx-auto text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
              لا توجد منتجات جملة ضمن هذا القسم حالياً
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              تصفح باقي الأقسام أو تواصل مع إدارة المتجر عبر الواتساب للاستفسار عن المنتجات والكميات المتاحة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((prod) => {
              return (
                <motion.div
                  key={prod.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-[#0E0E10] border border-zinc-200 dark:border-white/[0.06] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Box */}
                    <div
                      onClick={() => setSelectedProduct(prod)}
                      className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[10px] font-bold px-3 py-1 rounded-full">
                        {prod.categoryName}
                      </span>

                      {/* WhatsApp Only Pricing Badge */}
                      <span className="absolute bottom-3 left-3 bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                        <MessageCircle size={14} /> السعر عبر الواتساب
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="p-6 space-y-4">
                      <div onClick={() => setSelectedProduct(prod)} className="cursor-pointer">
                        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white group-hover:text-[#FF274B] transition-colors line-clamp-1">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {prod.description || "خامات الستريت وير الممتازة جاهزة للطلب بالجملة."}
                        </p>
                      </div>

                      {/* Pricing Tiers Overview */}
                      <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-white/[0.06]">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                          <span>شرائح الكميات المتاحة:</span>
                          <span className="text-amber-500">أقل طلب {prod.minOrderQuantity || 12} قطعة</span>
                        </div>
                        <div className="space-y-1">
                          {prod.priceTiers?.slice(0, 3).map((tier, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2 rounded-xl border border-zinc-100 dark:border-white/[0.04]"
                            >
                              <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                {tier.maxQuantity
                                  ? `${tier.minQuantity} - ${tier.maxQuantity} قطعة`
                                  : `${tier.minQuantity}+ قطعة`}
                                {tier.note ? ` (${tier.note})` : ""}
                              </span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                السعر عبر الواتساب 💬
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-white/[0.06] flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProduct(prod)}
                      className="flex-1 py-3 px-4 rounded-2xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/[0.08] hover:border-[#FF274B] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Info size={15} />
                      <span>تفاصيل الكمية</span>
                    </button>

                    <button
                      onClick={() => handleOpenWhatsAppOrder(prod, prod.minOrderQuantity || 12)}
                      className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle size={16} />
                      <span>استفسر عبر الواتساب 💬</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── PRODUCT DETAIL & INTERACTIVE CALCULATION MODAL ─── */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white dark:bg-[#0E0E10] border border-zinc-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 my-8 shadow-2xl space-y-6 dir-rtl text-right"
              dir="rtl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 left-6 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-100 dark:bg-zinc-900 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left (Image Gallery) */}
                <div className="space-y-4">
                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        activeImageIndex === 0
                          ? selectedProduct.mainImage
                          : selectedProduct.images?.[activeImageIndex - 1] || selectedProduct.mainImage
                      }
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Thumbnails */}
                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <button
                        onClick={() => setActiveImageIndex(0)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImageIndex === 0 ? "border-[#FF274B]" : "border-transparent opacity-60"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedProduct.mainImage} alt="Main" className="w-full h-full object-cover" />
                      </button>
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx + 1)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            activeImageIndex === idx + 1 ? "border-[#FF274B]" : "border-transparent opacity-60"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right (Product Info & Quantity Calculator) */}
                <div className="space-y-6">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#FF274B]/10 text-[#FF274B] text-[11px] font-bold mb-2">
                      {selectedProduct.categoryName}
                    </span>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                      {selectedProduct.description || "منتج فاخر مصمم وفقاً لأعلى معايير الستريت وير والعصرية."}
                    </p>
                  </div>

                  {/* Pricing Tiers Highlight */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                      شرائح الكميات المتوفرة:
                    </span>
                    <div className="space-y-2">
                      {selectedProduct.priceTiers?.map((tier, idx) => {
                        const activeTier = getApplicableTier(selectedProduct, orderQuantity);
                        const isCurrent = activeTier.minQuantity === tier.minQuantity;

                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                              isCurrent
                                ? "bg-amber-500/10 border-amber-500 text-amber-500 dark:bg-amber-500/20"
                                : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCurrent && <CheckCircle2 size={16} className="text-amber-500" />}
                              <span className="font-bold text-xs">
                                {tier.maxQuantity
                                  ? `${tier.minQuantity} - ${tier.maxQuantity} قطعة`
                                  : `${tier.minQuantity}+ قطعة`}
                                {tier.note ? ` (${tier.note})` : ""}
                              </span>
                            </div>
                            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                              السعر عبر الواتساب 💬
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity Counter & WhatsApp Direct Prompt */}
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        اختر الكمية المطلوبة (أقل طلب {selectedProduct.minOrderQuantity || 12} قطعة):
                      </span>
                      <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-200 dark:border-white/[0.08]">
                        <button
                          onClick={() =>
                            setOrderQuantity((q) => Math.max(selectedProduct.minOrderQuantity || 12, q - 1))
                          }
                          className="p-1 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-black text-sm w-10 text-center">{orderQuantity}</span>
                        <button
                          onClick={() => setOrderQuantity((q) => q + 1)}
                          className="p-1 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      <span>حالة السعر والخصم:</span>
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        خصم وتحديد مباشر فور التواصل بالواتساب 💬
                      </span>
                    </div>
                  </div>

                  {/* Order via WhatsApp Action Button */}
                  <button
                    onClick={() => handleOpenWhatsAppOrder(selectedProduct, orderQuantity)}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={20} />
                    <span>تواصل وراسلنا عبر الواتساب لمعرفة السعر 💬</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
