"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NXTIntro } from "@/components/intros/NXTIntro";

export default function IntroLabPage() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8 font-sans">
      {playing && (
        <NXTIntro
          onComplete={() => setPlaying(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-6 max-w-sm"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="NXT" className="h-8 invert" />
          <span className="text-2xl font-black tracking-[0.3em]">NXT</span>
        </div>

        <p className="text-zinc-400 text-sm">Cinematic Brand Intro Preview</p>

        <button
          onClick={() => setPlaying(true)}
          className="inline-flex items-center gap-2 bg-white text-black font-black text-sm px-8 py-3.5 rounded-2xl hover:bg-zinc-100 transition-all active:scale-95 shadow-2xl"
        >
          <Play size={16} fill="black" />
          Preview Intro
        </button>

        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => { sessionStorage.removeItem("nxt-intro-seen"); window.location.href = "/"; }}
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs transition-colors"
          >
            <RefreshCw size={13} />
            Reset & See on Homepage
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Site
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
