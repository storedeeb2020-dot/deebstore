"use client";

import { motion } from "framer-motion";

interface Logo3DProps {
  className?: string;
  text?: string;
}

export function Logo3D({ className, text = "ELDEEB" }: Logo3DProps) {
  const actualLayers = 24;

  return (
    <div
      className={`relative flex items-center justify-center select-none py-1 px-2 ${className}`}
      style={{
        perspective: "1200px",
      }}
    >
      {/* 360-Degree Continuous Self-Rotating Container */}
      <motion.div
        className="relative flex flex-col items-center justify-center cursor-pointer py-1 px-1"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        animate={{
          rotateY: [0, 360],
          rotateX: [6, 2, 6],
        }}
        transition={{
          repeat: Infinity,
          duration: 7.5,
          ease: "linear",
        }}
      >
        {/* Ultra-Dense 3D Text Layers Block */}
        <div
          className="relative flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {Array.from({ length: actualLayers }).map((_, i) => {
            const isFront = i === 0;
            const isBack = i === actualLayers - 1;
            const isFrontHalf = i < actualLayers / 2;

            const zOffset = -i * 0.45;

            const layerTransform = isFrontHalf
              ? `translateZ(${zOffset}px)`
              : `translateZ(${zOffset}px) rotateY(180deg)`;

            const colorClass = isFront
              ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)]"
              : isBack
              ? "text-amber-600"
              : "text-amber-500/90";

            return (
              <div
                key={i}
                style={{
                  position: isFront ? "relative" : "absolute",
                  top: isFront ? "auto" : 0,
                  left: isFront ? "auto" : 0,
                  transform: layerTransform,
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                  filter: isFront
                    ? "drop-shadow(0 6px 12px rgba(0,0,0,0.9))"
                    : `brightness(${Math.max(0.3, 1 - i * 0.03)})`,
                }}
                className="whitespace-nowrap font-black tracking-widest text-xl sm:text-2xl md:text-3xl uppercase font-mono select-none"
              >
                <span className={colorClass}>
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
