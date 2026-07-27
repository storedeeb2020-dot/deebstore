"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX, ArrowLeft, Sparkles } from "lucide-react";

interface IntroProps {
  onComplete: () => void;
}

export function DeepIntro({ onComplete }: IntroProps) {
  const [hasStartedVideo, setHasStartedVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleEnterClick = () => {
    setHasStartedVideo(true);
    // Give state time to render video element, then play with sound
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.play().catch((err) => {
          console.log("Autoplay with sound prevented, playing muted:", err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play();
          }
        });
      }
    }, 100);
  };

  const handleFinish = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="deep-store-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] bg-black text-white overflow-hidden select-none flex items-center justify-center font-sans dir-rtl"
          dir="rtl"
        >
          {/* ── STAGE 1: BLACK ENTER SCREEN ── */}
          {!hasStartedVideo ? (
            <div className="relative z-10 text-center flex flex-col items-center justify-center px-4 max-w-lg mx-auto">
              {/* Pulsing Glowing Logo Container */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative mb-8 flex items-center justify-center"
              >
                {/* Gold Outer Glow Halo */}
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-600/20 blur-xl animate-pulse" />

                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-amber-500/40 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 shadow-[0_0_50px_rgba(212,175,55,0.25)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="DEEP STORE Logo"
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]"
                  />
                </div>
              </motion.div>

              {/* Brand Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="space-y-3 mb-10 text-center"
              >
                <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 uppercase drop-shadow-md">
                  DEEP STORE
                </h1>
                <p className="text-xs sm:text-sm font-bold tracking-[0.3em] text-zinc-400 uppercase flex items-center justify-center gap-2">
                  ROYAL STREETWEAR <img src="/wolf-icon.png" alt="Wolf" className="w-4 h-4 object-contain invert" />
                </p>
              </motion.div>

              {/* ENTER BUTTON */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="relative group"
              >
                {/* Glow backing */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 blur-lg opacity-70 group-hover:opacity-100 transition-all duration-300 animate-pulse" />

                <button
                  type="button"
                  onClick={handleEnterClick}
                  className="relative inline-flex items-center gap-3 px-10 py-4 sm:px-12 sm:py-4.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-black text-sm sm:text-base tracking-widest uppercase shadow-2xl border border-amber-300/60 active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={18} className="fill-black text-black" />
                  <span>دخول المتجر — ENTER</span>
                  <ArrowLeft size={18} className="text-black" />
                </button>
              </motion.div>
            </div>
          ) : (
            /* ── STAGE 2: INTRO VIDEO PLAYBACK (9888.mp4) ── */
            <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
              <video
                ref={videoRef}
                src="https://res.cloudinary.com/aqszlz7k/video/upload/12_zsnepl.mp4"
                onError={(e) => {
                  (e.target as HTMLVideoElement).src = "/intro.mp4";
                }}
                playsInline
                onEnded={handleFinish}
                className="w-full h-full object-cover scale-105 md:scale-100 min-h-full min-w-full"
              />

              {/* Video Controls Overlay */}
              <div className="absolute top-6 right-6 left-6 z-20 flex items-center justify-between pointer-events-auto">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-3 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md hover:bg-black/80 transition-all flex items-center gap-2 text-xs font-bold"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span className="hidden sm:inline">{isMuted ? "كتم الصوت" : "تشغيل الصوت"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs tracking-wider border border-amber-300 shadow-xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>تخطي ودخول المتجر</span>
                  <ArrowLeft size={16} />
                </button>
              </div>

              {/* Bottom Subtle Brand Tagline */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-white/60 text-xs font-bold tracking-widest bg-black/40 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm pointer-events-none">
                <Sparkles size={14} className="text-amber-400" />
                <span>DEEP STORE • CINEMATIC EXPERIENCE</span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
