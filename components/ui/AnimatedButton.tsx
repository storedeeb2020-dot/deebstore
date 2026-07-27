"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "gold";
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
  children: React.ReactNode;
  asChild?: boolean;
}

// ─── Spring config ────────────────────────────────────────
const SPRING = { type: "spring" as const, stiffness: 260, damping: 20 };

export function AnimatedButton({
  variant = "primary",
  size = "md",
  magnetic = true,
  children,
  className,
  ...props
}: AnimatedButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  // Magnetic tracking via motion values (no useState = no re-renders on every frame)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 18 });

  // Shimmer position
  const shimmerX = useMotionValue(-100);
  const shimmerOpacity = useTransform(shimmerX, [-100, 50, 200], [0, 0.6, 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseX.set((e.clientX - cx) * 0.3);
    mouseY.set((e.clientY - cy) * 0.3);

    // shimmer tracking
    shimmerX.set(e.clientX - rect.left);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  };

  // Variant styles
  const variants: Record<string, string> = {
    primary: "bg-white text-black hover:bg-white/90",
    ghost: "bg-transparent text-white hover:bg-white/10 border border-white/20",
    outline: "bg-transparent text-amber-400 border border-amber-400 hover:bg-amber-400/10",
    gold: "bg-amber-400 text-black hover:bg-amber-300 font-black",
  };

  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-xs rounded-lg",
    md: "px-6 py-3 text-sm rounded-xl",
    lg: "px-8 py-4 text-base rounded-2xl",
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96, y: 1 }}
      transition={SPRING}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden font-bold tracking-wide transition-colors duration-200 cursor-pointer select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {/* Shimmer sweep */}
      {hovered && (
        <motion.span
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `radial-gradient(circle 60px at ${shimmerX.get()}px 50%, rgba(255,255,255,0.18) 0%, transparent 70%)`,
            opacity: shimmerOpacity,
          }}
        />
      )}
      {/* Inner content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

// ─── Animated Link ────────────────────────────────────────

export function AnimatedNavLink({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span
      className={cn("relative inline-block group", className)}
      whileHover="hovered"
      initial="idle"
    >
      {children}
      {/* Underline that slides in from left */}
      <motion.span
        className="absolute bottom-[-2px] left-0 h-[1.5px] bg-amber-400 origin-left"
        variants={{
          idle: { scaleX: 0, opacity: 0 },
          hovered: { scaleX: 1, opacity: 1 },
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%" }}
      />
    </motion.span>
  );
}

// ─── Social Icon Button ────────────────────────────────────
interface SocialIconButtonProps {
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function SocialIconButton({ href, label, children, className }: SocialIconButtonProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "w-10 h-10 bg-zinc-200/80 dark:bg-white/10 border border-zinc-300/60 dark:border-white/10 rounded-xl flex items-center justify-center text-zinc-800 dark:text-white relative overflow-hidden transition-colors hover:text-amber-600 dark:hover:text-amber-400",
        className
      )}
      whileHover={{ scale: 1.12, backgroundColor: "rgba(251, 191, 36, 0.2)" }}
      whileTap={{ scale: 0.95 }}
      transition={SPRING}
    >
      {/* Glow ring */}
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-xl"
        initial={{ boxShadow: "0 0 0px 0px rgba(251,191,36,0)" }}
        whileHover={{ boxShadow: "0 0 12px 2px rgba(251,191,36,0.35)" }}
        transition={{ duration: 0.3 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.a>
  );
}
