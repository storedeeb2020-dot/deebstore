"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroCyberLuxury({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"particles" | "logo" | "model" | "exit">("particles");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("logo"), 2000);   // 2.0s: Particles gather into NXT Logo
    const t2 = setTimeout(() => setPhase("model"), 4500);  // 4.5s: Particles transform into fashion model
    const t3 = setTimeout(() => setPhase("exit"), 6800);   // 6.8s: Dissolve to homepage
    const t4 = setTimeout(() => onComplete(), 7600);      // 7.6s: Complete

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          className="fixed inset-0 bg-[#020202] z-[99999] flex flex-col items-center justify-center overflow-hidden select-none font-sans"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.9, ease: [0.77, 0, 0.175, 1] },
          }}
        >
          {/* Ambient Lighting Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 45 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: i % 3 === 0 ? "#fbbf24" : "#ffffff",
                  top: `${(i * 11) % 100}%`,
                  left: `${(i * 17) % 100}%`,
                  boxShadow: i % 3 === 0 ? "0 0 10px rgba(251,191,36,0.8)" : "0 0 10px rgba(255,255,255,0.8)",
                }}
                animate={
                  phase === "particles"
                    ? {
                        y: [-40, 40, -40],
                        x: [-20, 20, -20],
                        opacity: [0.1, 0.8, 0.1],
                      }
                    : {
                        x: 0,
                        y: 0,
                        opacity: [0.8, 1, 0.3],
                        scale: [1, 1.4, 1],
                      }
                }
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }}
              />
            ))}
          </div>

          {/* Phase 2: Logo Formation from Particles */}
          <AnimatePresence>
            {(phase === "logo" || phase === "model") && (
              <motion.div
                className="relative z-10 flex flex-col items-center justify-center gap-6"
                initial={{ opacity: 0, scale: 0.7, filter: "blur(20px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative w-[300px] sm:w-[460px] h-[140px] sm:h-[210px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/intro.png"
                    alt="NXT Particle Logo"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo.png";
                    }}
                    className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(255,255,255,0.95)] invert dark:invert-0"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 3: Streetwear Model Reveal */}
          <AnimatePresence>
            {phase === "model" && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-0"
                initial={{ opacity: 0, scale: 1.1, filter: "blur(15px)" }}
                animate={{ opacity: 0.55, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.8, ease: "easeOut" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/banner.png"
                  alt="NXT Minimalist Streetwear Model"
                  className="w-full h-full object-cover object-center brightness-90 contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-[#020202]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
