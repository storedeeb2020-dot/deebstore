"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSiteSettings } from "@/lib/firebase/firestore";

export function IntroArchitecturalCathedral({ onComplete }: { onComplete: () => void }) {
  const [scene, setScene] = useState<1 | 2 | 3 | 4>(1);
  const [introImages, setIntroImages] = useState<string[]>(["/banner.png"]);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);

  // Fetch Dedicated Admin Intro Images from Firestore
  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data?.introImages?.length) {
          setIntroImages(data.introImages);
        } else if (data?.heroImagesDark?.length) {
          setIntroImages(data.heroImagesDark);
        }
      })
      .catch(console.error);
  }, []);

  // Audio Synthesizer for Sub-Bass & Glass Echo
  useEffect(() => {
    const playGlassResonance = () => {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(32, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 3.5);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 2.5);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 5.5);
      } catch {}
    };

    playGlassResonance();
  }, []);

  // Storyboard Scene Transitions
  useEffect(() => {
    const t1 = setTimeout(() => setScene(2), 1200);   // 1.2s: Reveal Brand Title & NXT Logo
    const t2 = setTimeout(() => setScene(3), 3600);   // 3.6s: Photos Reveal
    const t3 = setTimeout(() => setScene(4), 6200);   // 6.2s: Exit & Complete
    const t4 = setTimeout(() => onComplete(), 7000);  // 7.0s: Complete

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
    };
  }, [onComplete]);

  // Slideshow for Dedicated Intro Background Images
  useEffect(() => {
    if (scene === 3 && introImages.length > 1) {
      const interval = setInterval(() => {
        setActiveImgIndex((prev) => (prev + 1) % introImages.length);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [scene, introImages.length]);

  const currentIntroImg = introImages[activeImgIndex % introImages.length] || "/banner.png";

  return (
    <AnimatePresence>
      {scene !== 4 ? (
        <motion.div
          className="fixed inset-0 bg-[#010102] z-[99999] flex flex-col items-center justify-center overflow-hidden select-none font-sans"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.9, ease: [0.77, 0, 0.175, 1] },
          }}
        >
          {/* ALWAYS VISIBLE FULLSCREEN FLOATING STARRY PARTICLE FIELD (EXACTLY MATCHING USER SCREENSHOT) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <motion.div
              className="w-[700px] h-[700px] rounded-full bg-white/[0.035] blur-[150px]"
              animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.95, 1.15, 0.95] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {Array.from({ length: 35 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/80 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                style={{
                  top: `${(i * 19) % 95 + 2}%`,
                  left: `${(i * 29) % 95 + 2}%`,
                }}
                animate={{
                  y: [-12, 12, -12],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.7, 1.5, 0.7],
                }}
                transition={{
                  duration: 2.2,
                  delay: (i % 7) * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* BRAND TITLE & LOGO AT THE VERY TOP (Appears in Scene 2) */}
          {(scene === 2 || scene === 3) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute top-8 left-0 right-0 z-30 flex items-center justify-center gap-3 pointer-events-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="NXT Logo"
                className="h-7 w-auto object-contain invert drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              />
              <span className="text-xl font-black tracking-[0.3em] text-white uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]">
                NXT
              </span>
            </motion.div>
          )}

          {/* SCENE 02: CENTRAL MAIN NXT BRAND LOGO REVEAL */}
          {scene === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.75, filter: "blur(18px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 w-[300px] sm:w-[480px] h-[150px] sm:h-[220px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/intro.png"
                alt="NXT Brand Logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
                className="w-full h-full object-contain filter drop-shadow-[0_0_45px_white] invert dark:invert-0"
              />
            </motion.div>
          )}

          {/* SCENE 03: DEDICATED INTRO PHOTOS BACKGROUND WITH FROSTED GLASS BLUR */}
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 1.15, filter: "blur(20px)" }}
              animate={{ opacity: 0.85, scale: 1, filter: "blur(3px)" }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-0"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIntroImg}
                  src={currentIntroImg}
                  alt="NXT Intro Photo"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.5 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full object-cover object-center brightness-90 contrast-125"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[#010102] via-transparent to-[#010102]" />
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
