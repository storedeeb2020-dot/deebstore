"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { getSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";
import { useTheme } from "@/features/theme/ThemeProvider";

export function HeroSection() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(console.error);
  }, []);

  const activeImageList = useMemo(() => {
    return theme === "light"
      ? settings?.heroImagesLight && settings.heroImagesLight.length > 0
        ? settings.heroImagesLight
        : settings?.heroImagesDark || []
      : settings?.heroImagesDark && settings.heroImagesDark.length > 0
      ? settings.heroImagesDark
      : settings?.heroImagesLight || [];
  }, [theme, settings?.heroImagesLight, settings?.heroImagesDark]);

  useEffect(() => {
    if (activeImageList && activeImageList.length > 1) {
      const interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % activeImageList.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeImageList]);

  const activeVideoUrl =
    theme === "light"
      ? settings?.heroVideoUrlLight || settings?.heroVideoUrlDark || "https://res.cloudinary.com/aqszlz7k/video/upload/12_zsnepl.mp4"
      : settings?.heroVideoUrlDark || settings?.heroVideoUrlLight || "https://res.cloudinary.com/aqszlz7k/video/upload/12_zsnepl.mp4";

  const mobileHeroImage =
    settings?.heroMobileImageUrl ||
    (activeImageList && activeImageList.length > 0 ? activeImageList[0] : "");

  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("categories") || document.getElementById("products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ─── 1. DESKTOP / TABLET HERO VIEW (Full Screen Video Background) ─── */}
      <section className="hidden md:flex relative h-screen w-full overflow-hidden bg-white dark:bg-black transition-colors flex-col items-center justify-center">
        {/* Background Media */}
        <div className="absolute inset-0 z-0">
          {settings?.heroMediaType === "video" ? (
            <video
              key={activeVideoUrl}
              src={activeVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : activeImageList && activeImageList.length > 0 ? (
            <div className="relative w-full h-full">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${theme}-${activeImageIndex}`}
                  src={activeImageList[activeImageIndex]}
                  alt="Hero Background"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
          ) : (
            <div className="w-full h-full bg-white dark:bg-black" />
          )}
          {/* Subtle Dark Gradient Overlay for Desktop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </div>

        {/* Brand Central Hero Tagline & Subtitle */}
        <div className="relative z-10 text-center px-4 -mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src="/logo.png"
            alt="DEEP STORE"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="h-24 lg:h-32 w-auto mx-auto object-contain mb-5 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
          />
          <motion.div
            className="text-lg lg:text-xl font-black tracking-widest text-amber-400 flex items-center justify-center gap-2 drop-shadow-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {(!settings?.heroTagline || settings?.heroTagline.toLowerCase().includes("next")) ? (
              <span className="flex items-center gap-2">
                ديب ستور — عالم الموضة والستريت وير الفاخر
                <img src="/api/wolf-icon" alt="Wolf" className="w-5 h-5 object-contain invert mix-blend-screen" />
              </span>
            ) : (
              settings.heroTagline
            )}
          </motion.div>
        </div>

        {/* Luxury Royal Gold CTA Button */}
        <div className="relative z-20 mt-10">
          <motion.button
            onClick={handleScroll}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.96 }}
            className="relative inline-flex items-center justify-center p-[1.5px] rounded-full overflow-hidden bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-pointer border-none outline-none z-10"
          >
            <div className="relative w-full h-full bg-zinc-950 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-400 hover:text-black rounded-full px-10 py-4 flex items-center gap-3.5 transition-all duration-300 group">
              <ShoppingBag size={18} className="text-amber-400 group-hover:text-black transition-colors" />
              <span className="font-bold text-base text-amber-400 group-hover:text-black transition-colors tracking-wide">
                {settings?.heroButtonText || "تسوق الآن — SHOP NOW"}
              </span>
              <ArrowRight size={18} className="text-amber-400 group-hover:text-black transition-colors" />
            </div>
          </motion.button>
        </div>
      </section>

      {/* ─── 2. MOBILE HERO VIEW (Matches Town Team layout: 16:9 Video Top + Full Image Banner Below) ─── */}
      <section className="block md:hidden w-full bg-white dark:bg-black overflow-hidden transition-colors">
        {/* Top Part: 16:9 Aspect Video */}
        {settings?.heroMediaType === "video" && (
          <div className="w-full aspect-video bg-black relative overflow-hidden shadow-lg">
            <video
              key={activeVideoUrl}
              src={activeVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Bottom Part: Mobile Hero Banner Photo (Just like Town Team screenshot) */}
        <div className="relative w-full aspect-[4/5] sm:aspect-square bg-zinc-900 overflow-hidden">
          {mobileHeroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mobileHeroImage}
              alt="Mobile Hero Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-black flex items-center justify-center p-6 text-center">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto opacity-70" />
            </div>
          )}

          {/* Dark Overlay for Text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-center">
            {/* Tagline */}
            <p className="text-amber-400 font-extrabold text-xs tracking-wider mb-2 drop-shadow-md">
              {settings?.heroTagline || "ديب ستور — عالم الموضة والستريت وير الفاخر 🐺"}
            </p>

            {/* CTA Button for Mobile */}
            <button
              onClick={handleScroll}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag size={16} />
              <span>{settings?.heroButtonText || "تسوق الآن — SHOP NOW"}</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
