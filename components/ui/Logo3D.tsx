"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getSiteSettings } from "@/lib/firebase/firestore";

interface Logo3DProps {
  className?: string;
  layers?: number;
  src?: string;
}

export function Logo3D({ className, layers = 14, src }: Logo3DProps) {
  const actualLayers = Math.min(layers, 16);
  const [logoSrc, setLogoSrc] = useState(src || "/logo.png");

  useEffect(() => {
    if (!src) {
      getSiteSettings()
        .then((s) => {
          if (s?.logoUrl) setLogoSrc(s.logoUrl);
        })
        .catch(console.error);
    }
  }, [src]);

  return (
    <div
      className={`relative flex items-center justify-center select-none py-1 px-2 ${className}`}
      style={{
        perspective: "1000px",
      }}
    >
      {/* 3D Floating Tilt & Rotation Container */}
      <motion.div
        className="relative flex flex-col items-center justify-center cursor-pointer py-1 px-1"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        animate={{
          rotateY: [-28, 28, -28],
          rotateX: [10, -10, 10],
          y: [-4, 4, -4],
        }}
        transition={{
          repeat: Infinity,
          duration: 5.5,
          ease: "easeInOut",
        }}
      >
        {/* Floating Crown on Top */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="text-lg sm:text-2xl text-amber-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.9)] -mb-2 z-30"
        >
          👑
        </motion.div>

        {/* 3D Extruded Stacked Image Layers */}
        <div className="relative flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          {Array.from({ length: actualLayers }).map((_, i) => {
            const isFront = i === 0;
            const zOffset = -i * 1.25; // 3D depth step per layer

            return (
              <div
                key={i}
                style={{
                  position: isFront ? "relative" : "absolute",
                  top: isFront ? "auto" : 0,
                  left: isFront ? "auto" : 0,
                  transform: `translateZ(${zOffset}px)`,
                  backfaceVisibility: "hidden",
                  filter: isFront
                    ? "drop-shadow(0 0 25px rgba(255,215,0,0.85))"
                    : `brightness(${Math.max(0.2, 0.85 - i * 0.05)}) contrast(1.2)`,
                  opacity: isFront ? 1 : 0.95,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt="DEEP STORE 3D Logo"
                  className="h-10 sm:h-14 md:h-16 w-auto object-contain drop-shadow-2xl"
                />
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
