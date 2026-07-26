"use client";

import { motion } from "framer-motion";

interface Logo3DProps {
  className?: string;
  layers?: number;
  size?: number;
}

export function Logo3D({ className, layers = 14, size = 100 }: Logo3DProps) {
  const actualLayers = Math.min(layers, 16); // 14-16 layers gives razor-sharp 3D depth without blurring texture

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        perspective: "1000px",
      }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        animate={{
          rotateY: [0, 360],
          rotateX: [10, 10],
        }}
        transition={{
          repeat: Infinity,
          duration: 9,
          ease: "linear",
        }}
      >
        {Array.from({ length: actualLayers }).map((_, i) => {
          const isFront = i === 0;
          const zOffset = -i * 0.45; // Smooth subpixel 3D extrusion step

          return (
            <div
              key={i}
              className="absolute inset-0 w-full h-full flex items-center justify-center"
              style={{
                transform: `translateZ(${zOffset}px)`,
                backfaceVisibility: "visible",
                filter: isFront
                  ? "drop-shadow(0 4px 12px rgba(0,0,0,0.18))"
                  : `brightness(${Math.max(0.3, 1 - (i / actualLayers) * 0.7)})`,
                opacity: isFront ? 1 : 0.95,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="NXT 3D Logo"
                className="w-full h-full object-contain pointer-events-none select-none"
                style={{
                  imageRendering: "crisp-edges",
                  WebkitFontSmoothing: "antialiased",
                }}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
