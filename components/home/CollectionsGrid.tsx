"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const collections = [
  {
    id: "men",
    title: "Men",
    subtitle: "Modern essentials",
    href: "/shop?category=men",
    image: "/banner.png",
    span: "lg:col-span-1 lg:row-span-2",
    textPosition: "bottom-left",
  },
  {
    id: "women",
    title: "Women",
    subtitle: "Elegant styles",
    href: "/shop?category=women",
    image: "/banner_light.png",
    span: "lg:col-span-2 lg:row-span-1",
    textPosition: "bottom-left",
  },
  {
    id: "new",
    title: "New Arrivals",
    subtitle: "Latest drops",
    href: "/shop?featured=true",
    image: "/banner.png",
    span: "lg:col-span-1 lg:row-span-1",
    textPosition: "bottom-left",
  },
  {
    id: "best",
    title: "Best Sellers",
    subtitle: "Fan favorites",
    href: "/shop?bestSeller=true",
    image: "/banner_light.png",
    span: "lg:col-span-1 lg:row-span-1",
    textPosition: "bottom-left",
  },
];

export function CollectionsGrid() {
  return (
    <section
      id="collections"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="mb-12 text-center">
        <motion.p
          className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Shop by Category
        </motion.p>
        <motion.h2
          className="text-3xl md:text-4xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Our Collections
        </motion.h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4 md:gap-6 auto-rows-[280px] lg:auto-rows-[300px]">
        {collections.map((col, i) => (
          <motion.div
            key={col.id}
            className={`relative overflow-hidden rounded-2xl group cursor-pointer ${col.span}`}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <Link href={col.href} className="block w-full h-full">
              {/* Background Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Text */}
              <div className="absolute bottom-5 left-5">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                  {col.subtitle}
                </p>
                <h3 className="text-white font-bold text-xl md:text-2xl">
                  {col.title}
                </h3>
                <motion.div
                  className="h-0.5 bg-white mt-2 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
