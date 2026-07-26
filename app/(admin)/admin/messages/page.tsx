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
} from "lucide-react";
import {
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
  type ContactMessage,
} from "@/lib/firebase/firestore";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");

  const loadMessages = async () => {
    try {
      const data = await getContactMessages();
      setMessages(data);
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
      toast.success("تم حذف الرسالة بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("فشل حذف الرسالة");
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesFilter =
      filter === "all" ? true : msg.status === filter;
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
  const totalCount = messages.length;

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-amber-400 space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">جاري تحميل رسائل العملاء والشكاوى...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16 font-sans dir-rtl text-white" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <MessageSquare size={14} />
            خدمة العملاء والشكاوى والتواصل
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            صندوق الرسائل والشكاوى
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            متابعة وإدارة والرد على كافة استفسارات وشكاوى العملاء المرسلة عبر الموقع.
          </p>
        </div>

        <button
          onClick={loadMessages}
          className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-amber-400 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          تحديث البريد الوارد
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-zinc-400">إجمالي الوارد</span>
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Inbox size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalCount}</p>
        </div>

        <div className="bg-zinc-950 rounded-2xl border border-amber-500/40 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-amber-400">رسائل جديدة غير مقروءة</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{unreadCount}</p>
        </div>

        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-emerald-400">تمت المراجعة والرد</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{readCount}</p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-amber-500 text-black font-black"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            الكافة ({totalCount})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "unread"
                ? "bg-amber-500 text-black font-black"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            غير مقروءة ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "read"
                ? "bg-amber-500 text-black font-black"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            مقروءة ({readCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="بحث بالاسم، الإيميل أو الرسالة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-12 text-center text-zinc-500 space-y-3">
          <MessageSquare size={36} className="mx-auto text-zinc-700" />
          <p className="text-sm font-bold text-zinc-400">لا توجد رسائل مطابقة للفلتر في البريد الوارد.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-zinc-950 rounded-2xl border transition-all p-5 sm:p-6 space-y-4 ${
                msg.status === "unread"
                  ? "border-amber-500/50 shadow-lg shadow-amber-500/5"
                  : "border-zinc-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{msg.name}</h3>
                      {msg.status === "unread" && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-extrabold">
                          جديد
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5 dir-ltr">
                      <span>{msg.email}</span>
                      {msg.phone && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{msg.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 align-self-end sm:align-self-auto">
                  <button
                    onClick={() => handleToggleStatus(msg)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      msg.status === "unread"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {msg.status === "unread" ? "تعليم كـ مقروء" : "تعليم كـ غير مقروء"}
                  </button>

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-950 transition-colors"
                    title="حذف الرسالة"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Message Content Body */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
                <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">
                  {msg.message}
                </p>
              </div>

              {/* Reply Link */}
              <div className="flex justify-end pt-1">
                <a
                  href={`mailto:${msg.email}?subject=RE: DEEP STORE Inquiry Response&body=Hi ${encodeURIComponent(msg.name)},\n\nThank you for reaching out to DEEP STORE.\n\n`}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-400 text-black px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-md cursor-pointer"
                >
                  <Mail size={14} />
                  <span>رد مباشر عبر الإيميل</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
