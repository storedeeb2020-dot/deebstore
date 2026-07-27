"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, Heart, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useScroll } from "@/hooks/useScroll";
import { useCart } from "@/features/cart/CartProvider";
import { useWishlist } from "@/features/wishlist/WishlistProvider";
import { useTheme } from "@/features/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { Logo3D } from "@/components/ui/Logo3D";
import { AnimatedNavLink } from "@/components/ui/AnimatedButton";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/#products", label: "المتجر" },
  { href: "/about", label: "عن المتجر" },
  { href: "/contact", label: "اتصل بنا والشكاوى" },
];

export function Header() {
  const { scrolled } = useScroll(40);
  const { totalItems, toggleCart } = useCart();
  const { wishlist, toggleWishlistDrawer } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 left-0 right-0 z-40 transition-all duration-300 backdrop-blur-md",
          scrolled
            ? "bg-white/90 dark:bg-black/90 border-b border-gray-200/60 dark:border-zinc-800/60 shadow-md py-1"
            : "bg-white/70 dark:bg-black/70 border-b border-transparent py-2 sm:py-3"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn("flex items-center justify-between transition-all duration-300", scrolled ? "h-14 sm:h-16 md:h-18" : "h-18 sm:h-22 md:h-24")}>
            {/* Left Section: Wishlist + Desktop Nav */}
            <div className="flex items-center gap-2 sm:gap-4 z-20">

              {/* Wishlist Toggle */}
              <motion.button
                onClick={toggleWishlistDrawer}
                className={cn(
                  "relative p-2 transition-all duration-300 rounded-xl hover:bg-black/5 dark:hover:bg-white/5",
                  "text-zinc-900 dark:text-white hover:text-amber-500"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Wishlist"
              >
                <Heart size={20} className={cn("sm:w-6 sm:h-6", wishlist.length > 0 ? "fill-red-500 text-red-500" : "")} />
                <AnimatePresence>
                  {wishlist.length > 0 && (
                    <motion.span
                      key="wishlist-badge"
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {wishlist.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-6 ml-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-bold tracking-wide transition-all duration-300",
                      "text-zinc-900 dark:text-white hover:text-amber-500"
                    )}
                  >
                    <AnimatedNavLink>{link.label}</AnimatedNavLink>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center Section: Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-auto transition-all duration-300">
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center justify-center py-1 transition-all duration-300"
                >
                  <Logo3D text="ELDEEB" />
                </motion.div>
              </Link>
            </div>

            {/* Right Section: Theme Toggle + Cart + Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3 z-20">
              {/* Theme Mode Toggle Button */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="relative p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:bg-zinc-900 dark:border-amber-500/30 text-amber-600 dark:text-amber-300 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 px-3"
                aria-label="تبديل وضع الموقع"
                title={theme === "dark" ? "التحويل للوضع المضيء" : "التحويل للوضع الليلي الفاخر"}
              >
                {theme === "dark" ? (
                  <>
                    <Sun size={17} className="text-amber-400 animate-spin-slow" />
                    <span className="text-[11px] font-bold hidden md:inline">الوضع المضيء</span>
                  </>
                ) : (
                  <>
                    <Moon size={17} className="text-amber-600" />
                    <span className="text-[11px] font-bold hidden md:inline">الوضع الليلي</span>
                  </>
                )}
              </motion.button>

              {/* Cart Toggle */}
              <motion.button
                onClick={toggleCart}
                className={cn(
                  "relative p-2 transition-all duration-300 rounded-xl hover:bg-black/5 dark:hover:bg-white/5",
                  "text-zinc-900 dark:text-white hover:text-amber-500"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Shopping cart"
              >
                <ShoppingBag size={22} className="sm:w-6 sm:h-6" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-amber-500 text-black dark:bg-white dark:text-black text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {totalItems > 9 ? "9+" : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile Menu Button */}
              <button
                className={cn(
                  "p-2 transition-colors rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer",
                  "text-zinc-900 dark:text-white hover:text-amber-500"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMobileOpen((prev) => !prev);
                }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} className="sm:w-6 sm:h-6" /> : <Menu size={22} className="sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-zinc-900 z-[99999] flex flex-col pt-20 px-6 shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between absolute top-6 left-6 right-6 border-b border-gray-100 dark:border-zinc-900 pb-4">
                <span className="text-lg font-black tracking-tighter text-amber-500 flex items-center gap-1.5">
                  DEEP STORE <img src="/api/wolf-icon" alt="Wolf" className="w-5 h-5 object-contain dark:invert" />
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-1 mt-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block py-4 text-base font-bold border-b border-gray-100 dark:border-zinc-900 text-foreground hover:opacity-60 transition-opacity"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
