"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Flame, Search, Package } from "lucide-react";
import { getProducts, updateProduct, deleteAllProducts } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
    <div className="space-y-8 max-w-7xl pb-16 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF274B] mb-1">
            <Flame size={18} className="text-[#FF274B] animate-pulse" />
            إدارة منتجات الأكثر مبيعاً (Best Sellers)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            تخصيص العرض في شريط &quot;الأكثر مبيعاً 🔥&quot;
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            اختر المنتجات وتفعيل شارة Best Seller لتبدو بارزة للعملاء في الصفحة الرئيسية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              if (confirm("هل تريد مسح المنتجات القديمة من قاعدة البيانات؟")) {
                setLoading(true);
                await deleteAllProducts();
                setProducts([]);
                setLoading(false);
                toast.success("تم مسح المنتجات القديمة بنجاح 🐺");
              }
            }}
            className="px-4 py-2.5 bg-[#FF274B]/10 hover:bg-[#FF274B]/20 text-[#FF274B] border border-[#FF274B]/30 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            مسح المنتجات القديمة
          </button>
        </div>
      </div>

      {/* Control Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0E0E10] p-4 rounded-2xl border border-zinc-200 dark:border-white/[0.06] shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FF274B]" />
          <input
            type="text"
            placeholder="البحث باسم المنتج أو القسم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-11 pl-4 py-3 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF274B] transition-all font-bold"
          />
        </div>

        <button
          onClick={() => setOnlyBestSellers((prev) => !prev)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all w-full sm:w-auto justify-center ${
            onlyBestSellers
              ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
              : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-300"
          }`}
        >
          <Flame size={16} />
          <span>الأكثر مبيعاً فقط ({bestSellersCount})</span>
        </button>
      </div>

      {/* Products Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 text-[#FF274B]">
          <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">جاري تحميل المنتجات...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-16 text-center text-zinc-400 space-y-3 shadow-sm">
          <Package size={44} className="mx-auto text-zinc-600" />
          <p className="text-xs font-bold">لا توجد منتجات تفي بمعايير البحث الحالية</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const isBest = !!product.bestSeller;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-white dark:bg-[#0E0E10] rounded-3xl p-5 border transition-all duration-300 shadow-sm ${
                  isBest
                    ? "border-[#FF274B]/60 shadow-[0_0_20px_rgba(255,39,75,0.15)]"
                    : "border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.12]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.06] shrink-0 flex items-center justify-center p-1">
                    {product.mainImage ? (
                      <Image
                        src={product.mainImage}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <div className="text-xs font-black text-amber-500">DEEP</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-zinc-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">{product.category || "عام"}</p>
                    <p className="text-xs font-black text-[#FF274B] font-mono mt-1">
                      {formatPrice(product.salePrice ?? product.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100 dark:border-white/[0.06]">
                  <span className={`text-[11px] font-bold flex items-center gap-1 ${isBest ? "text-[#FF274B]" : "text-zinc-500"}`}>
                    <Flame size={14} className={isBest ? "animate-pulse text-[#FF274B]" : "text-zinc-500"} />
                    {isBest ? "مدرج بالأكثر مبيعاً" : "منتج عالي الجودة"}
                  </span>

                  <button
                    onClick={() => handleToggleBestSeller(product.id, isBest)}
                    disabled={updatingId === product.id}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isBest
                        ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20 hover:bg-[#FF274B]/90"
                        : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:border-[#FF274B]"
                    }`}
                  >
                    {isBest ? "إلغاء 🔥" : "إضافة 🔥"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
