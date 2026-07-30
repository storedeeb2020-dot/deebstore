"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Truck, Check, Sparkles } from "lucide-react";

interface TruckSubmitButtonProps {
  isSubmitting?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  totalText?: string;
}

export function TruckSubmitButton({
  isSubmitting = false,
  isSuccess = false,
  disabled = false,
  totalText,
}: TruckSubmitButtonProps) {
  const isExecuting = isSubmitting;

  return (
    <button
      type="submit"
      disabled={disabled || isExecuting || isSuccess}
      className={`relative w-full h-14 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider overflow-hidden transition-all duration-300 select-none shadow-xl active:scale-[0.99] ${
        isSuccess
          ? "bg-emerald-600 text-white shadow-emerald-600/30"
          : isExecuting
          ? "bg-zinc-900 dark:bg-zinc-950 text-amber-400 shadow-zinc-900/30 cursor-wait"
          : disabled
          ? "bg-zinc-200 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 cursor-not-allowed shadow-none opacity-70"
          : "bg-gradient-to-r from-[#FF274B] via-red-600 to-amber-500 hover:brightness-110 text-white shadow-lg shadow-[#FF274B]/25 hover:shadow-xl hover:shadow-[#FF274B]/35 cursor-pointer"
      }`}
    >
      {/* Background Animated Road Line Track */}
      {isExecuting && (
        <div className="absolute inset-x-0 bottom-1 h-0.5 border-t border-dashed border-zinc-600/60 animate-pulse" />
      )}

      {/* Delivery Truck driving from left to right when submitting */}
      <AnimatePresence>
        {isExecuting && !isSuccess && (
          <motion.div
            initial={{ left: "-15%", opacity: 0 }}
            animate={{ left: "85%", opacity: 1 }}
            exit={{ left: "110%", opacity: 0 }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 text-amber-400"
          >
            {/* Animated Exhaust Smoke Trail Particles */}
            <motion.span
              animate={{ opacity: [0.2, 0.8, 0], scale: [0.5, 1.2, 0.5], x: [-10, -20] }}
              transition={{ duration: 0.4, repeat: Infinity }}
              aria-hidden="true"
              className="w-2 h-2 rounded-full bg-zinc-500/60 blur-[1px]"
            />
            {/* Delivery Truck Icon */}
            <div className="p-1.5 rounded-xl bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.8)] flex items-center justify-center">
              <Truck size={20} className="stroke-[2.5]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button Content Text & Price */}
      <div className="relative z-10 flex items-center justify-center gap-3 w-full h-full px-6">
        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 text-white font-extrabold"
          >
            <Check size={20} className="stroke-[3]" />
            <span>تم تأكيد الطلب بنجاح! 🎉</span>
          </motion.div>
        ) : isExecuting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-amber-400 font-extrabold text-xs tracking-widest"
          >
            <Sparkles size={14} className="animate-spin" />
            <span>جاري إرسال وتأكيد الطلب...</span>
          </motion.div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2 font-black tracking-wider text-white">
              <Truck size={18} className={disabled ? "text-zinc-400 dark:text-zinc-500" : "text-white"} />
              تأكيد وإتمام الطلب الآن
            </span>

            {totalText && (
              <span
                className={`text-xs px-3 py-1 rounded-full font-mono font-bold ${
                  disabled
                    ? "bg-zinc-300 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400"
                    : "bg-white/20 text-white backdrop-blur-md border border-white/25 shadow-sm"
                }`}
              >
                {totalText}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
