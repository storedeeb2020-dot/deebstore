"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowRight,
  Clock,
  ChevronRight,
  Plus,
} from "lucide-react";
import { getOrders } from "@/lib/firebase/firestore";
import { getProducts } from "@/lib/firebase/firestore";
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
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
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
      title: "Total Revenue",
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: TrendingUp,
      href: "/admin/orders",
      progress: "85%", // Simulated target completion
      desc: "Gross sales (excl. cancelled)",
    },
    {
      title: "Active Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      href: "/admin/orders",
      progress: "60%",
      desc: "Total lifetime orders placed",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      href: "/admin/orders?status=pending",
      progress: "35%",
      desc: "Awaiting fulfillment",
    },
    {
      title: "Store Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      href: "/admin/products",
      progress: "100%",
      desc: "Active listed items",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Spinner size="lg" />
        <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">Loading stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Welcome header with action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Overview</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time analytics and management controls for DEEP STORE.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all duration-300 shadow-md shadow-zinc-900/10"
          >
            <Plus size={14} />
            Manage Products
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
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
                className="block bg-white rounded-2xl p-6 border border-zinc-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:border-zinc-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] tracking-wider text-zinc-400 font-bold uppercase">
                    {card.title}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                    <Icon size={14} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-1">{card.value}</h3>
                <p className="text-[10px] text-zinc-400 font-medium">{card.desc}</p>
                
                {/* Clean Micro progress bar */}
                <div className="w-full h-1 bg-zinc-50 rounded-full mt-5 overflow-hidden">
                  <div 
                    className="bg-zinc-900 h-full rounded-full transition-all duration-500" 
                    style={{ width: card.progress }}
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders section */}
      <div className="bg-white rounded-2xl border border-zinc-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <div>
            <h2 className="font-black text-sm text-zinc-900 uppercase tracking-widest">Recent Orders</h2>
            <p className="text-zinc-400 text-xs mt-0.5">Showing the latest orders registered on Firestore</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1 group"
          >
            View all orders
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-16 text-center text-zinc-400 text-xs font-medium">
            No orders registered in the system yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Order ID</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-left">Fulfillment</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-zinc-500 font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{order.customerName}</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                      {formatDate(
                        order.createdAt instanceof Date
                          ? order.createdAt
                          : (order.createdAt as { toDate(): Date }).toDate()
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-zinc-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-800 capitalize">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDots[order.status] || "bg-zinc-300"}`} />
                        {order.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders?id=${order.id}`}
                        className="inline-flex items-center gap-1 text-[10px] font-bold bg-zinc-50 text-zinc-700 hover:bg-zinc-900 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-300"
                      >
                        Manage
                        <ChevronRight size={10} />
                      </Link>
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
