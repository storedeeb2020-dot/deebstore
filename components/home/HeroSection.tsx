"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useTheme } from "@/features/theme/ThemeProvider";
import { getSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";

export function HeroSection() {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(console.error);
  }, []);

  const isDark = theme === "dark";
  const mediaType = settings?.heroMediaType || "image";

  const videoUrl = isDark
    ? settings?.heroVideoUrlDark || settings?.heroVideoUrlLight
    : settings?.heroVideoUrlLight || settings?.heroVideoUrlDark;

  const imageList = useMemo(() => {
    return isDark
      ? settings?.heroImagesDark?.length
        ? settings.heroImagesDark
        : ["/banner.png"]
      : settings?.heroImagesLight?.length
      ? settings.heroImagesLight
      : ["/banner_light.png"];
  }, [isDark, settings?.heroImagesDark, settings?.heroImagesLight]);

  useEffect(() => {
    if (mediaType === "image" && imageList.length > 1) {
      const interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % imageList.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [mediaType, imageList.length]);

  const currentImage = imageList[activeImageIndex % imageList.length] || (isDark ? "/banner.png" : "/banner_light.png");

  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black transition-colors duration-500 flex flex-col items-center justify-center">
      {/* Rich Obsidian Radial Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,rgba(5,5,5,1)_70%)] pointer-events-none" />

      {/* Brand Central Hero Tagline & Subtitle */}
      <div className="relative z-10 text-center px-4 -mt-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/logo.png"
          alt="DEEP STORE"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="h-16 sm:h-24 w-auto mx-auto object-contain mb-4 drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]"
        />
        <motion.p
          className="text-sm md:text-base font-extrabold tracking-widest text-amber-400 drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {(!settings?.heroTagline || settings?.heroTagline.toLowerCase().includes("next"))
            ? "ديب ستور — عالم الموضة والستريت وير الفاخر 👑"
            : settings.heroTagline}
        </motion.p>
      </div>

      {/* Luxury Royal Gold & Obsidian CTA Button */}
      <div className="relative z-20 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative group"
        >
          {/* Subtle Ambient Backing Halo */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-400/50 to-amber-600/40 blur-md opacity-70 group-hover:opacity-100 transition-all duration-500" />

          {/* Main Luxury Glassmorphic Button */}
          <motion.button
            onClick={handleScroll}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="relative inline-flex items-center gap-3 bg-zinc-950/90 hover:bg-gradient-to-r hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 text-amber-400 hover:text-black px-9 py-4 rounded-full font-black text-sm tracking-widest uppercase border border-amber-500/40 hover:border-amber-300 shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden transition-all duration-300 cursor-pointer"
          >
            {/* Moving Shimmer Ray */}
            <motion.div
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-300/20 to-transparent skew-x-[-25deg]"
              initial={{ x: "-150%" }}
              animate={{ x: "250%" }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
            />

            <ShoppingBag size={18} className="relative z-10 transition-transform duration-300 group-hover:scale-110" />
            
            <span className="relative z-10 font-bold text-sm sm:text-base">
              {settings?.heroButtonText || "تسوق الآن — SHOP NOW"}
            </span>

            <ArrowRight
              size={18}
              className="relative z-10 transition-transform duration-300 group-hover:translate-x-1.5"
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-zinc-500 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-400">Scroll</span>
        <motion.div
          className="w-[2px] h-6 bg-gradient-to-b from-amber-400/80 to-transparent rounded-full"
          animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
