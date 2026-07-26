"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ShieldCheck,
  AlertTriangle,
  Truck,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "@/lib/firebase/auth";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";

const navItems = [
  { href: "/admin", label: "لوحة التحكم والتحليلات", icon: LayoutDashboard },
  { href: "/admin/orders", label: "إدارة الطلبات", icon: ShoppingCart },
  { href: "/admin/shipping", label: "أسعار الشحن والمحافظات", icon: Truck },
  { href: "/admin/products", label: "إدارة المنتجات", icon: Package },
  { href: "/admin/categories", label: "الفئات والأقسام", icon: Tag },
  { href: "/admin/messages", label: "الرسائل والشكاوى", icon: MessageSquare },
  { href: "/admin/errors", label: "أخطاء وسجلات النظام", icon: AlertTriangle },
  { href: "/admin/customers", label: "قاعدة العملاء", icon: Users },
  { href: "/admin/settings", label: "إعدادات المتجر الهوية", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isLoginPage = pathname === "/admin/login";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (loading) return;
    if (!isLoginPage && !user) {
      router.replace("/admin/login");
    }
  }, [user, loading, isLoginPage, router]);

  useEffect(() => {
    // Permanent Dark Mode for Admin Dashboard
    document.documentElement.classList.add("dark");
  }, []);

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
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans dir-rtl" dir="rtl">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="border-amber-400 border-t-transparent" />
          <p className="text-xs text-amber-400 font-bold tracking-[0.2em] uppercase">جاري تحميل لوحة التحكم الفاخرة...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const SidebarContent = (
    <aside className="w-64 bg-zinc-950 border-l border-zinc-800/80 flex flex-col h-full shadow-2xl text-white font-sans dir-rtl" dir="rtl">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-zinc-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="DEEP STORE Logo" className="h-7 w-auto object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.5)] group-hover:scale-105 transition-transform" />
          <span className="text-sm font-black text-amber-400 tracking-wider">DEEP STORE</span>
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-1 text-zinc-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Admin User Info Capsule */}
      <div className="px-4 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center text-xs font-black shadow-lg shadow-amber-500/20">
            👑
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate text-amber-300">حساب المشرف العام</p>
            <p className="text-[11px] text-zinc-400 truncate font-mono">{user?.email || "storedeeb2020@gmail.com"}</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
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
                  ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20 font-black"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-amber-300"
              }`}
            >
              <Icon
                size={18}
                className={`transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-black" : "text-zinc-400 group-hover:text-amber-400"
                }`}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="px-3 pb-6 border-t border-zinc-800/80 pt-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-zinc-400 hover:bg-red-950/50 hover:text-red-400 transition-all duration-300 cursor-pointer"
        >
          <LogOut size={18} className="text-zinc-400 group-hover:text-red-400" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-black flex text-white font-sans selection:bg-amber-500 selection:text-black dir-rtl" dir="rtl">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 bottom-0 right-0 z-30 w-64 border-l border-zinc-800/80">
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
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed top-0 bottom-0 right-0 z-50 w-64"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 lg:mr-64 mr-0 min-h-screen flex flex-col w-full min-w-0 bg-black">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-amber-400 transition-colors"
              aria-label="القائمة"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] hidden sm:inline">لوحة الإدارة</span>
              <ChevronLeft size={14} className="hidden sm:inline text-zinc-600" />
              <span className="text-zinc-200 font-bold truncate max-w-[180px] sm:max-w-none">
                {navItems.find((item) => pathname.startsWith(item.href) && item.href !== "/admin")?.label || "نظرة عامة والتحليلات"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider shadow-sm">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>لوحة الإدارة المشفرة والآمنة 👑</span>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden bg-black text-white">
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
