"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

interface NXTIntroProps {
  onComplete: () => void;
}

export function NXTIntro({ onComplete }: NXTIntroProps) {
  const [phase, setPhase] = useState<"ignite" | "reveal" | "exit">("ignite");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas particle & laser grid system
  useEffect(() => {
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

    // Particles setup
    const particleCount = Math.min(Math.floor(width / 12), 70);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.8 - 0.2,
      opacity: Math.random() * 0.7 + 0.3,
      pulse: Math.random() * 0.05 + 0.01,
    }));

    // Rays setup
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Radial background light glow
      const cx = width / 2;
      const cy = height / 2;
      const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.6);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.08)");
      gradient.addColorStop(0.4, "rgba(245, 158, 11, 0.03)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Rotating subtle light rays
      angle += 0.003;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos((i * Math.PI) / 6) * width, Math.sin((i * Math.PI) / 6) * width);
        ctx.stroke();
      }
      ctx.restore();

      // Render floating particle dust
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += Math.sin(Date.now() * 0.002) * p.pulse;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0 || p.x > width) p.x = Math.random() * width;

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(0.9, p.opacity))})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Particle glow
        ctx.shadowBlur = p.size * 6;
        ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Timeline sequences — runs once cleanly without timer cancellations
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1200);
    const t2 = setTimeout(() => setPhase("exit"), 3800);
    const t3 = setTimeout(() => {
      onCompleteRef.current();
    }, 4400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleSkip = () => {
    setPhase("exit");
    setTimeout(() => {
      onCompleteRef.current();
    }, 300);
  };

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          key="nxt-luxury-intro"
          className="fixed inset-0 z-[99999] bg-black text-white overflow-hidden select-none flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.6, ease: [0.77, 0, 0.175, 1] } }}
        >
          {/* Canvas WebGL/2D Animated Background */}
          <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

          {/* Top Brand Line Grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-1" />

          {/* Subtle Ambient Soundwave Visual lines */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-10 pointer-events-none opacity-20 z-2">
            <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
            <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
          </div>

          {/* ── CENTRAL HERO BRAND DISPLAY ── */}
          <div className="relative z-10 text-center flex flex-col items-center justify-center px-4">
            
            {/* STAGE 1: Light Beam / Flash Ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: phase === "ignite" ? [0, 1.4, 1] : 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center mb-6"
            >
              {/* Outer Pulsing Chrome Ring */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-white/20 dark:border-white/30 flex items-center justify-center relative shadow-[0_0_80px_rgba(255,255,255,0.15)] bg-black/40 backdrop-blur-md">
                <motion.div
                  className="absolute inset-0 rounded-full border border-amber-400/40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />

                {/* Main Logo Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="NXT"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/intro.png";
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain invert drop-shadow-[0_0_25px_rgba(255,255,255,0.9)]"
                />
              </div>
            </motion.div>

            {/* STAGE 2: Brand Title reveal */}
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
              animate={{
                opacity: phase === "reveal" || phase === "ignite" ? 1 : 0,
                y: phase === "reveal" || phase === "ignite" ? 0 : -20,
                filter: phase === "reveal" || phase === "ignite" ? "blur(0px)" : "blur(10px)",
              }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 uppercase drop-shadow-[0_0_35px_rgba(255,255,255,0.5)]">
                NXT ERA
              </h1>

              <div className="flex items-center justify-center gap-3">
                <span className="h-[1px] w-8 bg-amber-400/60" />
                <p className="text-[11px] sm:text-xs font-bold tracking-[0.4em] text-amber-400/90 uppercase">
                  THE FUTURE OF LUXURY FASHION
                </p>
                <span className="h-[1px] w-8 bg-amber-400/60" />
              </div>
            </motion.div>
          </div>

          {/* ── TOP CORNER BADGE ── */}
          <div className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white/50 text-[10px] font-mono tracking-widest uppercase">
            <Sparkles size={12} className="text-amber-400" />
            <span>NXT • OFFICIAL EXPERIENCE</span>
          </div>

          {/* ── BOTTOM RIGHT SKIP BUTTON ── */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute bottom-8 right-8 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold tracking-wider backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-2xl"
          >
            <span>تخطي</span>
            <ArrowRight size={14} />
          </button>

          {/* ── BOTTOM PROGRESS LINE ── */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-white to-amber-400"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
