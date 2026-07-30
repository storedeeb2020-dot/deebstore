"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { getCategories, subscribeToLiveProducts } from "@/lib/firebase/firestore";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Spinner } from "@/components/ui/Spinner";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const featuredParam = searchParams.get("featured") === "true";
  const bestSellerParam = searchParams.get("bestSeller") === "true";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const handleCategorySelect = (catSlug: string) => {
    setSelectedCategory(catSlug);
    const newUrl = catSlug === "all" ? "/shop" : `/shop?category=${catSlug}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
  };

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(console.error);

    // Live subscription to product changes from admin
    const unsubscribe = subscribeToLiveProducts((liveProds) => {
      setProducts(liveProds);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const activeCategoryObj = categories.find(
    (c) => (c.slug || c.name) === selectedCategory
  );
  const activeCategoryName = activeCategoryObj
    ? activeCategoryObj.nameAr || activeCategoryObj.name
    : selectedCategory;

  const filteredProducts = products.filter((prod) => {
    // Category match
    if (selectedCategory !== "all" && prod.category !== selectedCategory) {
      return false;
    }
    // Featured match
    if (featuredParam && !prod.featured) {
      return false;
    }
    // Best Seller match
    if (bestSellerParam && !prod.bestSeller) {
      return false;
    }
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = prod.name?.toLowerCase().includes(q);
      const brandMatch = prod.brand?.toLowerCase().includes(q);
      if (!nameMatch && !brandMatch) return false;
    }
    return true;
  });

  return (
    <div className="pt-28 pb-20 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-amber-500 flex items-center justify-center gap-2">
          تشكيلة منتجات DEEB STORE <img src="/api/wolf-icon" alt="Wolf" className="w-8 h-8 object-contain invert mix-blend-screen" />
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          تصفح أحدث تصاميم الملابس والأزياء الفاخرة المصممة بعناية لتعكس أسلوبك الخاص.
        </p>
      </div>

      {/* Active Category Back Banner */}
      <AnimatePresence>
        {selectedCategory !== "all" && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-amber-500/15 via-zinc-900 to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 text-amber-400 text-xs font-extrabold shadow-lg shadow-amber-500/5"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/30">
                <Sparkles size={16} />
              </span>
              <div>
                <p className="text-[11px] text-zinc-400">أنت تتصفح حالياً قسم:</p>
                <p className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                  <span className="bg-amber-500 text-black px-2.5 py-0.5 rounded-lg text-xs font-black">
                    {activeCategoryName}
                  </span>
                  <span>({filteredProducts.length} منتج)</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
            >
              <RotateCcw size={15} />
              <span>العودة لجميع الأقسام (عرض الكل)</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100 dark:border-zinc-900">
        {/* Search */}
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-transparent focus:border-black dark:focus:border-white text-xs font-semibold focus:outline-none"
        />

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 overflow-x-auto justify-center sm:justify-end w-full">
          <button
            onClick={() => handleCategorySelect("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20 scale-105"
                : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            الكل / All
          </button>
          {categories.map((cat) => {
            const catSlug = cat.slug || cat.name;
            const isActive = selectedCategory === catSlug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(catSlug)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20 scale-105"
                    : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
              >
                {cat.nameAr || cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid or Empty */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <p className="text-lg font-bold text-gray-700 dark:text-gray-300">لا توجد منتجات مطابقة في هذا القسم</p>
          <p className="text-xs text-gray-400">جرب البحث بكلمة أخرى أو اضغط للعودة لجميع الأقسام.</p>
          <button
            type="button"
            onClick={() => handleCategorySelect("all")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer shadow-md"
          >
            <RotateCcw size={14} />
            <span>عرض كافة منتجات المتجر</span>
          </button>
        </div>
      ) : (
        <ProductGrid products={filteredProducts} columns={4} />
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
