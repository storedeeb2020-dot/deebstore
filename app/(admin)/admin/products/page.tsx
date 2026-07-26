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
} from "lucide-react";
import { getProducts, deleteProduct } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
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

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteId);
      toast.success("Product deleted successfully");
      setDeleteId(null);
      loadProducts();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Products</h1>
          <p className="text-zinc-400 text-xs mt-1">
            {products.length} total catalog products registered in Firestore
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all duration-300 shadow-md shadow-zinc-900/10 self-start sm:self-auto"
        >
          <Plus size={14} />
          Add Product
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search catalog by name, brand, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-zinc-100 rounded-xl text-xs bg-white focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Main Table Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Spinner size="lg" />
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">Loading catalog</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            search ? "Try searching for another keyword." : "Add your first product to get started."
          }
          action={
            !search ? (
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all duration-300"
              >
                <Plus size={14} />
                Add Product
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Product Detail</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-left">Price</th>
                  <th className="px-6 py-4 text-left">Stock Level</th>
                  <th className="px-6 py-4 text-left">Tags</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
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
                        className="hover:bg-zinc-50/40 transition-colors"
                      >
                        {/* Product details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-50/60 border border-zinc-100 flex-shrink-0 flex items-center justify-center p-1.5">
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
                              <p className="font-bold text-xs text-zinc-950">{product.name}</p>
                              <p className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase mt-0.5">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Category */}
                        <td className="px-6 py-4 text-xs font-semibold text-zinc-500 capitalize">
                          {product.category}
                        </td>

                        {/* Pricing */}
                        <td className="px-6 py-4 text-xs font-black text-zinc-950">
                          <div>
                            {product.salePrice ? (
                              <div className="space-y-0.5">
                                <p className="font-black text-zinc-950">{formatPrice(product.salePrice)}</p>
                                <p className="text-[10px] text-zinc-400 line-through font-medium">
                                  {formatPrice(product.price)}
                                </p>
                              </div>
                            ) : (
                              <p>{formatPrice(product.price)}</p>
                            )}
                          </div>
                        </td>

                        {/* Stock Level */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                totalStock === 0
                                  ? "bg-red-500"
                                  : totalStock <= 5
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                              }`}
                            />
                            <span className="text-xs font-bold text-zinc-800">
                              {totalStock === 0 ? "Out of Stock" : `${totalStock} units`}
                            </span>
                          </div>
                        </td>

                        {/* Status Badges */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {product.featured && (
                              <span className="text-[9px] bg-zinc-900 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                            {product.bestSeller && (
                              <span className="text-[9px] bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                Best Seller
                              </span>
                            )}
                            {!product.featured && !product.bestSeller && (
                              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                                Standard
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/products/edit?id=${product.id}`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all text-zinc-500 hover:text-zinc-900"
                            >
                              <Edit size={13} />
                            </Link>
                            <button
                              onClick={() => setDeleteId(product.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition-all text-zinc-400 hover:text-red-600"
                            >
                              <Trash2 size={13} />
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

      {/* Delete Confirmation Drawer Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-zinc-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
            >
              <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-500" size={18} />
              </div>
              <h3 className="font-black text-sm text-zinc-900 uppercase tracking-wider mb-2">Delete Product</h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                Are you sure you want to delete this product? This action is permanent and cannot be undone on Firestore.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/10"
                >
                  {deleting ? (
                    <Spinner size="sm" className="border-white border-t-transparent" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
