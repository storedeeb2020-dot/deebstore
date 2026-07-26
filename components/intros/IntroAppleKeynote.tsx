"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroAppleKeynote({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<"silence" | "nxt" | "statement1" | "statement2" | "exit">("silence");

  useEffect(() => {
    const t0 = setTimeout(() => setStep("nxt"), 1000);         // 1.0s: Silence then NXT fades in
    const t1 = setTimeout(() => setStep("statement1"), 2300);   // 2.3s: "Not Just Clothing."
    const t2 = setTimeout(() => setStep("statement2"), 3600);   // 3.6s: "A Statement."
    const t3 = setTimeout(() => setStep("exit"), 4400);         // 4.4s: Shrinks to navbar
    const t4 = setTimeout(() => onComplete(), 5000);            // 5.0s: Finish

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {step !== "exit" ? (
        <motion.div
          className="fixed inset-0 bg-[#000000] z-[99999] flex flex-col items-center justify-center overflow-hidden select-none font-sans"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.6, ease: [0.77, 0, 0.175, 1] },
          }}
        >
          {/* Main Content Assembly */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center">
            {step !== "silence" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1.08, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-[280px] sm:w-[420px] h-[120px] sm:h-[180px] flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/intro.png"
                  alt="NXT Logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                  className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(255,255,255,0.9)] invert dark:invert-0"
                />
              </motion.div>
            )}

            {/* Sequential Apple Keynote Statements */}
            <div className="h-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {step === "statement1" && (
                  <motion.p
                    key="stmt1"
                    initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
                    transition={{ duration: 0.5 }}
                    className="text-sm sm:text-base font-bold tracking-[0.5em] uppercase text-zinc-300 drop-shadow-md"
                  >
                    Not Just Clothing.
                  </motion.p>
                )}

                {step === "statement2" && (
                  <motion.p
                    key="stmt2"
                    initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
                    transition={{ duration: 0.5 }}
                    className="text-base sm:text-lg font-black tracking-[0.6em] uppercase text-white drop-shadow-[0_0_20px_white]"
                  >
                    A Statement.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
