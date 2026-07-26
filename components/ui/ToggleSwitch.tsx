"use client";

import { motion } from "framer-motion";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function ToggleSwitch({ checked, onChange, size = "md" }: ToggleSwitchProps) {
  const containerClasses =
    size === "sm"
      ? "w-11 h-6 p-0.5"
      : size === "lg"
      ? "w-16 h-8 p-1"
      : "w-14 h-7 p-1";

  const circleClasses =
    size === "sm"
      ? "w-4 h-4"
      : size === "lg"
      ? "w-6 h-6"
      : "w-5 h-5";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative rounded-full transition-all duration-300 flex items-center cursor-pointer select-none border border-zinc-700/50 ${containerClasses} ${
        checked
          ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 shadow-lg shadow-amber-500/30 justify-end"
          : "bg-zinc-800 justify-start"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
        className={`rounded-full bg-white shadow-md ${circleClasses}`}
      />
    </button>
  );
}
