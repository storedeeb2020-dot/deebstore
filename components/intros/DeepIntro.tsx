"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroProps {
  onComplete: () => void;
}

export function DeepIntro({ onComplete }: IntroProps) {
  const [isExiting, setIsExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Canvas particle background animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Create floating light particles
    const particles = Array.from({ length: 65 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.5) * 0.6,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffffff";
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // Auto complete intro after 3.2 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onComplete();
      }, 700);
    }, 3200);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [onComplete]);

  const letters = ["E", "L", "D", "E", "E", "B", "\u00A0", "S", "T", "O", "R", "E"];

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="deep-store-new-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] bg-black text-white overflow-hidden select-none flex items-center justify-center font-sans dir-ltr"
          dir="ltr"
        >
          {/* Particle Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

          {/* Central Radial Glowing Halo */}
          <div className="absolute w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,transparent_70%)] blur-[70px] animate-pulse pointer-events-none z-0" />

          {/* Animated Brand Logo Container */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4">
            {/* Animated Title Letters with Wolf Overlay */}
            <div className="relative flex items-center justify-center overflow-hidden py-4 px-6">
              {/* Wolf Running Effect Across Logo */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none z-20 bg-contain bg-center bg-no-repeat filter drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]"
                style={{
                  backgroundImage: "url('/api/wolf-icon')",
                  animation: "wolfRun 2.2s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards",
                }}
              />

              {/* Letters */}
              <div className="relative flex items-center gap-1 sm:gap-2.5 z-10">
                {letters.map((letter, i) => (
                  <span
                    key={i}
                    style={{
                      animationDelay: `${0.12 * i + 0.1}s`,
                    }}
                    className="inline-block text-white font-black text-3xl sm:text-6xl tracking-wider opacity-0 animate-[letter_0.8s_forwards] will-change-transform"
                  >
                    {letter}
                  </span>
                ))}
              </div>

              {/* Shimmer Light Streak */}
              <div
                className="absolute top-0 -left-[35%] w-[25%] h-full pointer-events-none z-30 bg-gradient-to-r from-transparent via-white/90 to-transparent -skew-x-[25deg]"
                style={{
                  animation: "shine 1.3s linear 1.8s forwards",
                }}
              />
            </div>


          </div>

          {/* Custom Inline CSS Animations */}
          <style jsx global>{`
            @keyframes letter {
              0% {
                opacity: 0;
                transform: translateY(90px) scale(0.5);
                filter: blur(20px);
              }
              60% {
                opacity: 1;
                transform: translateY(-8px) scale(1.08);
                filter: blur(4px);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
                filter: blur(0);
                text-shadow: 0 0 12px #fff, 0 0 24px rgba(255, 255, 255, 0.6);
              }
            }

            @keyframes wolfRun {
              0% {
                left: -80px;
                opacity: 0;
                transform: translateY(-50%) scale(0.7);
              }
              25% {
                opacity: 1;
              }
              50% {
                transform: translateY(-50%) scale(1.2);
              }
              100% {
                left: calc(100% + 80px);
                opacity: 0;
                transform: translateY(-50%) scale(0.8);
              }
            }

            @keyframes shine {
              from {
                left: -35%;
              }
              to {
                left: 135%;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
