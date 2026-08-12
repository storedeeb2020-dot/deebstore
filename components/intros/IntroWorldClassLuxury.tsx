"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroWorldClassLuxury({ onComplete }: { onComplete: () => void }) {
  const [scene, setScene] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(1);

  // Audio Synthesizer for Sub-Bass and Hit Effects
  useEffect(() => {
    const playBassRise = () => {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(30, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 5.5);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 4);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 8);
      } catch {}
    };

    playBassRise();
  }, []);

  // 12-Second Master Cinematic Timeline
  useEffect(() => {
    const t1 = setTimeout(() => setScene(2), 1500);   // 1.5s: Black Marble Floor
    const t2 = setTimeout(() => setScene(3), 3000);   // 3.0s: Micro Liquid Chrome Droplet
    const t3 = setTimeout(() => setScene(4), 4500);   // 4.5s: Reverse Gravity Particle Explosion
    const t4 = setTimeout(() => setScene(5), 6000);   // 6.0s: N X T Magnetic Assembly
    const t5 = setTimeout(() => setScene(6), 7500);   // 7.5s: Matte White Logo & Orbit
    const t6 = setTimeout(() => setScene(7), 9000);   // 9.0s: Black Cotton Fabric Macro
    const t7 = setTimeout(() => setScene(8), 10500);  // 10.5s: Fashion Model & Museum Concrete
    const t8 = setTimeout(() => setScene(9), 11500);  // 11.5s: Scale into Navbar & Exit
    const t9 = setTimeout(() => onComplete(), 12200); // 12.2s: Complete

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
      clearTimeout(t9);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {scene !== 9 ? (
        <motion.div
          className="fixed inset-0 bg-[#010102] z-[99999] flex flex-col items-center justify-center overflow-hidden select-none font-sans"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.9, ease: [0.77, 0, 0.175, 1] },
          }}
        >
          {/* SCENE 01 (0.0s - 1.5s): Absolute Darkness & Volumetric Dust */}
          {scene === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                className="w-[700px] h-[700px] rounded-full bg-white/[0.02] blur-[160px]"
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {Array.from({ length: 25 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/40 rounded-full"
                  style={{ top: `${(i * 13) % 100}%`, left: `${(i * 19) % 100}%` }}
                  animate={{ y: [-20, 20, -20], opacity: [0.1, 0.6, 0.1] }}
                  transition={{ duration: 3, delay: i * 0.1, repeat: Infinity }}
                />
              ))}
            </motion.div>
          )}

          {/* SCENE 02 (1.5s - 3.0s): Polished Black Marble Floor & Gold Veins */}
          {scene === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-[#010102] to-black flex items-center justify-center"
            >
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(245,158,11,0.2) 0%, transparent 60%)`,
                }}
              />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-mono tracking-[0.8em] text-amber-400/80 uppercase"
              >
                BLACK MARBLE ARCHITECTURE
              </motion.p>
            </motion.div>
          )}

          {/* SCENE 03 (3.0s - 4.5s): Microscopic Liquid Chrome Droplet */}
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-zinc-300 via-white to-zinc-600 shadow-[0_0_50px_rgba(255,255,255,0.9)] border border-white/40"
                animate={{ scale: [0.98, 1.05, 0.98] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-[10px] font-mono tracking-[0.6em] text-zinc-400 uppercase">
                FLUID CHROME SURFACE
              </span>
            </motion.div>
          )}

          {/* SCENE 04 (4.5s - 6.0s): Reverse Gravity Particle Explosion */}
          {scene === 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              {Array.from({ length: 45 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-t from-white to-zinc-400 rounded-full shadow-[0_0_12px_white]"
                  style={{ top: `${50 + (i % 2 === 0 ? i * 2.5 : -i * 2.5)}%`, left: `${(i * 21) % 100}%` }}
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: -250, opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
                  transition={{ duration: 1.4, delay: i * 0.03, repeat: Infinity }}
                />
              ))}
            </motion.div>
          )}

          {/* SCENE 05 & 06 (6.0s - 9.0s): Magnetic Assembly & Matte White Logo Orbit */}
          {(scene === 5 || scene === 6) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 flex flex-col items-center justify-center gap-6"
            >
              <motion.div
                animate={{ rotateY: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-[320px] sm:w-[500px] h-[150px] sm:h-[220px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/intro.png"
                  alt="NXT Logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                  className="w-full h-full object-contain filter drop-shadow-[0_0_40px_white] invert dark:invert-0"
                />
              </motion.div>
              <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-white drop-shadow-[0_0_15px_white]">
                NXT MONOLITH
              </p>
            </motion.div>
          )}

          {/* SCENE 07 (9.0s - 10.5s): Black Premium Cotton Fabric Macro */}
          {scene === 7 && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 z-0 bg-zinc-950 flex items-center justify-center"
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, #333 0, #333 1px, transparent 0, transparent 50%)`,
                  backgroundSize: "8px 8px",
                }}
              />
              <span className="text-xs font-mono tracking-[0.7em] text-zinc-300 uppercase z-10">
                PREMIUM COTTON FIBERS
              </span>
            </motion.div>
          )}

          {/* SCENE 08 (10.5s - 11.5s): Luxury Fashion Model & Concrete Museum */}
          {scene === 8 && (
            <motion.div
              initial={{ opacity: 0, scale: 1.15 }}
              animate={{ opacity: 0.75, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/banner.png"
                alt="NXT Model"
                className="w-full h-full object-cover object-center brightness-90 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#010102] via-transparent to-[#010102]" />
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
