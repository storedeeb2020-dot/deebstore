"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { getSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";

export function HeroSection() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (settings?.heroImagesDark && settings.heroImagesDark.length > 1) {
      const interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % settings.heroImagesDark!.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [settings?.heroImagesDark]);

  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {settings?.heroMediaType === "video" ? (
          <video
            src={settings?.heroVideoUrlDark || settings?.heroVideoUrlLight || "https://res.cloudinary.com/aqszlz7k/video/upload/12_zsnepl.mp4"}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-45"
          />
        ) : settings?.heroImagesDark && settings.heroImagesDark.length > 0 ? (
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={settings.heroImagesDark[activeImageIndex]}
                alt="Hero Background"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.45, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
          </div>
        ) : (
          <div className="w-full h-full bg-black" />
        )}
        
        {/* Dark vignette overlay for luxury feel and readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80 pointer-events-none" />
      </div>

      {/* Brand Central Hero Tagline & Subtitle */}
      <div className="relative z-10 text-center px-4 -mt-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/logo.png"
          alt="DEEP STORE"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="h-20 sm:h-28 w-auto mx-auto object-contain mb-5"
        />
        <motion.p
          className="text-base sm:text-lg font-black tracking-widest text-amber-400"
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
          {/* Pulsing Backing Ambient Glow */}
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-600/10 blur-xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 pointer-events-none" />

          {/* Main Luxury Button */}
          <motion.button
            onClick={handleScroll}
            whileHover="hover"
            whileTap={{ scale: 0.96 }}
            variants={{
              hover: {
                scale: 1.05,
                y: -3,
                transition: { type: "spring", stiffness: 350, damping: 16 }
              }
            }}
            className="relative inline-flex items-center justify-center p-[1.5px] rounded-full overflow-hidden bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-pointer select-none border-none outline-none z-10 transition-shadow duration-300"
          >
            {/* 1. Conic gradient border trace layer */}
            <motion.div
              className="absolute w-[300%] h-[300%] -left-[100%] -top-[100%] bg-[conic-gradient(from_0deg,transparent_35%,#f59e0b_50%,transparent_65%)] pointer-events-none z-0"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
            />

            {/* 2. Inner Button Container */}
            <div className="relative w-full h-full bg-zinc-950 rounded-full px-10 py-4 flex items-center gap-3.5 overflow-hidden z-10">
              
              {/* Liquid Gold Background Sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 origin-left z-0 pointer-events-none"
                initial={{ scaleX: 0 }}
                variants={{
                  hover: { scaleX: 1 }
                }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Shimmer sheen gloss reflection */}
              <motion.div
                className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none z-10"
                initial={{ left: "-50%" }}
                variants={{
                  hover: { left: "150%" }
                }}
                transition={{ duration: 0.85, ease: "easeInOut" }}
              />

              {/* Shopping Bag Icon with kinetic hover bounce */}
              <motion.div
                className="relative z-10 flex items-center justify-center"
                variants={{
                  hover: { y: [0, -3, 1, -1, 0], rotate: [0, -8, 6, -3, 0] }
                }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
              >
                <ShoppingBag
                  size={18}
                  className="text-amber-400 group-hover:text-black transition-colors duration-300"
                />
              </motion.div>
              
              {/* Text with dynamic color transition */}
              <span className="relative z-10 font-bold text-sm sm:text-base text-amber-400 group-hover:text-black transition-colors duration-300 tracking-wide">
                {settings?.heroButtonText || "تسوق الآن — SHOP NOW"}
              </span>

              {/* Arrow icon with spring translation */}
              <motion.div
                className="relative z-10 flex items-center justify-center"
                variants={{
                  hover: { x: 5 }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <ArrowRight
                  size={18}
                  className="text-amber-400 group-hover:text-black transition-colors duration-300"
                />
              </motion.div>
            </div>
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
