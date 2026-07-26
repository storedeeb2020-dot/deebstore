"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronRight, Sparkles, Trash2, Download, MessageCircle, ImageOff } from "lucide-react";
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
  pending: "bg-amber-500",
  confirmed: "bg-blue-500",
  shipping: "bg-indigo-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingScreenshot, setDeletingScreenshot] = useState(false);

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
      id.includes(s);
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
    if (!confirm("هل أنت متأكد من حذف هذا الطلب نهائياً؟")) return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      toast.success("تم حذف الطلب بنجاح");
    } catch {
      toast.error("فشل حذف الطلب");
    }
  };

  // Delete transfer screenshot from Cloudinary + clear from order
  const handleDeleteScreenshot = async (order: Order) => {
    if (!order.transferScreenshot) return;
    if (!confirm("هل تريد مسح صورة التحويل نهائياً؟")) return;
    setDeletingScreenshot(true);
    try {
      // Extract public_id from Cloudinary URL
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
      toast.success("تم مسح صورة التحويل");
    } catch {
      toast.error("فشل مسح الصورة");
    } finally {
      setDeletingScreenshot(false);
    }
  };

  // Send screenshot via WhatsApp
  const handleWhatsAppScreenshot = (order: Order) => {
    if (!order.transferScreenshot) return;
    const waNumber = order.whatsappPhone || order.phone;
    const msg = encodeURIComponent(
      `إيصال تحويل طلب رقم #${order.id.slice(0, 8).toUpperCase()}\n\n${order.transferScreenshot}`
    );
    window.open(`https://wa.me/${waNumber.replace(/^0/, "20")}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">إدارة الطلبات</h1>
        <p className="text-zinc-400 text-xs mt-1">
          {orders.length} طلب إجمالاً — اضغط على أي طلب لعرض تفاصيله
        </p>
      </div>

      {/* Status Tabs */}
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10"
                  : "bg-white border border-zinc-100 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-zinc-50 text-zinc-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="بحث بالاسم، رقم الهاتف، أو رقم الطلب..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-3 border border-zinc-100 rounded-xl text-xs bg-white focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all placeholder:text-zinc-400"
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Spinner size="lg" />
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">جارٍ تحميل الطلبات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100/80 p-16 text-center text-zinc-400 text-xs font-medium">
          لا توجد طلبات مطابقة للفلتر
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-4 text-right">رقم الطلب</th>
                  <th className="px-6 py-4 text-right">العميل</th>
                  <th className="px-6 py-4 text-right">التاريخ</th>
                  <th className="px-6 py-4 text-right">الإجمالي</th>
                  <th className="px-6 py-4 text-right">الدفع</th>
                  <th className="px-6 py-4 text-right">الحالة</th>
                  <th className="px-6 py-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500 font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                      {order.transferScreenshot && (
                        <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-400" title="يوجد إيصال تحويل" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-zinc-900">{order.customerName || "—"}</p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{order.phone || order.customerPhone || "—"}</p>
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
                    <td className="px-6 py-4 text-[10px] font-bold text-zinc-600">
                      {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-800">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDots[order.status] || "bg-zinc-300"}`} />
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
                            className="text-[10px] font-bold border border-zinc-100 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-300 bg-white cursor-pointer hover:bg-zinc-50 transition-all"
                            disabled={updatingId === order.id}
                          >
                            <option value="">تغيير</option>
                            {STATUS_NEXT[order.status].map((s) => (
                              <option key={s} value={s}>
                                {ORDER_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[10px] text-zinc-300 font-bold">مغلق</span>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف الطلب"
                        >
                          <Trash2 size={15} />
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

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 sticky top-0 bg-white z-10" dir="rtl">
                <div>
                  <h3 className="font-black text-sm text-zinc-900 uppercase tracking-widest">
                    تفاصيل الطلب
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                    #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6" dir="rtl">
                {/* Status bar */}
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusDots[selectedOrder.status] || "bg-zinc-300"}`} />
                    <span className="text-xs font-bold text-zinc-800">
                      الحالة الحالية: {ORDER_STATUS_LABELS[selectedOrder.status]}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {formatDate(
                      selectedOrder.createdAt instanceof Date
                        ? selectedOrder.createdAt
                        : (selectedOrder.createdAt as { toDate(): Date }).toDate()
                    )}
                  </span>
                </div>

                {/* Customer Details */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Sparkles size={11} /> بيانات العميل
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs bg-white border border-zinc-100 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.005)]">
                    <div>
                      <p className="text-zinc-400 font-medium">الاسم</p>
                      <p className="font-bold text-zinc-900 mt-0.5">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 font-medium">الهاتف</p>
                      <p className="font-mono font-bold text-zinc-900 mt-0.5 flex items-center gap-2">
                        {selectedOrder.phone}
                        <a
                          href={`https://wa.me/${selectedOrder.whatsappPhone?.replace(/^0/, "20") || selectedOrder.phone.replace(/^0/, "20")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-green-600 hover:text-green-700"
                          title="فتح واتساب"
                        >
                          <MessageCircle size={13} />
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400 font-medium">المحافظة</p>
                      <p className="font-bold text-zinc-900 mt-0.5">{selectedOrder.governorate || "—"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 font-medium">الدفع</p>
                      <p className="font-bold text-zinc-900 mt-0.5">
                        {PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}
                      </p>
                    </div>
                    {selectedOrder.transferPhone && (
                      <div>
                        <p className="text-zinc-400 font-medium">رقم التحويل</p>
                        <p className="font-mono font-bold text-zinc-900 mt-0.5">{selectedOrder.transferPhone}</p>
                      </div>
                    )}
                    <div className="col-span-2 border-t border-zinc-50 pt-3">
                      <p className="text-zinc-400 font-medium">العنوان</p>
                      <p className="font-bold text-zinc-800 mt-0.5">{selectedOrder.address}</p>
                    </div>
                    {selectedOrder.notes && (
                      <div className="col-span-2 border-t border-zinc-50 pt-3">
                        <p className="text-zinc-400 font-medium">ملاحظات</p>
                        <p className="font-bold text-zinc-700 italic mt-0.5">&ldquo;{selectedOrder.notes}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transfer Screenshot */}
                {selectedOrder.transferScreenshot && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                      <Sparkles size={11} /> إيصال التحويل
                    </h4>
                    <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                      <img
                        src={selectedOrder.transferScreenshot}
                        alt="إيصال التحويل"
                        className="w-full max-h-64 object-contain bg-zinc-50"
                      />
                      <div className="flex items-center gap-2 p-3 bg-white border-t border-zinc-100">
                        <a
                          href={selectedOrder.transferScreenshot}
                          download="transfer-receipt.jpg"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Download size={13} />
                          تحميل
                        </a>
                        <button
                          onClick={() => handleWhatsAppScreenshot(selectedOrder)}
                          className="flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <MessageCircle size={13} />
                          إرسال واتساب
                        </button>
                        <button
                          onClick={() => handleDeleteScreenshot(selectedOrder)}
                          disabled={deletingScreenshot}
                          className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-all mr-auto"
                        >
                          <ImageOff size={13} />
                          {deletingScreenshot ? "جارٍ المسح..." : "مسح الصورة"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Sparkles size={11} />
                    المنتجات ({selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)})
                  </h4>
                  <div className="space-y-2.5">
                    {selectedOrder.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3.5 p-3.5 bg-zinc-50/50 border border-zinc-100 rounded-2xl"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-zinc-100 flex-shrink-0 flex items-center justify-center p-1">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          ) : (
                            <div className="text-[10px] font-black text-amber-500/50">DEEP</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-zinc-950 truncate">{item.productName}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                            اللون: {item.selectedColor?.name || "افتراضي"} | المقاس: {item.selectedSize || "قياسي"} | الكمية: {item.quantity || 1}
                          </p>
                        </div>
                        <p className="font-black text-xs text-zinc-950">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-100">
                  <div>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">الإجمالي الكلي</p>
                    <p className="text-2xl font-black text-zinc-900 tracking-tight mt-0.5">
                      {formatPrice(selectedOrder.total)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <button
                      onClick={() => handleDeleteOrder(selectedOrder.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={14} />
                      حذف الطلب
                    </button>
                    {STATUS_NEXT[selectedOrder.status].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selectedOrder.id, s)}
                        disabled={updatingId === selectedOrder.id}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
                          s === "cancelled"
                            ? "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                            : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/10"
                        }`}
                      >
                        تحويل إلى: {ORDER_STATUS_LABELS[s]}
                        <ChevronRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
