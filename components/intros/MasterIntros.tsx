"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper audio synthesizer for sub-bass impact
function playSubBassHit(freq = 40, duration = 3.5) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + duration * 0.6);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

interface IntroProps {
  onComplete: () => void;
}

// 1. Liquid Chrome Genesis
export function Intro1_LiquidChrome({ onComplete }: IntroProps) {
  const [phase, setPhase] = useState<"pulse" | "particles" | "morph" | "freeze" | "exit">("pulse");

  useEffect(() => {
    playSubBassHit(35);
    const t1 = setTimeout(() => setPhase("particles"), 2000);
    const t2 = setTimeout(() => setPhase("morph"), 4000);
    const t3 = setTimeout(() => setPhase("freeze"), 7000);
    const t4 = setTimeout(() => setPhase("exit"), 9000);
    const t5 = setTimeout(() => onComplete(), 10000);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div className="fixed inset-0 bg-[#020202] z-[99999] flex flex-col items-center justify-center overflow-hidden select-none" exit={{ opacity: 0, transition: { duration: 0.9 } }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-white/10 to-transparent blur-[140px]" animate={{ rotate: [0, 360], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 10, repeat: Infinity }} />
          </div>

          {phase === "pulse" && (
            <motion.div className="w-10 h-10 rounded-full bg-gradient-to-r from-zinc-300 via-white to-zinc-500 shadow-[0_0_50px_rgba(255,255,255,0.9)]" animate={{ scale: [1, 2.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }} />
          )}

          {phase === "particles" && (
            <div className="absolute inset-0 flex items-center justify-center">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div key={i} className="absolute w-3 h-3 rounded-full bg-gradient-to-tr from-white via-zinc-300 to-zinc-600 shadow-[0_0_15px_white]" style={{ top: `${(i * 19) % 100}%`, left: `${(i * 23) % 100}%` }} initial={{ y: 200, opacity: 0 }} animate={{ y: -200, opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }} transition={{ duration: 3, delay: i * 0.05, repeat: Infinity }} />
              ))}
            </div>
          )}

          {(phase === "morph" || phase === "freeze") && (
            <motion.div initial={{ opacity: 0, scale: 0.7, filter: "blur(20px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} className="relative z-10 flex flex-col items-center gap-6">
              <div className="relative w-[320px] sm:w-[500px] h-[160px] sm:h-[230px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/intro.png" alt="NXT Chrome" className="w-full h-full object-contain filter drop-shadow-[0_0_45px_rgba(255,255,255,0.9)] invert dark:invert-0" />
              </div>
              <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-xs md:text-sm font-extrabold tracking-[0.6em] uppercase text-zinc-300">LIQUID CHROME GENESIS</motion.p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 2. Black Marble Temple
export function Intro2_BlackMarble({ onComplete }: IntroProps) {
  const [phase, setPhase] = useState<"corridor" | "fracture" | "chisel" | "veins" | "exit">("corridor");

  useEffect(() => {
    playSubBassHit(40);
    const t1 = setTimeout(() => setPhase("fracture"), 2000);
    const t2 = setTimeout(() => setPhase("chisel"), 4000);
    const t3 = setTimeout(() => setPhase("veins"), 6500);
    const t4 = setTimeout(() => setPhase("exit"), 9000);
    const t5 = setTimeout(() => onComplete(), 10000);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div className="fixed inset-0 bg-[#040405] z-[99999] flex flex-col items-center justify-center overflow-hidden select-none" exit={{ opacity: 0, transition: { duration: 0.9 } }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-[#040405] to-black" />
          
          {(phase === "chisel" || phase === "veins") && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 flex flex-col items-center gap-6">
              <div className="relative w-[320px] sm:w-[480px] h-[160px] sm:h-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/intro.png" alt="NXT Marble" className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(251,191,36,0.4)] invert dark:invert-0" />
              </div>
              <p className="text-xs md:text-sm font-extrabold tracking-[0.6em] uppercase text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">BLACK MARBLE TEMPLE</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 3. Infinite Mirror Room
export function Intro3_InfiniteMirror({ onComplete }: IntroProps) {
  const [phase, setPhase] = useState<"mirrors" | "reflect" | "kaleidoscope" | "exit">("mirrors");

  useEffect(() => {
    playSubBassHit(45);
    const t1 = setTimeout(() => setPhase("reflect"), 2000);
    const t2 = setTimeout(() => setPhase("kaleidoscope"), 5000);
    const t3 = setTimeout(() => setPhase("exit"), 8500);
    const t4 = setTimeout(() => onComplete(), 10000);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div className="fixed inset-0 bg-[#010102] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0, transition: { duration: 0.9 } }}>
          <div className="grid grid-cols-3 gap-6 opacity-30">
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div key={i} animate={{ rotateY: [0, 180, 360], scale: [0.8, 1.1, 0.8] }} transition={{ duration: 6, delay: i * 0.1, repeat: Infinity }} className="w-32 h-32 border border-white/20 rounded-2xl flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Mirror NXT" className="w-16 h-16 object-contain invert opacity-60" />
              </motion.div>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-[300px] sm:w-[460px] h-[150px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/intro.png" alt="NXT Mirror Main" className="w-full h-full object-contain filter drop-shadow-[0_0_40px_white] invert dark:invert-0" />
            </motion.div>
            <p className="text-xs font-black tracking-[0.6em] uppercase text-white mt-4">INFINITE MIRROR ROOM</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 4. Cyber Luxury Neon
export function Intro4_CyberNeon({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(50);
    const t1 = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t1);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#030206] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-[#030206] to-black" />
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Cyber Neon" className="w-full h-full object-contain filter drop-shadow-[0_0_45px_rgba(168,85,247,0.8)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-purple-400">CYBER LUXURY NEON</p>
      </motion.div>
    </motion.div>
  );
}

// 5. Golden Desert Mirage
export function Intro5_GoldenDesert({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(38);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#080502] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-[#080502] to-black" />
      <motion.div initial={{ filter: "blur(15px)", opacity: 0 }} animate={{ filter: "blur(0px)", opacity: 1 }} transition={{ duration: 2.5 }} className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Desert Mirage" className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(245,158,11,0.6)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-amber-500">GOLDEN DESERT MIRAGE</p>
      </motion.div>
    </motion.div>
  );
}

// 6. Underwater Silk
export function Intro6_UnderwaterSilk({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(30);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#020509] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/30 via-[#020509] to-black" />
      <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Underwater Silk" className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(6,182,212,0.5)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-cyan-400">UNDERWATER SILK</p>
      </motion.div>
    </motion.div>
  );
}

// 7. Glass Labyrinth
export function Intro7_GlassLabyrinth({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(42);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#030304] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="relative z-10 flex flex-col items-center gap-6 backdrop-blur-md p-10 border border-white/10 rounded-3xl bg-white/5">
        <div className="w-[300px] sm:w-[460px] h-[150px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Glass Labyrinth" className="w-full h-full object-contain filter drop-shadow-[0_0_35px_white] invert dark:invert-0" />
        </div>
        <p className="text-xs font-black tracking-[0.6em] uppercase text-white">GLASS LABYRINTH</p>
      </div>
    </motion.div>
  );
}

// 8. Volcanic Obsidian
export function Intro8_VolcanicObsidian({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(32);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#060202] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 via-[#060202] to-black" />
      <motion.div animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ duration: 3, repeat: Infinity }} className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Volcanic Obsidian" className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(239,68,68,0.6)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-red-500">VOLCANIC OBSIDIAN</p>
      </motion.div>
    </motion.div>
  );
}

// 9. Celestial Void
export function Intro9_CelestialVoid({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(36);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#020205] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#020205] to-black" />
      <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="w-[450px] h-[450px] rounded-full border border-indigo-500/20 absolute" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Celestial Void" className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(99,102,241,0.6)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-indigo-400">CELESTIAL VOID</p>
      </div>
    </motion.div>
  );
}

// 10. Liquid Gold Pour
export function Intro10_LiquidGold({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(40);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#050402] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.8 }} className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Liquid Gold" className="w-full h-full object-contain filter drop-shadow-[0_0_45px_rgba(245,158,11,0.8)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-amber-400">LIQUID GOLD POUR</p>
      </motion.div>
    </motion.div>
  );
}

// 11. Crystal Cave
export function Intro11_CrystalCave({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(44);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#020406] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Crystal Cave" className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(56,189,248,0.7)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-sky-400">CRYSTAL CAVE</p>
      </div>
    </motion.div>
  );
}

// 12. Origami Motion
export function Intro12_OrigamiMotion({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(48);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#030303] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <motion.div initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ duration: 1.5 }} className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Origami Motion" className="w-full h-full object-contain filter drop-shadow-[0_0_35px_white] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-zinc-300">ORIGAMI MOTION</p>
      </motion.div>
    </motion.div>
  );
}

// 13. Diamond Fracture
export function Intro13_DiamondFracture({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(52);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#020203] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Diamond Fracture" className="w-full h-full object-contain filter drop-shadow-[0_0_50px_rgba(255,255,255,0.95)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-white">DIAMOND FRACTURE</p>
      </div>
    </motion.div>
  );
}

// 14. Velvet Shadow
export function Intro14_VelvetShadow({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(34);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#040305] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Velvet Shadow" className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(217,70,239,0.5)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-fuchsia-400">VELVET SHADOW</p>
      </div>
    </motion.div>
  );
}

// 15. Museum of Light
export function Intro15_MuseumLight({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(40);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#050505] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="w-[500px] h-[500px] rounded-full bg-white/10 blur-[120px] absolute" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Museum of Light" className="w-full h-full object-contain filter drop-shadow-[0_0_40px_white] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-zinc-200">MUSEUM OF LIGHT</p>
      </div>
    </motion.div>
  );
}

// 16. Kinetic Sculpture Hall
export function Intro16_KineticSculpture({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(46);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#020202] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Kinetic Sculpture" className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(156,163,175,0.7)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-zinc-400">KINETIC SCULPTURE HALL</p>
      </div>
    </motion.div>
  );
}

// 17. Ice Palace Minimal
export function Intro17_IcePalace({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(35);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#020406] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Ice Palace" className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(186,230,253,0.8)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-sky-200">ICE PALACE MINIMAL</p>
      </div>
    </motion.div>
  );
}

// 18. Smoke & Silk
export function Intro18_SmokeSilk({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(30);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#030303] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Smoke & Silk" className="w-full h-full object-contain filter drop-shadow-[0_0_35px_white] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-zinc-300">SMOKE & SILK</p>
      </div>
    </motion.div>
  );
}

// 19. Brutalist Concrete Reveal
export function Intro19_BrutalistConcrete({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(38);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#040404] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Brutalist Concrete" className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(161,161,170,0.6)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-zinc-400">BRUTALIST CONCRETE REVEAL</p>
      </div>
    </motion.div>
  );
}

// 20. Holographic Runway
export function Intro20_HolographicRunway({ onComplete }: IntroProps) {
  useEffect(() => {
    playSubBassHit(44);
    const t = setTimeout(() => onComplete(), 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 bg-[#020204] z-[99999] flex flex-col items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[500px] h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro.png" alt="Holographic Runway" className="w-full h-full object-contain filter drop-shadow-[0_0_45px_rgba(59,130,246,0.8)] invert dark:invert-0" />
        </div>
        <p className="text-xs md:text-sm font-black tracking-[0.6em] uppercase text-blue-400">HOLOGRAPHIC RUNWAY</p>
      </div>
    </motion.div>
  );
}
