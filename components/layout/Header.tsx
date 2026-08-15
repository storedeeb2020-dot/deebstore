"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Menu,
  X,
  Heart,
  Sun,
  Moon,
  Home,
  Flame,
  Package,
  Store,
  Info,
  PhoneCall,
  Grid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useScroll } from "@/hooks/useScroll";
import { useCart } from "@/features/cart/CartProvider";
import { useWishlist } from "@/features/wishlist/WishlistProvider";
import { useTheme } from "@/features/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { Logo3D } from "@/components/ui/Logo3D";

const navLinks = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/#categories", label: "الأقسام والفئات", icon: Grid },
  { href: "/shop?bestSeller=true", label: "الأكثر مبيعاً 🔥", icon: Flame },
  { href: "/gomla", label: "قسم مبيعات الجملة 📦", icon: Package },
  { href: "/#products", label: "المتجر والمنتجات", icon: Store },
  { href: "/about", label: "عن المتجر والهوية", icon: Info },
  { href: "/contact", label: "اتصل بنا والشكاوى", icon: PhoneCall },
];

export function Header() {
  const pathname = usePathname();
  const { scrolled } = useScroll(40);
  const { totalItems, toggleCart } = useCart();
  const { wishlist, toggleWishlistDrawer } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 left-0 right-0 z-40 transition-all duration-300 backdrop-blur-md dir-rtl",
          scrolled
            ? "bg-white/90 dark:bg-black/90 border-b border-gray-200/60 dark:border-zinc-800/60 shadow-md py-1"
            : "bg-white/70 dark:bg-black/70 border-b border-transparent py-2 sm:py-3"
        )}
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-300 relative",
              scrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
            )}
          >
            {/* Right Section (RTL): Menu Toggle + Cart Button */}
            <div className="flex items-center gap-2 sm:gap-3 z-20">
              {/* Menu Button (Desktop & Mobile) */}
              <motion.button
                onClick={() => setMenuOpen((prev) => !prev)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 font-bold text-xs cursor-pointer shadow-sm border",
                  "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:border-amber-500"
                )}
                aria-label="القائمة الرئيسية"
              >
                {menuOpen ? <X size={20} className="text-amber-500" /> : <Menu size={20} className="text-amber-500" />}
                <span className="hidden sm:inline font-extrabold text-xs">القائمة</span>
              </motion.button>

              {/* Cart Toggle Button */}
              <motion.button
                onClick={toggleCart}
                className={cn(
                  "relative p-2.5 transition-all duration-300 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-amber-500/30",
                  "text-zinc-900 dark:text-white hover:text-amber-500"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="حقيبة التسوق"
              >
                <ShoppingBag size={22} className="sm:w-6 sm:h-6" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-amber-500 text-black font-black text-[9px] sm:text-[10px] rounded-full flex items-center justify-center shadow-md"
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
            </div>

            {/* Center Section: 3D Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-auto">
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

            {/* Left Section (RTL): Wishlist + Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 z-20">
              {/* Wishlist Toggle Button */}
              <motion.button
                onClick={toggleWishlistDrawer}
                className={cn(
                  "relative p-2.5 transition-all duration-300 rounded-xl hover:bg-black/5 dark:hover:bg-white/5",
                  "text-zinc-900 dark:text-white hover:text-amber-500"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="المفضلة"
              >
                <Heart size={20} className={cn("sm:w-6 sm:h-6", wishlist.length > 0 ? "fill-red-500 text-red-500" : "")} />
                <AnimatePresence>
                  {wishlist.length > 0 && (
                    <motion.span
                      key="wishlist-badge"
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center shadow-md"
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

              {/* Theme Mode Toggle Button */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="relative p-2 sm:px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:bg-zinc-900 dark:border-amber-500/30 text-amber-600 dark:text-amber-300 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                aria-label="تبديل وضع الموقع"
                title={theme === "dark" ? "التحويل للوضع المضيء" : "التحويل للوضع الليلي الفاخر"}
              >
                {theme === "dark" ? (
                  <>
                    <Sun size={18} className="text-amber-400" />
                    <span className="text-[11px] font-bold hidden md:inline">الوضع المضيء</span>
                  </>
                ) : (
                  <>
                    <Moon size={18} className="text-amber-600" />
                    <span className="text-[11px] font-bold hidden md:inline">الوضع الليلي</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Navigation Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Menu Sliding Panel */}
            <motion.nav
              className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 bg-white dark:bg-[#0B0B0D] border-l border-gray-200 dark:border-white/[0.08] z-[99999] flex flex-col justify-between p-6 sm:p-8 shadow-2xl dir-rtl text-right"
              dir="rtl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-5">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain dark:invert" />
                    <div>
                      <h3 className="text-base font-black tracking-tight text-amber-500">DEEB STORE 🐺</h3>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">قائمة التصفح الرئيسية</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-[#FF274B] transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 pt-2">
                  {navLinks.map((link, i) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all duration-200 cursor-pointer group",
                            isActive
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                              : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-amber-500"
                          )}
                        >
                          <Icon size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
                          <span>{link.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer Info */}
              <div className="pt-6 border-t border-zinc-200 dark:border-white/[0.08] text-center space-y-2">
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  ديب ستور — ROYAL STREETWEAR 🐺
                </p>
                <p className="text-[10px] text-zinc-400">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
