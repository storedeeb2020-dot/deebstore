"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { BestSellersSection } from "@/components/home/BestSellersSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CollectionsGrid />
      <BestSellersSection />
      <FeaturedProducts />
    </>
  );
}
