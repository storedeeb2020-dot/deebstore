"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getCategories } from "@/lib/firebase/firestore";
import type { Category } from "@/types/category";

export function CollectionsGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data || []);
      })
      .catch((err) => {
        console.error("Failed to load categories for collections grid:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Do not render anything if still loading or if there are no categories in Firestore
  if (loading || categories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="py-12 md:py-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Title */}
      <div className="mb-8 md:mb-12 text-center space-y-1.5 sm:space-y-2">
        <motion.p
          className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-amber-500"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          أقسام المتجر الرئيسية
        </motion.p>
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          اختر الفئة للتسوق
        </motion.h2>
      </div>

      {/* Grid Layout: 2 columns on mobile/phones (grid-cols-2), 4 columns on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {categories.map((cat, i) => {
          const displayName = cat.nameAr || cat.name;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="group relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-xl bg-zinc-900 cursor-pointer"
            >
              <Link href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`} className="block w-full h-full">
                {/* Vertical High Quality Card Photo */}
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={displayName}
                    fill
                    quality={95}
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    priority={i < 4}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center p-4">
                    <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest text-center">
                      {displayName}
                    </span>
                  </div>
                )}

                {/* Subdued Dark Gradient Overlay at the bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                {/* Bottom Centered Arabic Title & Subtitle */}
                <div className="absolute bottom-4 sm:bottom-6 inset-x-0 px-2.5 sm:px-4 text-center">
                  <h3 className="text-white text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-snug drop-shadow-lg">
                    {displayName}
                  </h3>
                  {cat.subtitle && (
                    <p className="text-[11px] sm:text-xs font-semibold text-amber-300/90 tracking-wide mt-0.5 drop-shadow-md">
                      {cat.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
