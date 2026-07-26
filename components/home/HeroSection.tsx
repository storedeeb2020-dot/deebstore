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
    <section className="relative h-screen w-full overflow-hidden bg-white dark:bg-black transition-colors duration-500">
      {/* Background Media Container */}
      <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black transition-colors duration-500">
        {mediaType === "video" && videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center rounded-none scale-100"
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={currentImage}
              alt="NXT Hero — Premium Fashion"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.8 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full object-cover object-center rounded-none scale-100"
            />
          </AnimatePresence>
        )}

        {/* Full-bleed gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 dark:from-black/40 dark:via-transparent dark:to-black/70 pointer-events-none" />
      </div>

      {/* Sleek Minimal Subtitle */}
      <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10 text-center text-black dark:text-white pointer-events-none">
        <motion.p
          className="text-xs md:text-sm font-bold tracking-[0.6em] uppercase text-black/70 dark:text-white/80 drop-shadow-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {settings?.heroTagline || "next is yours"}
        </motion.p>
      </div>

      {/* 21st.dev Magic UI Shimmer 3D CTA Button - Positioned in lower third */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative group"
        >
          {/* Ambient Gold Glow Backing Flare */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-full blur-lg opacity-60 group-hover:opacity-100 group-hover:blur-xl transition-all duration-500 animate-pulse" />

          {/* Main Shimmer Gold Button */}
          <motion.button
            onClick={handleScroll}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black px-10 py-4.5 rounded-full font-black text-sm tracking-wider uppercase shadow-[0_20px_50px_rgba(212,175,55,0.4)] border border-amber-300/50 overflow-hidden transition-colors"
          >
            {/* Moving Shimmer Light Ray */}
            <motion.div
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg]"
              initial={{ x: "-150%" }}
              animate={{ x: "250%" }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "linear", repeatDelay: 1 }}
            />

            <ShoppingBag size={18} className="relative z-10 text-black group-hover:scale-110 transition-transform duration-300" />
            
            <span className="relative z-10 font-extrabold text-base">
              {settings?.heroButtonText || "تسوق الآن — SHOP NOW"}
            </span>

            <ArrowRight
              size={18}
              className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-300 text-black"
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-black/50 dark:text-white/50 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="text-[10px] font-extrabold tracking-[0.3em] uppercase text-black/70 dark:text-white/70">Scroll</span>
        <motion.div
          className="w-[2px] h-8 bg-gradient-to-b from-black/60 to-transparent dark:from-white/60 dark:to-transparent rounded-full"
          animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
