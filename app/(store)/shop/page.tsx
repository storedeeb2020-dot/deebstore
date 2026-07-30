"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Sparkles, LayoutGrid } from "lucide-react";
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
    const params = new URLSearchParams(searchParams.toString());
    if (catSlug === "all") {
      params.delete("category");
    } else {
      params.set("category", catSlug);
    }
    const queryString = params.toString();
    router.replace(queryString ? `/shop?${queryString}` : "/shop", { scroll: false });
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

  const filteredProducts = products.filter((prod) => {
    // Category match
    if (selectedCategory !== "all") {
      const catObj = categories.find(
        (c) =>
          c.slug === selectedCategory ||
          c.name === selectedCategory ||
          c.id === selectedCategory ||
          c.nameAr === selectedCategory
      );
      const matches =
        prod.category === selectedCategory ||
        (catObj &&
          (prod.category === catObj.id ||
            prod.category === catObj.name ||
            prod.category === catObj.slug ||
            prod.category === catObj.nameAr));

      if (!matches) return false;
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



      {/* Filter & Search Controls */}
      <div className="space-y-4 mb-10 pb-6 border-b border-gray-100 dark:border-zinc-900">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:w-72 shrink-0">
            <input
              type="text"
              placeholder="ابحث باسم المنتج، الخامة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-4 pl-9 py-2.5 rounded-2xl bg-gray-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-white/[0.08] text-xs font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Horizontal Pills with Smooth Layout Springs & Scroll Hint */}
          <div className="relative w-full sm:w-auto flex-1 overflow-hidden">
            {/* Scroll Edge Fades */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-black to-transparent z-10" />
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-black to-transparent z-10" />

            <div className="flex items-center gap-2 overflow-x-auto flex-nowrap whitespace-nowrap scrollbar-none scroll-smooth py-1 px-1 justify-start sm:justify-end">
              {/* Ultra-Sleek Masterpiece Back Button */}
              <AnimatePresence>
                {selectedCategory !== "all" && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.85, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.85, x: 10 }}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleCategorySelect("all")}
                    className="relative group px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF274B]/20 via-[#FF274B]/10 to-amber-500/20 hover:from-[#FF274B] hover:to-amber-500 text-[#FF274B] hover:text-white border border-[#FF274B]/40 hover:border-transparent text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-lg shadow-[#FF274B]/10 hover:shadow-[#FF274B]/30 overflow-hidden"
                  >
                    {/* Light Beam Sweep on Hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
                    
                    <RotateCcw size={13} className="group-hover:-rotate-90 transition-transform duration-300 relative z-10" />
                    <span className="relative z-10">عرض الكل ↩</span>
                  </motion.button>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={() => handleCategorySelect("all")}
                className={`relative px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                  selectedCategory === "all"
                    ? "text-black"
                    : "bg-gray-100 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {selectedCategory === "all" && (
                  <motion.div
                    layoutId="activeShopCategoryTab"
                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-2xl shadow-lg shadow-amber-500/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">الكل / All</span>
              </button>

              {categories.map((cat) => {
                const catSlug = cat.slug || cat.name;
                const isActive = selectedCategory === catSlug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(catSlug)}
                    className={`relative px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? "text-black"
                        : "bg-gray-100 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeShopCategoryTab"
                        className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-2xl shadow-lg shadow-amber-500/20"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat.nameAr || cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
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
