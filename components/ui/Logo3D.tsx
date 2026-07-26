"use client";

import { motion } from "framer-motion";

interface Logo3DProps {
  className?: string;
  layers?: number;
}

export function Logo3D({ className, layers = 12 }: Logo3DProps) {
  const actualLayers = Math.min(layers, 14);

  return (
    <div
      className={`relative flex items-center justify-center select-none py-1 px-3 ${className}`}
      style={{
        perspective: "1000px",
      }}
    >
      {/* Smooth Floating 3D Tilt Wrapper (Prevents mirroring text backwards) */}
      <motion.div
        className="relative flex flex-col items-center justify-center cursor-pointer py-1 px-2"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        animate={{
          rotateY: [-22, 22, -22],
          rotateX: [8, -8, 8],
          y: [-3, 3, -3],
        }}
        transition={{
          repeat: Infinity,
          duration: 5.5,
          ease: "easeInOut",
        }}
      >
        {/* Crown on top */}
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="text-xl sm:text-2xl text-amber-400 drop-shadow-[0_0_12px_rgba(255,215,0,0.9)] -mb-1 z-20"
        >
          👑
        </motion.div>

        {/* 3D Depth Extrusion Layers for Arabic Word "ديب" */}
        <div className="relative flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          {Array.from({ length: actualLayers }).map((_, i) => {
            const isFront = i === 0;
            const zOffset = -i * 1.1; // Sharp metallic 3D extrusion depth

            return (
              <div
                key={i}
                className="font-black text-2xl sm:text-3xl md:text-4xl tracking-widest font-['Tajawal',sans-serif] whitespace-nowrap leading-none"
                style={{
                  position: isFront ? "relative" : "absolute",
                  top: isFront ? "auto" : 0,
                  left: isFront ? "auto" : 0,
                  transform: `translateZ(${zOffset}px)`,
                  backfaceVisibility: "hidden",
                  filter: isFront
                    ? "drop-shadow(0 0 18px rgba(255,215,0,0.8))"
                    : `brightness(${Math.max(0.25, 0.85 - i * 0.06)})`,
                  opacity: isFront ? 1 : 0.95,
                }}
              >
                {/* Arabic Royal Font Text "ديب" */}
                <span
                  className={
                    isFront
                      ? "bg-clip-text text-transparent bg-gradient-to-b from-amber-100 via-amber-400 to-yellow-600 font-black tracking-widest"
                      : "text-amber-950 font-black tracking-widest"
                  }
                  style={{
                    WebkitTextStroke: isFront ? "0.6px rgba(255,215,0,0.6)" : "none",
                  }}
                >
                  ديب
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
