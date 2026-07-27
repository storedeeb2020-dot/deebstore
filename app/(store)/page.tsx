"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { BestSellersSection } from "@/components/home/BestSellersSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ProductGridSkeleton } from "@/components/products/ProductSkeleton";
import type { Product } from "@/types/product";
import { getProducts } from "@/lib/firebase/firestore";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load products
    getProducts()
      .then(setProducts)
      .catch((err) => {
        console.error("Failed to load products:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <HeroSection />
      <CollectionsGrid />
      <BestSellersSection />
      <div id="products">
        {loading ? (
          <ProductGridSkeleton count={8} columns={4} />
        ) : (
          <FeaturedProducts products={products} />
        )}
      </div>
    </>
  );
}
