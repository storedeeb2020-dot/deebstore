"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { getSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";
import { useTheme } from "@/features/theme/ThemeProvider";

const DEFAULT_VIDEO_URL = "https://res.cloudinary.com/aqszlz7k/video/upload/12_zsnepl.mp4";

export function HeroSection() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string>(DEFAULT_VIDEO_URL);
  const { theme } = useTheme();

  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) {
          setSettings(data);
          const validUrl = data.heroVideoUrlDark?.trim() || data.heroVideoUrlLight?.trim() || DEFAULT_VIDEO_URL;
          setVideoSrc(validUrl);
        }
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

  // Enable video mode whenever video is set or no image list exists
  const isVideoMode =
    settings?.heroMediaType === "video" ||
    !settings?.heroMediaType ||
    (settings?.heroMediaType === "image" && activeImageList.length === 0);

  // Force play on all video elements
  useEffect(() => {
    const triggerPlay = (v: HTMLVideoElement | null) => {
      if (v) {
        v.muted = true;
        v.playsInline = true;
        v.setAttribute("muted", "true");
        v.setAttribute("playsinline", "true");
        v.play().catch(() => {});
      }
    };

    triggerPlay(desktopVideoRef.current);
    triggerPlay(mobileVideoRef.current);

    const handleUserTouch = () => {
      triggerPlay(desktopVideoRef.current);
      triggerPlay(mobileVideoRef.current);
    };

    window.addEventListener("touchstart", handleUserTouch, { once: true });
    window.addEventListener("click", handleUserTouch, { once: true });

    return () => {
      window.removeEventListener("touchstart", handleUserTouch);
      window.removeEventListener("click", handleUserTouch);
    };
  }, [videoSrc, isVideoMode]);

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
      {/* ─── 1. DESKTOP / TABLET HERO VIEW (Pure Uncovered Video) ─── */}
      <section className="hidden md:flex relative h-screen w-full overflow-hidden bg-black flex-col items-center justify-center">
        {/* Background Video Layer */}
        <div className="absolute inset-0 z-0 bg-black">
          {isVideoMode ? (
            <video
              ref={desktopVideoRef}
              key={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={() => {
                console.warn("Video failed, switching to default working video");
                setVideoSrc(DEFAULT_VIDEO_URL);
              }}
              onCanPlay={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => {});
              }}
              className="w-full h-full object-cover"
            >
              <source src={videoSrc} type="video/mp4" />
              <source src={videoSrc} />
            </video>
          ) : activeImageList && activeImageList.length > 0 ? (
            <div className="relative w-full h-full bg-black">
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
            <div className="w-full h-full bg-black" />
          )}
        </div>

        {/* Brand Central Hero Content */}
        <div className="relative z-10 text-center px-4 -mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src="/logo.png"
            alt="DEEB STORE"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="h-24 lg:h-32 w-auto mx-auto object-contain mb-5 drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)]"
          />
          <motion.div
            className="text-lg lg:text-xl font-black tracking-widest text-amber-400 flex items-center justify-center gap-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
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
            className="relative inline-flex items-center justify-center p-[1.5px] rounded-full overflow-hidden bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.95)] cursor-pointer border-none outline-none z-10"
          >
            <div className="relative w-full h-full bg-zinc-950/90 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-400 hover:text-black rounded-full px-10 py-4 flex items-center gap-3.5 transition-all duration-300 group border border-amber-500/30">
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
      <section className="block md:hidden w-full bg-black overflow-hidden">
        {/* Top Part: 16:9 Aspect Video */}
        {isVideoMode && (
          <div className="w-full aspect-video bg-black relative overflow-hidden shadow-lg">
            <video
              ref={mobileVideoRef}
              key={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={() => setVideoSrc(DEFAULT_VIDEO_URL)}
              onCanPlay={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => {});
              }}
              className="w-full h-full object-cover"
            >
              <source src={videoSrc} type="video/mp4" />
              <source src={videoSrc} />
            </video>
          </div>
        )}

        {/* Bottom Part: Mobile Hero Banner Photo */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-6 pb-14 sm:pb-16 text-center z-10">
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-amber-400 font-extrabold text-xs sm:text-sm tracking-wider mb-3.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center gap-1.5"
            >
              {settings?.heroTagline || "ديب ستور — عالم الموضة والستريت وير الفاخر 🐺"}
            </motion.p>

            {/* Luxury Animated CTA Button for Mobile */}
            <motion.button
              onClick={handleScroll}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-black font-black text-xs sm:text-sm rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.4)] border border-amber-300/50 flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden group"
            >
              {/* Subtle shimmer animation overlay */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/30 -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

              <ShoppingBag size={18} className="text-black flex-shrink-0" />
              <span className="tracking-wide flex-1 text-center font-black">
                {settings?.heroButtonText || "تسوق الآن — SHOP NOW"}
              </span>
              <ArrowRight size={18} className="text-black flex-shrink-0" />
            </motion.button>
          </div>
        </div>
      </section>
    </>
  );
}
