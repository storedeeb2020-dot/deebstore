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
} from "lucide-react";
import { getOrders, getProducts } from "@/lib/firebase/firestore";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Order } from "@/types/order";
import { Spinner } from "@/components/ui/Spinner";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
}

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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrders(), getProducts()])
      .then(([orders, products]) => {
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
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 text-amber-400">
        <Spinner size="lg" />
        <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">جاري تحميل البيانات والتحليلات...</p>
      </div>
    );
  }

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

                <p className="text-[11px] text-zinc-500">
                  {card.desc}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>

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
