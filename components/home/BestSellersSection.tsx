"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, ArrowLeft } from "lucide-react";
import { getProducts } from "@/lib/firebase/firestore";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product } from "@/types/product";

export function BestSellersSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ bestSeller: true, limitCount: 8 })
      .then(setProducts)
      .catch((err) => {
        console.error("Failed to load best seller products:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section id="best-sellers" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-100 dark:border-zinc-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div className="space-y-2">
          <motion.div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px] font-extrabold tracking-wider"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Flame size={14} className="fill-amber-500" />
            <span>الأكثر طلباً وإقبالاً 🔥</span>
          </motion.div>

          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            أفضل المبيعات <span className="text-amber-500 font-light font-mono text-xl sm:text-2xl">/ BEST SELLERS</span>
          </motion.h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
            التصاميم والتشكيلات الأكثر رواجاً وشعبية لدى عملاء DEEB STORE.
          </p>
        </div>

        <Link
          href="/shop?bestSeller=true"
          className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-black text-white dark:bg-zinc-800 dark:hover:bg-amber-500 dark:hover:text-black px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <span>تصفح الكل</span>
          <ArrowLeft size={14} />
        </Link>
      </div>

      {/* Products Grid */}
      <ProductGrid products={products} columns={4} />
    </section>
  );
}
