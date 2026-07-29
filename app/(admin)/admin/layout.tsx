"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Boxes,
  ShoppingBag,
  UserCheck,
  FolderTree,
  SlidersHorizontal,
  MessageSquareQuote,
  LogOut,
  ChevronLeft,
  ShieldCheck,
  ShieldAlert,
  Truck,
  Menu,
  X,
  Flame,
  Sun,
  Moon,
  Search,
  Bell,
  Plus,
  Sparkles,
  Command,
} from "lucide-react";
import { signOut } from "@/lib/firebase/auth";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthProvider";
import { useTheme } from "@/features/theme/ThemeProvider";
import { Spinner } from "@/components/ui/Spinner";

const navItems = [
  { href: "/admin", label: "لوحة التحكم والتحليلات", icon: LayoutGrid },
  { href: "/admin/orders", label: "إدارة الطلبات المباشرة", icon: ShoppingBag },
  { href: "/admin/bestsellers", label: "الأكثر مبيعاً 🔥", icon: Flame },
  { href: "/admin/shipping", label: "أسعار الشحن والمحافظات", icon: Truck },
  { href: "/admin/products", label: "إدارة قائمة المنتجات", icon: Boxes },
  { href: "/admin/categories", label: "الأقسام والفئات", icon: FolderTree },
  { href: "/admin/messages", label: "الرسائل والشكاوى الواردة", icon: MessageSquareQuote },
  { href: "/admin/errors", label: "سجلات أخطاء النظام", icon: ShieldAlert },
  { href: "/admin/customers", label: "قاعدة بيانات العملاء", icon: UserCheck },
  { href: "/admin/settings", label: "إعدادات المتجر والهوية", icon: SlidersHorizontal },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isLoginPage = pathname === "/admin/login";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const dateStr = new Date().toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setFormattedDate(dateStr);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isLoginPage && !user) {
      router.replace("/admin/login");
    }
  }, [user, loading, isLoginPage, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    } catch {
      toast.error("فشل تسجيل الخروج");
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-['Tajawal',sans-serif] dir-rtl" dir="rtl">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#FF274B] via-amber-500 to-yellow-400 blur-xl opacity-50 animate-pulse" />
            <Spinner size="lg" className="border-[#FF274B] border-t-transparent relative z-10" />
          </div>
          <p className="text-xs text-zinc-400 font-extrabold tracking-widest uppercase">جاري تحميل لوحة التحكم الفاخرة...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredSearchItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SidebarContent = (
    <aside className="w-64 bg-white/95 dark:bg-[#0E0E10]/95 backdrop-blur-2xl border-l border-zinc-200 dark:border-white/[0.06] flex flex-col h-full shadow-2xl text-zinc-900 dark:text-white font-['Tajawal',sans-serif] dir-rtl transition-colors duration-200" dir="rtl">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF274B] via-amber-500 to-amber-300 p-0.5 shadow-[0_0_20px_rgba(255,39,75,0.35)] group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="DEEP STORE Logo" className="h-6 w-auto object-contain invert" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wider text-zinc-900 dark:text-white group-hover:text-[#FF274B] transition-colors">DEEP STORE</span>
            <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase font-bold">LUXURY ADMIN</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Admin Profile Card */}
      <div className="px-4 py-4 border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-zinc-900/40">
        <div className="flex items-center gap-3 px-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF274B] to-amber-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                <img src="/api/wolf-icon" alt="Wolf" className="w-6 h-6 object-contain" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" title="متصل الآن" />
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-1">
              <p className="text-xs font-black truncate text-zinc-900 dark:text-white">المشرف العام</p>
              <Sparkles size={12} className="text-amber-400 shrink-0" />
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-mono">{user?.email || "storedeeb2020@gmail.com"}</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-300 relative ${
                isActive
                  ? "text-white font-extrabold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#FF274B] to-amber-500 rounded-xl shadow-[0_0_20px_rgba(255,39,75,0.3)]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                size={18}
                className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-white font-black" : "text-zinc-400 dark:text-zinc-500 group-hover:text-[#FF274B]"
                }`}
              />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Controls & Sign out */}
      <div className="px-3 pb-6 border-t border-zinc-200 dark:border-white/[0.06] pt-4 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/[0.06] text-zinc-800 dark:text-zinc-200 hover:border-[#FF274B]/50 transition-all cursor-pointer shadow-sm"
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? (
              <>
                <Sun size={16} className="text-amber-400" />
                <span>الوضع الفاتح ☀️</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-indigo-500" />
                <span>الوضع الداكن 🌙</span>
              </>
            )}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FF274B]/10 text-[#FF274B] font-mono font-extrabold">
            {theme === "dark" ? "Dark" : "Light"}
          </span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-red-500/10 hover:text-[#FF274B] transition-all duration-300 cursor-pointer"
        >
          <LogOut size={16} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex text-zinc-900 dark:text-white font-['Tajawal',sans-serif] selection:bg-[#FF274B] selection:text-white dir-rtl transition-colors duration-200" dir="rtl">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 bottom-0 right-0 z-30 w-64 border-l border-zinc-200 dark:border-white/[0.06]">
        {SidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="lg:hidden fixed top-0 bottom-0 right-0 z-50 w-64"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 lg:mr-64 mr-0 min-h-screen flex flex-col w-full min-w-0 bg-slate-50/50 dark:bg-[#050505] transition-colors duration-200">
        {/* Sticky Glass Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-white/[0.06] bg-white/80 dark:bg-[#0E0E10]/80 backdrop-blur-xl sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-[#FF274B] transition-colors"
              aria-label="القائمة"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
              <span className="font-black text-[#FF274B] tracking-wider text-[11px] hidden sm:inline uppercase">DEEP ADMIN</span>
              <ChevronLeft size={14} className="hidden sm:inline text-zinc-400 dark:text-zinc-600" />
              <span className="text-zinc-900 dark:text-zinc-100 font-extrabold truncate max-w-[180px] sm:max-w-none">
                {navItems.find((item) => pathname.startsWith(item.href) && item.href !== "/admin")?.label || "لوحة التحكم والتحليلات"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Date Pill */}
            {formattedDate && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                {formattedDate}
              </span>
            )}

            {/* Quick Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:text-white hover:border-[#FF274B]/50 transition-all text-xs font-bold shadow-sm"
              title="بحث سريع (Ctrl + K)"
            >
              <Search size={15} className="text-[#FF274B]" />
              <span className="hidden sm:inline">بحث سريع</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-300 dark:border-zinc-700">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Bell */}
            <Link
              href="/admin/messages"
              className="relative p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-[#FF274B] transition-colors shadow-sm"
              title="الرسائل والإشعارات"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF274B] animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF274B]" />
            </Link>

            {/* Quick Add Product Button */}
            <Link
              href="/admin/products"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF274B] to-amber-500 text-white font-extrabold text-xs shadow-md shadow-[#FF274B]/20 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Plus size={15} />
              <span>منتج جديد</span>
            </Link>
          </div>
        </header>

        {/* Global Search Modal */}
        <AnimatePresence>
          {searchOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSearchOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="relative w-full max-w-xl bg-[#0E0E10] border border-white/[0.1] rounded-2xl shadow-2xl p-4 overflow-hidden z-10"
              >
                <div className="flex items-center gap-3 px-3 pb-3 border-b border-white/[0.08]">
                  <Search size={18} className="text-[#FF274B]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن قسم، طلبات، منتجات، رسائل..."
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-zinc-500 font-bold"
                    autoFocus
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
                  {filteredSearchItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:bg-[#FF274B]/10 hover:text-white transition-colors"
                    >
                      <item.icon size={16} className="text-[#FF274B]" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  {filteredSearchItems.length === 0 && (
                    <p className="text-center py-6 text-xs text-zinc-500">لا توجد نتائج لمطابقة بحثك</p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Content Wrapper */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden text-zinc-900 dark:text-white font-['Tajawal',sans-serif]">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

