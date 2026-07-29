"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowLeft,
  Clock,
  Plus,
  BarChart2,
  PieChart,
  Zap,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import { getOrders, getProducts } from "@/lib/firebase/firestore";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Order } from "@/types/order";
import { Spinner } from "@/components/ui/Spinner";

// ─── Types ────────────────────────────────────────────────
interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
}

interface DayRevenue {
  label: string;
  value: number;
}

interface ProductSales {
  name: string;
  count: number;
  revenue: number;
}

// ─── Status helpers ───────────────────────────────────────
const statusDots: Record<string, string> = {
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  shipped: "bg-indigo-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  processing: "جاري التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  pending: "#F59E0B",
  processing: "#3B82F6",
  shipped: "#6366F1",
  delivered: "#10B981",
  cancelled: "#FF274B",
};

// ─── Mini Luxury Bar Chart ─────────────────────────────────
function BarChart({ data }: { data: DayRevenue[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-28 w-full pt-4">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="w-full relative flex items-end justify-center h-24">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-zinc-900 border border-white/[0.1] text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-xl whitespace-nowrap z-10">
                {formatPrice(d.value)}
              </div>
              <motion.div
                className="w-full bg-gradient-to-t from-[#FF274B] via-amber-500 to-yellow-400 rounded-t-md group-hover:brightness-125 transition-all shadow-[0_0_15px_rgba(255,39,75,0.3)]"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(pct, 4)}%` }}
                transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="text-[9px] text-zinc-500 font-mono font-bold">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Mini Donut Chart (SVG) ────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div className="text-xs text-zinc-500 text-center py-8">لا توجد بيانات متاحة بعد</div>;

  const R = 36;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 80 80" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          {segments.map((seg, i) => {
            const dash = (seg.value / total) * C;
            const gap = C - dash;
            const el = (
              <motion.circle
                key={i}
                cx="40"
                cy="40"
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                initial={{ strokeDasharray: `0 ${C}` }}
                animate={{ strokeDasharray: `${dash} ${gap}` }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-black text-white">{total}</span>
          <span className="text-[8px] text-zinc-400 font-bold">طلب</span>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: seg.color }} />
              <span className="text-zinc-400 font-bold text-[11px]">{seg.label}</span>
            </div>
            <span className="font-mono font-bold text-white">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [weeklyData, setWeeklyData] = useState<DayRevenue[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ label: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrders(), getProducts()])
      .then(([orders, products]) => {
        // Basic stats
        const totalRevenue = orders
          .filter((o) => o.status !== "cancelled")
          .reduce((sum, o) => sum + o.total, 0);

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.length,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
        });
        setRecentOrders(orders.slice(0, 5));

        // ── Weekly revenue chart (last 7 days) ──────────────
        const dayMap: Record<string, number> = {};
        const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        const today = new Date();
        for (let d = 6; d >= 0; d--) {
          const dt = new Date(today);
          dt.setDate(today.getDate() - d);
          const key = dt.toLocaleDateString("en-CA");
          dayMap[key] = 0;
        }
        orders.forEach((o) => {
          const ts = o.createdAt as { toDate?: () => Date } | Date | string | number;
          const date: Date = ts && typeof ts === "object" && "toDate" in ts && ts.toDate ? ts.toDate() : new Date(ts as string | number | Date);
          const key = date.toLocaleDateString("en-CA");
          if (key in dayMap && o.status !== "cancelled") {
            dayMap[key] += o.total;
          }
        });
        const weekly: DayRevenue[] = Object.entries(dayMap).map(([key, value]) => {
          const d = new Date(key);
          return { label: dayNames[d.getDay()], value };
        });
        setWeeklyData(weekly);

        // ── Top 5 products by order count ───────────────────
        const prodMap: Record<string, { name: string; count: number; revenue: number }> = {};
        orders
          .filter((o) => o.status !== "cancelled")
          .forEach((o) => {
            o.items?.forEach((item) => {
              if (!prodMap[item.productId]) {
                prodMap[item.productId] = { name: item.productName || "منتج", count: 0, revenue: 0 };
              }
              prodMap[item.productId].count += item.quantity;
              prodMap[item.productId].revenue += item.price * item.quantity;
            });
          });
        const top = Object.values(prodMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setTopProducts(top);

        // ── Status breakdown for donut ───────────────────────
        const statCount: Record<string, number> = {};
        orders.forEach((o) => {
          statCount[o.status] = (statCount[o.status] || 0) + 1;
        });
        const breakdown = Object.entries(statCount).map(([key, val]) => ({
          label: statusLabels[key] || key,
          value: val,
          color: statusColors[key] || "#6B7280",
        }));
        setStatusBreakdown(breakdown);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 text-[#FF274B]">
        <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">جاري تحميل البيانات والتحليلات الفاخرة...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "إجمالي المبيعات والإيرادات",
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: TrendingUp,
      href: "/admin/orders",
      desc: "إجمالي الطلبات النشطة فقط",
      growth: "+24.8%",
    },
    {
      title: "إجمالي الطلبات المستلمة",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      href: "/admin/orders",
      desc: "عدد عمليات الشراء الناجحة",
      growth: "+18.2%",
    },
    {
      title: "طلبات قيد الانتظار والمراجعة",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      href: "/admin/orders?status=pending",
      desc: "تتطلب تأكيد أو شحن عاجل",
      growth: "عاجل",
    },
    {
      title: "المنتجات المعروضة بالمتجر",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      href: "/admin/products",
      desc: "الأصناف والتكتيكات المتاحة",
      growth: "مكتمل",
    },
  ];

  const maxProductRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);

  return (
    <div className="space-y-8 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-[#0E0E10] to-[#151518] border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FF274B]/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF274B]/10 border border-[#FF274B]/30 text-[#FF274B] text-xs font-bold">
              <Zap size={14} />
              <span>مرحباً بك في لوحة الإدارة الفاخرة لـ DEEP STORE 🐺</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              تحليلات المبيعات ونظرة عامة حية
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl">
              تتبع الإيرادات، إدارة الطلبات المباشرة، ومراقبة المخزون لحظة بلحظة بأعلى معايير الأداء والسرعة.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF274B] to-amber-500 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-lg shadow-[#FF274B]/25 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <Plus size={16} />
              <span>إضافة منتج جديد</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                href={card.href}
                className="block relative bg-white dark:bg-[#0E0E10] rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.06] hover:border-[#FF274B]/50 shadow-sm dark:shadow-2xl transition-all duration-300 group overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-[#FF274B] transition-colors">
                    {card.title}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF274B]/10 to-amber-500/10 border border-[#FF274B]/20 flex items-center justify-center text-[#FF274B] group-hover:scale-110 transition-transform">
                    <Icon size={18} />
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {card.value}
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ArrowUpRight size={12} />
                    {card.growth}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">{card.desc}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar Chart Section */}
        <motion.div
          className="lg:col-span-2 bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-[#FF274B] mb-1">
                <BarChart2 size={18} />
                <span className="text-xs font-black uppercase tracking-wider">تحليل الإيرادات (آخر 7 أيام)</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">حجم المبيعات اليومية المحققة من الطلبات الفعالة</p>
            </div>
            <div className="text-left">
              <span className="text-xs text-zinc-500 block font-bold">الإجمالي الأسبوعي</span>
              <span className="text-base font-black text-[#FF274B]">
                {formatPrice(weeklyData.reduce((s, d) => s + d.value, 0))}
              </span>
            </div>
          </div>

          <BarChart data={weeklyData} />
        </motion.div>

        {/* Status Donut Chart */}
        <motion.div
          className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 text-[#FF274B] mb-1">
            <PieChart size={18} />
            <span className="text-xs font-black uppercase tracking-wider">توزيع حالات الطلبات</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">نسب الإنجاز والمعالجة الحالية</p>
          <DonutChart segments={statusBreakdown} />
        </motion.div>
      </div>

      {/* Top Selling Products Showcase */}
      {topProducts.length > 0 && (
        <motion.div
          className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-[#FF274B]" />
              <div>
                <h2 className="text-base font-black text-zinc-900 dark:text-white">المنتجات الأكثر مبيعاً 🔥</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">أعلى 5 منتجات طلباً من العملاء</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {topProducts.map((p, i) => {
              const barPct = (p.revenue / maxProductRevenue) * 100;
              return (
                <div key={p.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#FF274B]/10 border border-[#FF274B]/20 flex items-center justify-center text-[#FF274B] font-black text-xs shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-zinc-900 dark:text-white font-bold truncate max-w-[200px]">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-right shrink-0">
                      <span className="text-zinc-500 dark:text-zinc-400 font-bold">{p.count} قطعة</span>
                      <span className="text-[#FF274B] font-black font-mono">{formatPrice(p.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#FF274B] via-amber-500 to-yellow-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">أحدث الطلبات المستلمة</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">آخر الطلبات المباشرة في المتجر</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF274B] hover:underline"
          >
            <span>عرض كافة الطلبات</span>
            <ArrowLeft size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            لا توجد طلبات أخيرًا.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">رقم الطلب</th>
                  <th className="py-3.5 px-4">العميل</th>
                  <th className="py-3.5 px-4">المحافظة</th>
                  <th className="py-3.5 px-4">الإجمالي</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-black text-[#FF274B]">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-4 px-4 font-bold text-zinc-900 dark:text-white">
                      {order.customerName}
                    </td>
                    <td className="py-4 px-4 text-zinc-600 dark:text-zinc-300">
                      {order.governorate}
                    </td>
                    <td className="py-4 px-4 font-black text-[#FF274B]">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06]">
                        <span className={`w-2 h-2 rounded-full ${statusDots[order.status] || "bg-zinc-500"}`} />
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
