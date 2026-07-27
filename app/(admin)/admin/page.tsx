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
} from "lucide-react";
import { getOrders, getProducts } from "@/lib/firebase/firestore";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Order } from "@/types/order";
import type { Product } from "@/types/product";
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
  cancelled: "#EF4444",
};

// ─── Mini Bar Chart (pure CSS) ─────────────────────────────
function BarChart({ data }: { data: DayRevenue[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full relative flex items-end justify-center h-20">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-zinc-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                {formatPrice(d.value)}
              </div>
              <motion.div
                className="w-full bg-amber-400 rounded-t-sm"
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="text-[8px] text-zinc-500 font-mono">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Mini Donut Chart (SVG) ────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div className="text-xs text-zinc-500 text-center py-8">لا توجد بيانات بعد</div>;

  const R = 36;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 80 80" className="w-20 h-20 shrink-0" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="40" cy="40" r={R} fill="none" stroke="#18181b" strokeWidth="14" />
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
              strokeWidth="14"
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
      <div className="space-y-1.5 flex-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[10px] text-zinc-400">{seg.label}</span>
            </div>
            <span className="text-[10px] font-bold text-white">{seg.value}</span>
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
        const dayNames = ["أحد", "اثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];
        const today = new Date();
        for (let d = 6; d >= 0; d--) {
          const dt = new Date(today);
          dt.setDate(today.getDate() - d);
          const key = dt.toLocaleDateString("en-CA");
          dayMap[key] = 0;
        }
        orders.forEach((o) => {
          const ts = o.createdAt as any;
          const date: Date = ts?.toDate ? ts.toDate() : new Date(ts);
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
      <div className="flex flex-col items-center justify-center h-96 space-y-4 text-amber-400">
        <Spinner size="lg" />
        <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">جاري تحميل البيانات والتحليلات...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "إجمالي الأرباح والمبيعات",
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: TrendingUp,
      href: "/admin/orders",
      desc: "إجمالي المبيعات النشطة (باستثناء الملغاة)",
    },
    {
      title: "إجمالي الطلبات",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      href: "/admin/orders",
      desc: "عدد الطلبات المستلمة حتى الآن",
    },
    {
      title: "طلبات قيد الانتظار",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      href: "/admin/orders?status=pending",
      desc: "طلبات تنتظر المراجعة والتجهيز",
    },
    {
      title: "منتجات المتجر المتاحة",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      href: "/admin/products",
      desc: "الأصناف المعروضة حالياً بالمتجر",
    },
  ];

  const maxProductRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);

  return (
    <div className="space-y-10 font-sans dir-rtl text-white" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">نظرة عامة والتحليلات الحية 👑</h1>
          <p className="text-zinc-400 text-xs mt-1">
            متابعة إحصائيات المبيعات، الطلبات الحية، وإدارة منتجات DEEP STORE.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black px-5 py-3 rounded-xl font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <Plus size={16} />
            إضافة منتج جديد
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                className="block bg-zinc-950 rounded-2xl p-6 border border-zinc-800 hover:border-amber-500/50 shadow-2xl transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-zinc-400 group-hover:text-amber-400 transition-colors">
                    {card.title}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white mb-2 tracking-tight">
                  {card.value}
                </div>
                <p className="text-[11px] text-zinc-500">{card.desc}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly Revenue Bar Chart */}
        <motion.div
          className="lg:col-span-2 bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <BarChart2 size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">مبيعات آخر 7 أيام</span>
              </div>
              <p className="text-xs text-zinc-500">الإيرادات اليومية من الطلبات المكتملة</p>
            </div>
            <span className="text-xs font-black text-amber-400">
              {formatPrice(weeklyData.reduce((s, d) => s + d.value, 0))}
            </span>
          </div>
          <BarChart data={weeklyData} />
        </motion.div>

        {/* Status Donut Chart */}
        <motion.div
          className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <PieChart size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">توزيع الطلبات</span>
          </div>
          <p className="text-xs text-zinc-500 mb-5">حسب حالة كل طلب</p>
          <DonutChart segments={statusBreakdown} />
        </motion.div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <motion.div
          className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
            <div>
              <h2 className="text-base font-black text-white">🏆 أكثر المنتجات مبيعاً</h2>
              <p className="text-xs text-zinc-400 mt-0.5">أعلى 5 منتجات من حيث عدد الطلبات</p>
            </div>
          </div>
          <div className="space-y-4">
            {topProducts.map((p, i) => {
              const barPct = (p.revenue / maxProductRevenue) * 100;
              return (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-white font-bold truncate max-w-[160px]">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-right shrink-0">
                      <span className="text-zinc-400">{p.count} قطعة</span>
                      <span className="text-amber-400 font-black">{formatPrice(p.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
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

      {/* Recent Orders Section */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white">أحدث الطلبات المستلمة</h2>
            <p className="text-xs text-zinc-400 mt-0.5">آخر الطلبات التي تم إنشاؤها عبر المتجر</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>عرض كافة الطلبات</span>
            <ArrowLeft size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            لا توجد طلبات جديدة حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">رقم الطلب</th>
                  <th className="py-3 px-4">العميل</th>
                  <th className="py-3 px-4">المحافظة</th>
                  <th className="py-3 px-4">المبلغ الإجمالي</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {order.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      {order.governorate}
                    </td>
                    <td className="py-3.5 px-4 font-black text-amber-300">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-200">
                        <span className={`w-2 h-2 rounded-full ${statusDots[order.status] || "bg-zinc-500"}`} />
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
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
