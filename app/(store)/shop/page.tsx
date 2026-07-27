"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts, getCategories } from "@/lib/firebase/firestore";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Spinner } from "@/components/ui/Spinner";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

function ShopContent() {
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

  useEffect(() => {
    async function loadData() {
      try {
        const [allProds, allCats] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(allProds);
        setCategories(allCats);
      } catch (err) {
        console.error("Failed to load shop data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-amber-500 flex items-center justify-center gap-2">
          تشكيلة منتجات DEEB STORE <img src="/api/wolf-icon" alt="Wolf" className="w-8 h-8 object-contain invert mix-blend-screen" />
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          تصفح أحدث تصاميم الملابس والأزياء الفاخرة المصممة بعناية لتعكس أسلوبك الخاص.
        </p>
      </div>

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
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === "all"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            الكل / All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug || cat.name)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === (cat.slug || cat.name)
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                  : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {cat.nameAr || cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-lg font-bold text-gray-700 dark:text-gray-300">لا توجد منتجات مطابقة</p>
          <p className="text-xs text-gray-400">جرب البحث بكلمة أخرى أو تغيير الفئة الفعالة.</p>
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
