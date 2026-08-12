"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroFabricCraft({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"fabric" | "details" | "logo" | "slogan" | "exit">("fabric");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("details"), 2000);  // 2.0s: Macro stitching details
    const t2 = setTimeout(() => setPhase("logo"), 4200);     // 4.2s: Fabric fades to black, NXT logo appears
    const t3 = setTimeout(() => setPhase("slogan"), 5400);   // 5.4s: "Modern Luxury" slogan
    const t4 = setTimeout(() => setPhase("exit"), 6300);     // 6.3s: Transition
    const t5 = setTimeout(() => onComplete(), 7000);        // 7.0s: Complete

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          className="fixed inset-0 bg-[#040404] z-[99999] flex flex-col items-center justify-center overflow-hidden select-none font-sans"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.7, ease: [0.77, 0, 0.175, 1] },
          }}
        >
          {/* Phase 1 & 2: Macro Fabric Texture & Studio Lighting */}
          <AnimatePresence>
            {(phase === "fabric" || phase === "details") && (
              <motion.div
                className="absolute inset-0 z-0 overflow-hidden"
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 0.65, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
              >
                {/* Simulated Premium Cotton Fabric Wave Animation */}
                <motion.div
                  className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black relative flex items-center justify-center"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-zinc-950/80 to-black" />
                  
                  {/* Subtle Weave Texture Overlay */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, #222 0, #222 1px, transparent 0, transparent 50%)`,
                      backgroundSize: "10px 10px",
                    }}
                  />

                  {/* Macro Lighting Sweep */}
                  <motion.div
                    className="absolute w-[600px] h-[300px] bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent blur-[80px]"
                    animate={{
                      x: ["-100%", "100%"],
                      y: ["-50%", "50%"],
                    }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 3 & 4: NXT Logo & Modern Luxury Slogan with Emerald Highlights */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-4">
            {(phase === "logo" || phase === "slogan") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, filter: "blur(16px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-[280px] sm:w-[420px] h-[130px] sm:h-[190px] flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/intro.png"
                  alt="NXT Logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                  className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] invert dark:invert-0"
                />
              </motion.div>
            )}

            {phase === "slogan" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-xs md:text-sm font-extrabold tracking-[0.55em] uppercase text-white drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                  MODERN LUXURY
                </span>
                <span className="w-12 h-[2px] bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full" />
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
