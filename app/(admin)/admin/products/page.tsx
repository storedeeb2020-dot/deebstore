"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
  Flame,
  Star,
} from "lucide-react";
import { getProducts, deleteProduct, subscribeToLiveProducts } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToLiveProducts((liveProds) => {
      setProducts(liveProds);
      setFiltered(liveProds);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      products.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        return name.includes(q) || cat.includes(q) || brand.includes(q);
      })
    );
  }, [search, products]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteProduct(id);
      toast.success("تم حذف المنتج بنجاح 🐺");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error("فشل حذف المنتج");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl pb-16 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF274B] mb-1">
            <Package size={16} />
            إدارة الكتالوج والمعروضات
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            قائمة منتجات المتجر ({filtered.length})
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            عرض، إضافة، وتحديث بيانات جميع منتجات وصيحات DEEP STORE.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF274B] to-amber-500 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-lg shadow-[#FF274B]/20 hover:scale-105 active:scale-95 transition-all duration-300 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          إضافة منتج جديد
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-4 bg-white dark:bg-[#0E0E10] p-4 rounded-2xl border border-zinc-200 dark:border-white/[0.06] shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FF274B]" />
          <input
            type="text"
            placeholder="البحث باسم المنتج، القسم، أو البراند..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-11 pl-4 py-3 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF274B] transition-all font-bold"
          />
        </div>
      </div>

      {/* Main Products Grid/Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 text-[#FF274B]">
          <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">جاري تحميل كتالوج المنتجات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-16 text-center text-zinc-400 space-y-4 shadow-sm">
          <Package size={44} className="mx-auto text-zinc-600" />
          <h3 className="text-base font-black text-zinc-900 dark:text-white">لم يتم العثور على أي منتجات</h3>
          <p className="text-xs text-zinc-500">جرب البحث بكلمة أخرى أو اضغط إضافة منتج جديد.</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#FF274B] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#FF274B]/90 transition-colors"
          >
            <Plus size={15} />
            إضافة منتج الآن
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] shadow-sm dark:shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">تفاصيل المنتج</th>
                  <th className="px-6 py-4">القسم التابع</th>
                  <th className="px-6 py-4">السعر</th>
                  <th className="px-6 py-4">إجمالي المخزون</th>
                  <th className="px-6 py-4">التصنيفات المميزة</th>
                  <th className="px-6 py-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
                <AnimatePresence initial={false}>
                  {filtered.map((product, i) => {
                    const totalStock = product.variants?.reduce(
                      (sum, v) => sum + v.sizes.reduce((sSum, s) => sSum + s.stock, 0),
                      0
                    ) || 0;
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.2) }}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        {/* Product details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.06] shrink-0 flex items-center justify-center p-1">
                              {product.mainImage ? (
                                <Image
                                  src={product.mainImage}
                                  alt={product.name}
                                  width={44}
                                  height={44}
                                  className="object-contain w-full h-full"
                                />
                              ) : (
                                <div className="text-[10px] text-amber-500 font-black tracking-tighter">
                                  DEEP
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-zinc-900 dark:text-white">{product.name}</p>
                              <p className="text-[10px] text-[#FF274B] font-mono font-bold uppercase tracking-wide mt-0.5">{product.brand || "DEEP STORE"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">
                          {product.category || "عام"}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-xs text-[#FF274B] font-mono">
                              {formatPrice(product.salePrice ?? product.price)}
                            </span>
                            {product.salePrice && (
                              <span className="text-[10px] text-zinc-400 line-through font-mono">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                totalStock > 10
                                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                  : totalStock > 0
                                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                  : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                              }`}
                            />
                            <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                              {totalStock > 0 ? `${totalStock} قطعة` : "نفد المخزون"}
                            </span>
                          </div>
                        </td>

                        {/* Tags */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {product.bestSeller && (
                              <span className="px-2.5 py-0.5 bg-[#FF274B]/10 text-[#FF274B] border border-[#FF274B]/30 rounded-full text-[10px] font-black flex items-center gap-1">
                                <Flame size={11} /> الأكثر مبيعاً
                              </span>
                            )}
                            {product.featured && (
                              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full text-[10px] font-black flex items-center gap-1">
                                <Star size={11} /> مميز
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                              title="تعديل المنتج"
                            >
                              <Edit size={16} />
                            </Link>

                            <button
                              onClick={() => setDeleteId(product.id)}
                              className="p-2 text-zinc-400 hover:text-[#FF274B] hover:bg-[#FF274B]/10 rounded-xl transition-colors"
                              title="حذف المنتج"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0E0E10] border border-zinc-200 dark:border-white/[0.08] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-zinc-900 dark:text-white"
            >
              <div className="flex items-center gap-3 text-[#FF274B]">
                <AlertTriangle size={24} />
                <h3 className="font-black text-base">تأكيد حذف المنتج</h3>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold">
                هل أنت متأكد من حذف هذا المنتج نهائياً من المتجر؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                  className="px-4 py-2 bg-[#FF274B] hover:bg-[#FF274B]/90 text-white rounded-xl text-xs font-black transition-colors disabled:opacity-50"
                >
                  {deleting ? "جاري الحذف..." : "حذف نهائي"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
