"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product } from "@/types/product";
import { getSiteSettings, subscribeToLiveProducts, type SiteSettings } from "@/lib/firebase/firestore";

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    // Real-time live subscription for featured products
    const unsubscribe = subscribeToLiveProducts((liveProds) => {
      setProducts(liveProds);
    }, { featured: true });

    getSiteSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(console.error);

    return () => unsubscribe();
  }, []);

  // If no products are marked as featured by admin, render nothing
  if (products.length === 0) return null;

  return (
    <div id="products" className="w-full bg-white dark:bg-black transition-colors">
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <motion.p
              className="text-xs font-semibold tracking-widest uppercase text-zinc-500 dark:text-gray-400 mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {settings?.featuredSubtitle || "مختارة خصيصاً لك"}
            </motion.p>
            <motion.h2
              className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {settings?.featuredTitle || "مجموعتنا"}
            </motion.h2>
          </div>
        </div>

        <ProductGrid products={products} columns={4} />
      </section>
    </div>
  );
}
