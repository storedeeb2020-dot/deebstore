"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product } from "@/types/product";
import { getSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(console.error);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <motion.p
            className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {settings?.featuredSubtitle || "Curated for you"}
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {settings?.featuredTitle || "Our Collection"}
          </motion.h2>
        </div>
      </div>

      <ProductGrid products={products} columns={4} />
    </section>
  );
}
