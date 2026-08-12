"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroAppleMinimal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<"dark" | "n" | "x" | "t" | "merge" | "slogan" | "exit">("dark");

  useEffect(() => {
    const t0 = setTimeout(() => setStep("n"), 400);        // 0.4s: N appears
    const t1 = setTimeout(() => setStep("x"), 1100);       // 1.1s: X appears
    const t2 = setTimeout(() => setStep("t"), 1800);       // 1.8s: T appears
    const t3 = setTimeout(() => setStep("merge"), 2500);   // 2.5s: Merge into full NXT Logo
    const t4 = setTimeout(() => setStep("slogan"), 3800);  // 3.8s: Slogan & Line reveal
    const t5 = setTimeout(() => setStep("exit"), 5200);    // 5.2s: Transition to header
    const t6 = setTimeout(() => onComplete(), 6000);       // 6.0s: Finish

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {step !== "exit" ? (
        <motion.div
          className="fixed inset-0 bg-[#020202] z-[99999] flex flex-col items-center justify-center overflow-hidden select-none"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] },
          }}
        >
          {/* Ambient Lighting Volumetric Glow */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              className="w-[600px] h-[600px] rounded-full bg-white/5 blur-[140px]"
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Letter Sequential Reveal: N -> X -> T */}
          <div className="relative z-10 flex items-center justify-center h-44">
            {step !== "merge" && step !== "slogan" && (
              <div className="flex items-center gap-6 text-6xl md:text-8xl font-black text-white tracking-widest">
                <AnimatePresence>
                  {(step === "n" || step === "x" || step === "t") && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5, filter: "blur(15px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.5 }}
                      className="drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]"
                    >
                      N
                    </motion.span>
                  )}
                  {(step === "x" || step === "t") && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5, filter: "blur(15px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.5 }}
                      className="drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]"
                    >
                      X
                    </motion.span>
                  )}
                  {step === "t" && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5, filter: "blur(15px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.5 }}
                      className="drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]"
                    >
                      T
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Merged Full Logo */}
            {(step === "merge" || step === "slogan") && (
              <motion.div
                initial={{ opacity: 0, scale: 1.15, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-[280px] sm:w-[420px] h-[120px] sm:h-[180px] flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/intro.png"
                  alt="NXT Logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                  className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(255,255,255,0.9)] invert dark:invert-0"
                />
              </motion.div>
            )}
          </div>

          {/* Slogan & Horizontal Thin White Line */}
          <AnimatePresence>
            {step === "slogan" && (
              <motion.div
                className="relative z-10 flex flex-col items-center gap-3 mt-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-xs md:text-sm font-bold tracking-[0.6em] uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                  DEFINE YOUR STYLE
                </p>

                {/* Thin horizontal expanding line */}
                <motion.div
                  className="h-[1px] bg-white shadow-[0_0_10px_white]"
                  initial={{ width: "0%" }}
                  animate={{ width: "180px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
