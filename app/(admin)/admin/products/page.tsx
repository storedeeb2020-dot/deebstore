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
} from "lucide-react";
import { getProducts, deleteProduct } from "@/lib/firebase/firestore";
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

  const loadProducts = () => {
    setLoading(true);
    getProducts()
      .then((data) => {
        setProducts(data);
        setFiltered(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadProducts, []);

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
      toast.success("تم حذف المنتج بنجاح من قاعدة البيانات 👑");
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
    <div className="space-y-8 max-w-6xl pb-16 font-sans dir-rtl text-white" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Package size={14} />
            إدارة الكتالوج والمنتجات
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            قائمة المنتجات والمعروضات
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            إضافة، تعديل، وحذف الأصناف والمنتجات المعروضة بالمتجر.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black px-5 py-3 rounded-xl font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all duration-300 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          إضافة منتج جديد
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="البحث باسم المنتج، الفئة أو الماركة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-zinc-800 rounded-xl text-xs bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Main Table Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 text-amber-400">
          <Spinner size="lg" />
          <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">جاري تحميل المنتجات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-12 text-center text-zinc-500 space-y-4">
          <Package size={40} className="mx-auto text-zinc-700" />
          <h3 className="text-base font-bold text-white">لم يتم العثور على أي منتجات</h3>
          <p className="text-xs text-zinc-400">جرب البحث بكلمة أخرى أو قم بإضافة أول منتج للمتجر.</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-amber-500 text-black px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            <Plus size={14} />
            إضافة منتج الآن
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-zinc-900/60 border-b border-zinc-800 text-amber-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">تفاصيل المنتج</th>
                  <th className="px-6 py-4">الفئة</th>
                  <th className="px-6 py-4">السعر</th>
                  <th className="px-6 py-4">المخزون المتوفر</th>
                  <th className="px-6 py-4">الوسوم</th>
                  <th className="px-6 py-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
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
                        className="hover:bg-zinc-900/40 transition-colors"
                      >
                        {/* Product details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0 flex items-center justify-center p-1">
                              {product.mainImage ? (
                                <Image
                                  src={product.mainImage}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="object-contain w-full h-full"
                                />
                              ) : (
                                <div className="text-[10px] text-amber-500/50 font-black tracking-tighter">
                                  DEEP
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-white">{product.name}</p>
                              <p className="text-[10px] text-amber-400/90 font-medium tracking-wide uppercase mt-0.5">{product.brand || "DEEP STORE"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 font-medium text-zinc-300">
                          {product.category}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-amber-300">
                              {formatPrice(product.salePrice ?? product.price)}
                            </span>
                            {product.salePrice && (
                              <span className="text-[10px] text-zinc-500 line-through">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                totalStock > 10
                                  ? "bg-emerald-500"
                                  : totalStock > 0
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span className="font-bold text-xs text-zinc-200">
                              {totalStock > 0 ? `${totalStock} قطعة` : "نفد المخزون"}
                            </span>
                          </div>
                        </td>

                        {/* Tags */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {product.bestSeller && (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-bold">
                                الأكثر مبيعاً
                              </span>
                            )}
                            {product.isNewArrival && (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-md text-[10px] font-bold">
                                جديد
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 rounded-lg transition-colors"
                              title="تعديل المنتج"
                            >
                              <Edit size={16} />
                            </Link>

                            <button
                              onClick={() => setDeleteId(product.id)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-white"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle size={24} />
                <h3 className="font-bold text-base">تأكيد حذف المنتج</h3>
              </div>
              <p className="text-xs text-zinc-400">
                هل أنت تأكد من رغبتك في حذف هذا المنتج نهائياً من المتجر؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
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
