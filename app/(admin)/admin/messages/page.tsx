"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MessageSquare,
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  Inbox,
  User,
  Search,
  RefreshCw,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Circle,
  Send,
} from "lucide-react";
import {
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
  type ContactMessage,
} from "@/lib/firebase/firestore";
import { Spinner } from "@/components/ui/Spinner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

  const loadMessages = async () => {
    try {
      const data = await getContactMessages();
      setMessages(data);
      if (data.length > 0 && !selectedMsg) {
        setSelectedMsg(data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل الرسائل والشكاوى");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleToggleStatus = async (msg: ContactMessage) => {
    const newStatus = msg.status === "unread" ? "read" : "unread";
    try {
      await updateContactMessageStatus(msg.id, newStatus);
      setMessages((prev) =>
        prev.map((item) =>
          item.id === msg.id ? { ...item, status: newStatus } : item
        )
      );
      if (selectedMsg?.id === msg.id) {
        setSelectedMsg((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
      toast.success(
        newStatus === "read"
          ? "تم تحديث حالة الرسالة إلى: مقروءة"
          : "تم تحديث حالة الرسالة إلى: غير مقروءة"
      );
    } catch (err) {
      console.error(err);
      toast.error("فشل تغيير حالة الرسالة");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت تأكد من رغبتك في حذف هذه الرسالة نهائياً؟")) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((item) => item.id !== id));
      if (selectedMsg?.id === id) {
        setSelectedMsg(null);
      }
      toast.success("تم حذف الرسالة بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("فشل حذف الرسالة");
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesFilter = filter === "all" ? true : msg.status === filter;
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      msg.name.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      (msg.phone && msg.phone.includes(query)) ||
      msg.message.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const readCount = messages.filter((m) => m.status === "read").length;

  return (
    <div className="space-y-8 max-w-7xl pb-16 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF274B] mb-1">
            <MessageSquare size={18} />
            صندوق الرسائل والشكاوى الواردة
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            رسائل واستفسارات عملاء المتجر ({messages.length})
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            استعراض الرسائل، الرد المباشر عبر الإيميل أو الواتساب، وإدارة الحالات.
          </p>
        </div>

        <button
          onClick={loadMessages}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.06] text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          تحديث البريد الوارد
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0E0E10] p-4 rounded-2xl border border-zinc-200 dark:border-white/[0.06] shadow-sm">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
                : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
            }`}
          >
            الكل ({messages.length})
          </button>

          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "unread"
                ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
                : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
            }`}
          >
            غير مقروء ({unreadCount})
          </button>

          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "read"
                ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
                : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
            }`}
          >
            مقروء ({readCount})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FF274B]" />
          <input
            type="text"
            placeholder="بحث بالاسم، الإيميل، الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none font-bold"
          />
        </div>
      </div>

      {/* Dual Pane Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#FF274B]">
          <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-16 text-center text-zinc-400 text-xs font-bold shadow-sm">
          لا توجد رسائل مطابقة للفلتر المحدد
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Message List Pane */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-4 shadow-sm dark:shadow-2xl space-y-2 max-h-[600px] overflow-y-auto">
            {filteredMessages.map((msg) => {
              const isSelected = selectedMsg?.id === msg.id;
              const isUnread = msg.status === "unread";
              return (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMsg(msg)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 text-white border-[#FF274B]"
                      : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/[0.06] hover:border-zinc-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {isUnread ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF274B] shadow-[0_0_8px_rgba(255,39,75,0.6)]" />
                      ) : (
                        <CheckCircle2 size={13} className="text-zinc-500" />
                      )}
                      <span className="font-black text-xs truncate max-w-[160px]">{msg.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(msg.createdAt?.toDate ? msg.createdAt.toDate() : msg.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                    {msg.message}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Message Detail Pane */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 shadow-sm dark:shadow-2xl space-y-6">
            {selectedMsg ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
                  <div>
                    <h3 className="font-black text-base text-zinc-900 dark:text-white">{selectedMsg.name}</h3>
                    <p className="text-xs font-mono text-zinc-500 mt-0.5">{selectedMsg.email} {selectedMsg.phone && `• ${selectedMsg.phone}`}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(selectedMsg)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        selectedMsg.status === "unread"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                          : "border-zinc-200 dark:border-white/[0.1] text-zinc-400"
                      }`}
                    >
                      {selectedMsg.status === "unread" ? "تعليم كـ مقروء" : "تعليم كـ غير مقروء"}
                    </button>

                    <button
                      onClick={() => handleDelete(selectedMsg.id)}
                      className="p-2 text-zinc-400 hover:text-[#FF274B] hover:bg-[#FF274B]/10 rounded-xl transition-colors"
                      title="حذف الرسالة"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-200 dark:border-white/[0.06] text-xs leading-loose text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-bold">
                  {selectedMsg.message}
                </div>

                {/* Reply Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-white/[0.06]">
                  <a
                    href={`mailto:${selectedMsg.email}?subject=رد من متجر DEEP STORE&body=مرحباً ${selectedMsg.name}،`}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF274B] text-white py-3 rounded-2xl font-black text-xs shadow-md hover:bg-[#FF274B]/90 transition-colors"
                  >
                    <Mail size={15} />
                    رد عبر البريد الإلكتروني
                  </a>

                  {selectedMsg.phone && (
                    <a
                      href={`https://wa.me/${selectedMsg.phone.replace(/^0/, "20")}?text=${encodeURIComponent(`مرحباً ${selectedMsg.name}، يسعدنا تواصلك مع DEEP STORE`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-2xl font-black text-xs shadow-md hover:bg-emerald-500 transition-colors"
                    >
                      <MessageCircle size={15} />
                      محادثة واتساب
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-zinc-500 text-xs font-bold">
                اختر رسالة من القائمة لعرض تفاصيلها والرد عليها
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
