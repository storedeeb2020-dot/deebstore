"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getSiteSettings } from "@/lib/firebase/firestore";

interface Logo3DProps {
  className?: string;
  layers?: number;
  src?: string;
}

export function Logo3D({ className, layers = 60, src }: Logo3DProps) {
  const actualLayers = Math.min(layers, 72);
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
          duration: 8.5,
          ease: "linear",
        }}
      >
        {/* Crown on Top */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="text-lg sm:text-2xl text-amber-400 -mb-2 z-40"
          style={{ transform: "translateZ(10px)" }}
        >
          👑
        </motion.div>

        {/* Ultra-Dense 3D Glued Coin Block */}
        <div
          className="relative flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {Array.from({ length: actualLayers }).map((_, i) => {
            const isFront = i === 0;
            const isBack = i === actualLayers - 1;
            // Tighter step = denser coin body, more solid 3D feel
            const zOffset = -i * 0.38;
            // Total depth of the coin block
            const totalDepth = (actualLayers - 1) * 0.38;

            // Back face: place at the rear of the coin block, then rotate 180° around Y
            // and mirror X so the logo text reads correctly when viewed from behind
            const layerTransform = isBack
              ? `translateZ(${-totalDepth}px) rotateY(180deg) scaleX(-1)`
              : `translateZ(${zOffset}px)`;

            return (
              <div
                key={i}
                style={{
                  position: isFront ? "relative" : "absolute",
                  top: isFront ? "auto" : 0,
                  left: isFront ? "auto" : 0,
                  transform: layerTransform,
                  backfaceVisibility: isFront || isBack ? "hidden" : "visible",
                  filter: isFront
                    ? "drop-shadow(0 8px 16px rgba(0,0,0,0.9))"
                    : isBack
                    ? "drop-shadow(0 6px 12px rgba(0,0,0,0.8))"
                    : `brightness(${Math.max(0.25, 0.95 - i * 0.02)}) contrast(1.1)`,
                  opacity: 1,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt="DEEP STORE 3D Logo Emblem"
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
