"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useScroll } from "@/hooks/useScroll";
import { useCart } from "@/features/cart/CartProvider";
import { useTheme } from "@/features/theme/ThemeProvider";
import { useWishlist } from "@/features/wishlist/WishlistProvider";
import { cn } from "@/lib/utils";
import { Logo3D } from "@/components/ui/Logo3D";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/#products", label: "المتجر" },
  { href: "/about", label: "عن المتجر" },
  { href: "/contact", label: "اتصل بنا والشكاوى" },
];

export function Header() {
  const { scrolled } = useScroll(40);
  const { totalItems, toggleCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { wishlist, toggleWishlistDrawer } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                  scrolled || theme === "light" ? "text-black dark:text-white" : "text-white"
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
                      "text-sm font-medium tracking-wide transition-all duration-300 hover:opacity-70",
                      scrolled || theme === "light" ? "text-black dark:text-white" : "text-white"
                    )}
                  >
                    {link.label}
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
                  <Logo3D layers={10} />
                </motion.div>
              </Link>
            </div>

            {/* Right Section: Cart + Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-4 z-20">
              {/* Cart Toggle */}
              <motion.button
                onClick={toggleCart}
                className={cn(
                  "relative p-2 transition-all duration-300 rounded-xl hover:bg-black/5 dark:hover:bg-white/5",
                  scrolled || theme === "light" ? "text-black dark:text-white" : "text-white"
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
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-black text-white dark:bg-white dark:text-black text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center"
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
                  scrolled || theme === "light" ? "text-black dark:text-white" : "text-white"
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
                <span className="text-lg font-black tracking-tighter text-amber-500">DEEP STORE 👑</span>
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
