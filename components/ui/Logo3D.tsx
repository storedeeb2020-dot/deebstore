"use client";

import { motion } from "framer-motion";

interface Logo3DProps {
  className?: string;
  layers?: number;
}

export function Logo3D({ className, layers = 14 }: Logo3DProps) {
  const actualLayers = Math.min(layers, 16);

  return (
    <div
      className={`relative flex items-center justify-center select-none py-1 px-3 ${className}`}
      style={{
        perspective: "1200px",
      }}
    >
      {/* 360-Degree Continuous 3D Rotating Wrapper */}
      <motion.div
        className="relative flex items-center justify-center cursor-pointer py-1 px-2"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        animate={{
          rotateY: [0, 360],
          rotateX: [10, 5, 10],
        }}
        transition={{
          repeat: Infinity,
          duration: 9,
          ease: "linear",
        }}
      >
        {/* 3D Depth Extrusion Layers for Arabic Word "الديب" */}
        {Array.from({ length: actualLayers }).map((_, i) => {
          const isFront = i === 0;
          const zOffset = -i * 0.95; // Sharp subpixel 3D depth step

          return (
            <div
              key={i}
              className="flex items-center gap-2 font-black text-2xl sm:text-3xl md:text-4xl tracking-wider font-['Cairo',sans-serif] whitespace-nowrap"
              style={{
                position: isFront ? "relative" : "absolute",
                top: isFront ? "auto" : 0,
                left: isFront ? "auto" : 0,
                transform: `translateZ(${zOffset}px)`,
                backfaceVisibility: "visible",
                filter: isFront
                  ? "drop-shadow(0 0 15px rgba(255,215,0,0.7))"
                  : `brightness(${Math.max(0.2, 0.85 - i * 0.05)})`,
                opacity: isFront ? 1 : 0.9,
              }}
            >
              {/* Crown Icon */}
              <span className="text-xl sm:text-2xl text-amber-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
                👑
              </span>

              {/* Arabic Royal Font Text "الديب" */}
              <span
                className={
                  isFront
                    ? "bg-clip-text text-transparent bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-500 font-black tracking-wide"
                    : "text-amber-950 font-black tracking-wide"
                }
                style={{
                  WebkitTextStroke: isFront ? "0.5px rgba(255,215,0,0.5)" : "none",
                }}
              >
                الديب
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
