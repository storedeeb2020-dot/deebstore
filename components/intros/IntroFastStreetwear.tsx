"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroFastStreetwear({ onComplete }: { onComplete: () => void }) {
  const [flashIndex, setFlashIndex] = useState(0);
  const [phase, setPhase] = useState<"cuts" | "logo" | "exit">("cuts");

  // Fast cuts storyboard timing (<0.3s per cut)
  useEffect(() => {
    const flashInterval = setInterval(() => {
      setFlashIndex((prev) => (prev < 8 ? prev + 1 : prev));
    }, 280);

    const t1 = setTimeout(() => {
      clearInterval(flashInterval);
      setPhase("logo");
    }, 2600); // 2.6s: Cuts stop, NXT Logo appears with bass impact

    const t2 = setTimeout(() => setPhase("exit"), 5200); // 5.2s: Transition to homepage
    const t3 = setTimeout(() => onComplete(), 6000);   // 6.0s: Finish

    return () => {
      clearInterval(flashInterval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          className="fixed inset-0 bg-[#020203] z-[99999] flex flex-col items-center justify-center overflow-hidden select-none font-sans"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] },
          }}
        >
          {/* Phase 1: Fast Cinematic Cuts (<0.3s) with Camera Flashes */}
          {phase === "cuts" && (
            <div className="absolute inset-0 z-0 flex items-center justify-center">
              {/* Camera Strobe Flash Overlay */}
              <motion.div
                key={`flash-${flashIndex}`}
                className="absolute inset-0 bg-white/30 z-20 pointer-events-none"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />

              {/* Macro Streetwear Visual Slides */}
              <motion.div
                key={`slide-${flashIndex}`}
                initial={{ scale: 1.15, filter: "brightness(1.5) contrast(1.2)" }}
                animate={{ scale: 1, filter: "brightness(1) contrast(1)" }}
                className="relative w-full h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-10" />
                
                {/* Micro Close-Up Fashion Texture Simulation */}
                <div className="w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {flashIndex % 3 === 0 && (
                      <div className="text-center space-y-2">
                        <span className="text-8xl font-black text-white/90 tracking-tighter uppercase italic">HOODIE</span>
                        <p className="text-xs text-amber-400 font-mono tracking-widest">HEAVYWEIGHT 500GSM COTTON</p>
                      </div>
                    )}
                    {flashIndex % 3 === 1 && (
                      <div className="text-center space-y-2">
                        <span className="text-8xl font-black text-white/90 tracking-tighter uppercase italic">HARDWARE</span>
                        <p className="text-xs text-amber-400 font-mono tracking-widest">GUNMETAL ZIPPER & EMBROIDERY</p>
                      </div>
                    )}
                    {flashIndex % 3 === 2 && (
                      <div className="text-center space-y-2">
                        <span className="text-8xl font-black text-white/90 tracking-tighter uppercase italic">FOOTWEAR</span>
                        <p className="text-xs text-amber-400 font-mono tracking-widest">MINIMALIST LUXURY SNEAKERS</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Phase 2: All Motion Stops -> NXT Logo & Slogan */}
          <AnimatePresence>
            {phase === "logo" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 flex flex-col items-center justify-center gap-6 px-4 text-center"
              >
                <div className="relative w-[300px] sm:w-[460px] h-[140px] sm:h-[210px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/intro.png"
                    alt="NXT Logo"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo.png";
                    }}
                    className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(255,255,255,0.9)] invert dark:invert-0"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex flex-col items-center gap-2"
                >
                  <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-white drop-shadow-[0_0_15px_white]">
                    PREMIUM STREETWEAR
                  </p>
                  <span className="w-16 h-[2px] bg-gradient-to-r from-amber-400 to-amber-200 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
