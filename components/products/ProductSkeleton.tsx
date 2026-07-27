"use client";

import { motion } from "framer-motion";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-zinc-900 rounded-xl ${className}`}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
    />
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Image */}
      <SkeletonPulse className="aspect-[3/4] w-full rounded-2xl" />
      {/* Color dots */}
      <div className="flex justify-center gap-1.5">
        {[1, 2, 3].map((i) => (
          <SkeletonPulse key={i} className="w-3 h-3 rounded-full" />
        ))}
      </div>
      {/* Name */}
      <SkeletonPulse className="h-3 w-3/4 mx-auto rounded-full" />
      {/* Price */}
      <SkeletonPulse className="h-4 w-1/2 mx-auto rounded-full" />
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
}

export function ProductGridSkeleton({ count = 8, columns = 4 }: ProductGridSkeletonProps) {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  }[columns];

  return (
    <div className="w-full bg-black">
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-12 space-y-3">
          <SkeletonPulse className="h-2.5 w-32 rounded-full" />
          <SkeletonPulse className="h-8 w-48 rounded-xl" />
        </div>
        {/* Grid */}
        <div className={`grid ${colClass} gap-4 sm:gap-6 lg:gap-8`}>
          {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
