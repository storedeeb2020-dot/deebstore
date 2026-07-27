"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Flame, Search, CheckCircle2, Sparkles, Star, Package } from "lucide-react";
import { getProducts, updateProduct } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Spinner } from "@/components/ui/Spinner";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { toast } from "sonner";

export default function AdminBestSellersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyBestSellers, setOnlyBestSellers] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleToggleBestSeller = async (productId: string, currentStatus: boolean) => {
    setUpdatingId(productId);
    const newStatus = !currentStatus;

    // Optimistic local state update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, bestSeller: newStatus } : p))
    );

    try {
      await updateProduct(productId, { bestSeller: newStatus });
      if (newStatus) {
        toast.success("تم إضافة المنتج لـ (أفضل المبيعات 🔥)");
      } else {
        toast.info("تم إزالة المنتج من قائمة أفضل المبيعات");
      }
    } catch (err) {
      console.error(err);
      toast.error("فشل تحديث حالة المنتج");
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, bestSeller: currentStatus } : p))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const bestSellersCount = products.filter((p) => p.bestSeller).length;

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim();
    const nameMatch = (p.name || "").toLowerCase().includes(q);
    const catMatch = (p.category || "").toLowerCase().includes(q);
    const matchesSearch = !q || nameMatch || catMatch;

    if (onlyBestSellers) {
      return matchesSearch && p.bestSeller;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl pb-16 font-sans dir-rtl text-white" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Flame size={16} className="text-amber-500 fill-amber-500" />
            إدارة معروضات الأكثر مبيعاً (Best Sellers)
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            منتجات الأكثر مبيعاً 🔥
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            حدد المنتجات المفضلة التي تود إبرازها في قسم (أفضل المبيعات) بالصفحة الرئيسية للمتجر وفي المنيو.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="bg-zinc-950 border border-amber-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-xl">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Star size={16} className="fill-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-bold">المحددة حالياً</span>
            <span className="text-sm font-black text-amber-400">{bestSellersCount} منتج</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="ابحث باسم المنتج أو الفئة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-zinc-800 rounded-xl text-xs bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        <button
          onClick={() => setOnlyBestSellers((prev) => !prev)}
          className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center ${
            onlyBestSellers
              ? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20 font-black"
              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          <Flame size={14} className={onlyBestSellers ? "fill-black" : ""} />
          <span>عرض الأكثر مبيعاً فقط ({bestSellersCount})</span>
        </button>
      </div>

      {/* Products Grid / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 text-amber-400">
          <Spinner size="lg" />
          <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">جاري تحميل كتالوج المنتجات...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-12 text-center text-zinc-500 space-y-3">
          <Package size={40} className="mx-auto text-zinc-700" />
          <h3 className="text-base font-bold text-white">لم يتم العثور على أي منتجات مطابقة</h3>
          <p className="text-xs text-zinc-400">جرب تصفية البحث أو قم بإلغاء التصفية.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProducts.map((prod) => {
            const isBestSeller = !!prod.bestSeller;
            const isUpdating = updatingId === prod.id;

            return (
              <div
                key={prod.id}
                className={`relative rounded-2xl border transition-all p-4 bg-zinc-950 flex flex-col justify-between space-y-4 shadow-xl ${
                  isBestSeller
                    ? "border-amber-500/60 shadow-amber-500/5 bg-gradient-to-b from-amber-500/5 to-zinc-950"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {/* Top Badge if Best Seller */}
                {isBestSeller && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-black text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md z-10">
                    <Flame size={12} className="fill-black" />
                    الأكثر مبيعاً 🔥
                  </div>
                )}

                {/* Product Info Card Header */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    {prod.mainImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prod.mainImage} alt={prod.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package size={24} className="text-zinc-700" />
                    )}
                  </div>

                  <div className="overflow-hidden space-y-1">
                    <h3 className="font-bold text-xs text-white truncate">{prod.name}</h3>
                    <p className="text-[10px] text-zinc-400 font-medium truncate">{prod.category || "عام"}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-amber-400">
                        {formatPrice(prod.salePrice ?? prod.price)}
                      </span>
                      {prod.salePrice && (
                        <span className="text-[10px] text-zinc-500 line-through">
                          {formatPrice(prod.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Toggle */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-300">عرض في أفضل المبيعات</span>
                  </div>

                  <button
                    onClick={() => handleToggleBestSeller(prod.id, isBestSeller)}
                    disabled={isUpdating}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                      isBestSeller
                        ? "bg-amber-500 hover:bg-amber-400 text-black shadow-md font-black"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                    }`}
                  >
                    {isUpdating ? (
                      <Spinner size="sm" className="border-black border-t-transparent" />
                    ) : (
                      <Star size={14} className={isBestSeller ? "fill-black" : ""} />
                    )}
                    <span>{isBestSeller ? "مُفعل ✓" : "تفعيل 🔥"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
