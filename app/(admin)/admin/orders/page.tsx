"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  Sparkles,
  Trash2,
  Download,
  MessageCircle,
  ImageOff,
  Copy,
} from "lucide-react";
import { getOrders, updateOrderStatus, deleteOrder } from "@/lib/firebase/firestore";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/types/order";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

const STATUS_TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "كل الطلبات" },
  { value: "pending", label: "في الانتظار" },
  { value: "confirmed", label: "مؤكدة" },
  { value: "shipping", label: "جارٍ الشحن" },
  { value: "delivered", label: "مُسلَّمة" },
  { value: "cancelled", label: "ملغية" },
];

const STATUS_NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const statusDots: Record<string, string> = {
  pending: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
  confirmed: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
  shipping: "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]",
  delivered: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
  cancelled: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingScreenshot, setDeletingScreenshot] = useState(false);
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const name = (o.customerName || "").toLowerCase();
    const phone = o.phone || o.customerPhone || "";
    const id = (o.id || "").toLowerCase();
    const s = search.toLowerCase();

    const matchSearch =
      search === "" ||
      name.includes(s) ||
      phone.includes(search) ||
      id.includes(s) ||
      o.items?.some((item) => (item.sku || "").toLowerCase().includes(s) || (item.productName || "").toLowerCase().includes(s));
    return matchStatus && matchSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
      toast.success(`تم تحديث الحالة إلى: ${ORDER_STATUS_LABELS[newStatus]}`);
    } catch {
      toast.error("فشل تحديث الحالة");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب نهائياً من قاعدة البيانات؟")) return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      toast.success("تم حذف الطلب بنجاح");
    } catch {
      toast.error("فشل حذف الطلب");
    }
  };

  const handleDeleteScreenshot = async (order: Order) => {
    if (!order.transferScreenshot) return;
    if (!confirm("هل تريد مسح صورة التحويل نهائياً؟")) return;
    setDeletingScreenshot(true);
    try {
      const url = order.transferScreenshot;
      const parts = url.split("/");
      const fileName = parts[parts.length - 1].split(".")[0];
      const folderIndex = parts.findIndex((p) => p === "transfer_screenshots");
      const publicId = folderIndex >= 0
        ? `transfer_screenshots/${fileName}`
        : fileName;

      await fetch("/api/admin/orders/delete-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, publicId }),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, transferScreenshot: undefined } : o
        )
      );
      setSelectedOrder((prev) =>
        prev ? { ...prev, transferScreenshot: undefined } : prev
      );
      toast.success("تم مسح صورة التحويل بنجاح");
    } catch {
      toast.error("فشل مسح الصورة");
    } finally {
      setDeletingScreenshot(false);
    }
  };

  const handleWhatsAppScreenshot = (order: Order) => {
    const waNumber = order.whatsappPhone || order.phone;
    const msg = encodeURIComponent(
      `مرحباً ${order.customerName}، يسعدنا تواصلك مع DEEP STORE بخصوص الطلب رقم #${order.id.slice(0, 8).toUpperCase()}`
    );
    window.open(`https://wa.me/${waNumber.replace(/^0/, "20")}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-8 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            إدارة الطلبات المباشرة
            <span className="text-xs font-bold text-[#FF274B] bg-[#FF274B]/10 px-2.5 py-1 rounded-full border border-[#FF274B]/20">
              {filtered.length} طلب
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            استعراض الطلبات، متابعة التحويلات المالية، وتحديث حالة التسليم فوراً.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? orders.length
              : orders.filter((o) => o.status === tab.value).length;
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? "text-white font-extrabold shadow-lg shadow-[#FF274B]/20"
                  : "bg-white dark:bg-[#0E0E10] border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeOrderTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#FF274B] to-amber-500 rounded-2xl"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              <span
                className={`relative z-10 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FF274B]" />
        <input
          type="text"
          placeholder="ابحث بالاسم، رقم الهاتف، أو كود الطلب..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-11 pl-4 py-3.5 border border-zinc-200 dark:border-white/[0.08] rounded-2xl text-xs bg-white dark:bg-[#0E0E10] text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] shadow-sm transition-all placeholder:text-zinc-500 font-bold"
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 text-[#FF274B]">
          <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">جارٍ تحميل قائمة الطلبات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-16 text-center text-zinc-400 text-xs font-bold">
          لا توجد طلبات مطابقة للبحث أو التصفية الحالية
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] shadow-sm dark:shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">كود الطلب</th>
                  <th className="px-6 py-4">العميل</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">الإجمالي</th>
                  <th className="px-6 py-4">طريقة الدفع</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-[#FF274B] font-black">
                      #{order.id.slice(0, 8).toUpperCase()}
                      {order.transferScreenshot && (
                        <span className="mr-1.5 inline-block w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" title="يوجد إيصال تحويل مرفق" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{order.customerName || "—"}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{order.phone || order.customerPhone || "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-mono font-medium">
                      {formatDate(
                        order.createdAt instanceof Date
                          ? order.createdAt
                          : (order.createdAt as { toDate(): Date }).toDate()
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-zinc-900 dark:text-white">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                      {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06]">
                        <span className={`w-2 h-2 rounded-full ${statusDots[order.status] || "bg-zinc-500"}`} />
                        {ORDER_STATUS_LABELS[order.status]}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {STATUS_NEXT[order.status].length > 0 ? (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleStatusChange(order.id, e.target.value as OrderStatus);
                              }
                            }}
                            className="text-[11px] font-bold border border-zinc-200 dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 focus:outline-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white cursor-pointer hover:border-[#FF274B] transition-all"
                            disabled={updatingId === order.id}
                          >
                            <option value="">تغيير الحالة</option>
                            {STATUS_NEXT[order.status].map((s) => (
                              <option key={s} value={s}>
                                {ORDER_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-bold">مكتمل</span>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-zinc-400 hover:text-[#FF274B] hover:bg-[#FF274B]/10 rounded-xl transition-colors"
                          title="حذف الطلب"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal / Slide Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white dark:bg-[#0E0E10] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-white/[0.06] sticky top-0 bg-white/90 dark:bg-[#0E0E10]/90 backdrop-blur-md z-10" dir="rtl">
                <div>
                  <h3 className="font-black text-base text-zinc-900 dark:text-white tracking-wide">
                    تفاصيل الطلب الشاملة
                  </h3>
                  <p className="text-[11px] font-mono text-[#FF274B] font-black mt-0.5">
                    #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6" dir="rtl">
                {/* Status Bar */}
                <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${statusDots[selectedOrder.status] || "bg-zinc-400"}`} />
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      الحالة الحالية: {ORDER_STATUS_LABELS[selectedOrder.status]}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono font-bold">
                    {formatDate(
                      selectedOrder.createdAt instanceof Date
                        ? selectedOrder.createdAt
                        : (selectedOrder.createdAt as { toDate(): Date }).toDate()
                    )}
                  </span>
                </div>

                {/* Customer Info Card */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#FF274B]" /> بيانات العميل والتسليم
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-5">
                    <div>
                      <p className="text-zinc-500 font-bold">اسم العميل</p>
                      <p className="font-black text-zinc-900 dark:text-white mt-0.5">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 font-bold">رقم الهاتف</p>
                      <p className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5 flex items-center gap-2">
                        {selectedOrder.phone}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrder.phone || "");
                            toast.success("تم نسخ رقم هاتف العميل 📋");
                          }}
                          className="text-zinc-400 hover:text-[#FF274B] transition-colors p-1"
                          title="نسخ رقم الهاتف"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => handleWhatsAppScreenshot(selectedOrder)}
                          className="text-emerald-500 hover:text-emerald-400 transition-colors p-1"
                          title="محادثة واتساب"
                        >
                          <MessageCircle size={15} />
                        </button>
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 font-bold">المحافظة</p>
                      <p className="font-black text-zinc-900 dark:text-white mt-0.5">{selectedOrder.governorate || "—"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 font-bold">طريقة الدفع</p>
                      <p className="font-black text-zinc-900 dark:text-white mt-0.5">
                        {PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}
                      </p>
                    </div>
                    {selectedOrder.transferPhone && (
                      <div>
                        <p className="text-zinc-500 font-bold">رقم المحول منه</p>
                        <p className="font-mono font-black text-[#FF274B] mt-0.5 flex items-center gap-1.5">
                          <span>{selectedOrder.transferPhone}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedOrder.transferPhone || "");
                              toast.success("تم نسخ رقم المحول منه 📋");
                            }}
                            className="text-zinc-400 hover:text-[#FF274B] transition-colors p-1"
                            title="نسخ رقم المحول منه"
                          >
                            <Copy size={13} />
                          </button>
                        </p>
                      </div>
                    )}
                    <div className="col-span-2 border-t border-zinc-200 dark:border-white/[0.06] pt-3">
                      <p className="text-zinc-500 font-bold">العنوان التفصيلي</p>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{selectedOrder.address}</p>
                    </div>
                    {selectedOrder.notes && (
                      <div className="col-span-2 border-t border-zinc-200 dark:border-white/[0.06] pt-3">
                        <p className="text-zinc-500 font-bold">ملاحظات العميل</p>
                        <p className="font-bold text-amber-500 italic mt-0.5">&ldquo;{selectedOrder.notes}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transfer Screenshot */}
                {selectedOrder.transferScreenshot && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" /> إيصال تحويل فودافون كاش
                    </h4>
                    <div className="border border-zinc-200 dark:border-white/[0.06] rounded-2xl overflow-hidden bg-zinc-900">
                      <img
                        src={selectedOrder.transferScreenshot}
                        alt="إيصال التحويل"
                        className="w-full max-h-72 object-contain bg-black cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewScreenshotUrl(selectedOrder.transferScreenshot!)}
                      />
                      <div className="flex items-center gap-2 p-3 bg-zinc-950 border-t border-white/[0.06]">
                        <a
                          href={selectedOrder.transferScreenshot}
                          download="transfer-receipt.jpg"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 rounded-xl transition-all"
                        >
                          <Download size={14} />
                          تحميل الإيصال
                        </a>
                        <button
                          onClick={() => handleWhatsAppScreenshot(selectedOrder)}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 px-3.5 py-1.5 rounded-xl transition-all"
                        >
                          <MessageCircle size={14} />
                          واتساب
                        </button>
                        <button
                          onClick={() => handleDeleteScreenshot(selectedOrder)}
                          disabled={deletingScreenshot}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#FF274B] bg-[#FF274B]/10 border border-[#FF274B]/30 hover:bg-[#FF274B]/20 px-3.5 py-1.5 rounded-xl transition-all mr-auto"
                        >
                          <ImageOff size={14} />
                          {deletingScreenshot ? "مسح..." : "حذف الصورة"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#FF274B]" />
                    عناصر الطلب ({selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)} قطعة)
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] rounded-2xl"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.06] shrink-0 flex items-center justify-center p-1">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              width={48}
                              height={48}
                              className="object-contain"
                            />
                          ) : (
                            <div className="text-[10px] font-black text-amber-500">DEEP</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-black text-xs text-zinc-900 dark:text-white truncate">{item.productName}</p>
                            {item.sku && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(item.sku || "");
                                  toast.success(`تم نسخ كود المنتج (${item.sku}) بنجاح 📋`);
                                }}
                                className="px-2 py-0.5 rounded-md bg-[#FF274B]/10 hover:bg-[#FF274B]/20 text-[#FF274B] font-mono text-[10px] font-bold border border-[#FF274B]/30 inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                                title="اضغط لنسخ كود المنتج"
                              >
                                <Copy size={11} />
                                <span>كود: {item.sku}</span>
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                            اللون: {item.selectedColor?.name || "افتراضي"} | المقاس: {item.selectedSize || "قياسي"} | الكمية: {item.quantity || 1}
                          </p>
                        </div>
                        <p className="font-black text-xs text-[#FF274B] font-mono">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-200 dark:border-white/[0.06]">
                  <div>
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-wider">الإجمالي المطلوب</p>
                    <p className="text-2xl font-black text-[#FF274B] tracking-tight mt-0.5">
                      {formatPrice(selectedOrder.total)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <button
                      onClick={() => handleDeleteOrder(selectedOrder.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border border-[#FF274B]/30 text-[#FF274B] hover:bg-[#FF274B]/10 transition-all"
                    >
                      <Trash2 size={15} />
                      حذف الطلب
                    </button>
                    {STATUS_NEXT[selectedOrder.status].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selectedOrder.id, s)}
                        disabled={updatingId === selectedOrder.id}
                        className="inline-flex items-center gap-1.5 text-xs font-black px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF274B] to-amber-500 text-white shadow-md shadow-[#FF274B]/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        تحويل إلى: {ORDER_STATUS_LABELS[s]}
                        <ChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Screenshot Zoom Modal */}
      <AnimatePresence>
        {previewScreenshotUrl && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={() => setPreviewScreenshotUrl(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
            >
              <img src={previewScreenshotUrl} alt="إيصال" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
