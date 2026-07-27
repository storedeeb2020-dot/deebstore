"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getCategories } from "@/lib/firebase/firestore";
import type { Category } from "@/types/category";

// High-resolution fallback stock fashion portraits if category has no uploaded image
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop", // Casual Shirt
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop", // Suit
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop", // Black Shirt
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop", // Blazer / Jacket
];

const PRESET_CATEGORIES: Partial<Category>[] = [
  {
    name: "Casual",
    subtitle: "Shirt",
    slug: "casual-shirt",
    image: FALLBACK_IMAGES[0],
  },
  {
    name: "Suit",
    subtitle: "",
    slug: "suit",
    image: FALLBACK_IMAGES[1],
  },
  {
    name: "Formal",
    subtitle: "Shirt",
    slug: "formal-shirt",
    image: FALLBACK_IMAGES[2],
  },
  {
    name: "Blazer",
    subtitle: "& Jackets",
    slug: "blazers",
    image: FALLBACK_IMAGES[3],
  },
];

export function CollectionsGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Failed to load categories for collections grid:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Display fetched categories, or preset fallbacks if empty
  const displayItems =
    categories.length > 0
      ? categories.map((cat, idx) => ({
          id: cat.id,
          name: cat.name,
          subtitle: cat.subtitle || "",
          slug: cat.slug || cat.name,
          image: cat.image || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
        }))
      : PRESET_CATEGORIES.map((cat, idx) => ({
          id: `preset-${idx}`,
          name: cat.name!,
          subtitle: cat.subtitle || "",
          slug: cat.slug!,
          image: cat.image!,
        }));

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
        {displayItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="group relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-xl bg-zinc-900 cursor-pointer"
          >
            <Link href={`/shop?category=${encodeURIComponent(item.slug)}`} className="block w-full h-full">
              {/* Vertical High Quality Card Photo */}
              <Image
                src={item.image}
                alt={item.name}
                fill
                quality={95}
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                priority={i < 4}
              />

              {/* Subdued Dark Gradient Overlay at the bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Bottom Centered Title & Subtitle Matching Image Reference */}
              <div className="absolute bottom-4 sm:bottom-6 inset-x-0 px-2 sm:px-4 text-center">
                <h3 className="text-white text-lg sm:text-2xl md:text-3xl font-light tracking-wide drop-shadow-md">
                  <span className="font-semibold">{item.name}</span>{" "}
                  {item.subtitle && (
                    <span className="font-serif italic text-zinc-200 font-normal ml-0.5 sm:ml-1">
                      {item.subtitle}
                    </span>
                  )}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
