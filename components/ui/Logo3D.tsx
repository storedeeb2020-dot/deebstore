"use client";

import { motion } from "framer-motion";

interface Logo3DProps {
  className?: string;
  layers?: number;
  size?: number;
}

export function Logo3D({ className, layers = 10 }: Logo3DProps) {
  const actualLayers = Math.min(layers, 12);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        perspective: "1000px",
      }}
    >
      <motion.div
        className="relative flex items-center justify-center cursor-pointer py-1 px-2"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        animate={{
          rotateY: [-15, 15, -15],
          rotateX: [5, -5, 5],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
        }}
      >
        {/* 3D Depth Extrusion Layers for Arabic Word "الديب" */}
        {Array.from({ length: actualLayers }).map((_, i) => {
          const isFront = i === 0;
          const zOffset = -i * 1.2; // 3D extrusion step

          return (
            <div
              key={i}
              className="flex items-center gap-1.5 font-black text-2xl sm:text-3xl md:text-4xl tracking-wide font-sans whitespace-nowrap"
              style={{
                position: isFront ? "relative" : "absolute",
                top: isFront ? "auto" : 0,
                left: isFront ? "auto" : 0,
                transform: `translateZ(${zOffset}px)`,
                backfaceVisibility: "visible",
                color: isFront ? "transparent" : "#92400e",
                filter: isFront
                  ? "drop-shadow(0 0 20px rgba(212,175,55,0.6))"
                  : `brightness(${Math.max(0.2, 0.9 - i * 0.08)})`,
                opacity: isFront ? 1 : 0.85,
              }}
            >
              {/* Gold Chrome Crown Icon */}
              <span className="text-xl sm:text-2xl text-amber-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">
                👑
              </span>

              {/* Arabic Brand Text "الديب" */}
              <span
                className={
                  isFront
                    ? "bg-clip-text text-transparent bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 font-extrabold"
                    : "text-amber-900 font-extrabold"
                }
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
