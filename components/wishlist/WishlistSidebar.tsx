"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Heart, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/features/wishlist/WishlistProvider";
import { formatPrice } from "@/lib/utils";

export function WishlistSidebar() {
  const router = useRouter();
  const { isOpen, closeWishlist, wishlist, toggleWishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 99998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
          />
          <motion.aside
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-zinc-950 shadow-2xl border-l border-zinc-100 dark:border-zinc-900 flex flex-col overflow-hidden"
            style={{ zIndex: 99999 }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between flex-shrink-0 bg-white dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <Heart size={18} className="fill-zinc-900 dark:fill-white text-zinc-900 dark:text-white" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider">المفضلة ({wishlist.length})</h2>
              </div>
              <button onClick={closeWishlist} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2.5">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10">
                  <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">قائمة المفضلة فارغة</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-[220px] mx-auto">احفظ المنتجات التي تحبها هنا!</p>
                  </div>
                  <button onClick={closeWishlist} className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer">
                    تصفح المنتجات
                  </button>
                </div>
              ) : (
                wishlist.map((product) => {
                  const displayPrice = product.salePrice ?? product.price;
                  return (
                    <motion.div key={product.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-900">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 flex-shrink-0 p-1 border border-zinc-100 dark:border-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.mainImage || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-bold text-xs truncate">{product.name}</h4>
                          <button onClick={() => toggleWishlist(product)} className="text-zinc-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer flex-shrink-0"><X size={13} /></button>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs font-black">{formatPrice(displayPrice)}</span>
                          <button type="button" onClick={() => { closeWishlist(); router.push(`/products?id=${encodeURIComponent(product.id)}`); }} className="inline-flex items-center gap-1 bg-black text-white dark:bg-white dark:text-black px-2.5 py-1.5 rounded-lg text-[9px] font-black hover:opacity-90 transition-all cursor-pointer shadow-sm">
                            <Eye size={10} />
                            عرض المنتج
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
