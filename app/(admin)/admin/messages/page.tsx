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
  ExternalLink,
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
      toast.error("Failed to load messages");
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
        prev.map((item) => (item.id === msg.id ? { ...item, status: newStatus } : item))
      );
      toast.success(
        newStatus === "read"
          ? "Message marked as read"
          : "Message marked as unread"
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((item) => item.id !== id));
      toast.success("Message deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete message");
    }
  };

  // Stats calculation
  const totalCount = messages.length;
  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const readCount = messages.filter((m) => m.status === "read").length;

  const filteredMessages = messages
    .filter((m) => {
      if (filter === "unread") return m.status === "unread";
      if (filter === "read") return m.status === "read";
      return true;
    })
    .filter((m) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.message?.toLowerCase().includes(q)
      );
    });

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "Just now";
    try {
      const tsObj = timestamp as { toDate?: () => Date };
      const date = typeof tsObj.toDate === "function" ? tsObj.toDate() : new Date(timestamp as string | number | Date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
            <MessageSquare size={14} />
            Customer Support & Complaints
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">
            Messages & Inquiries (الرسائل والشكاوي)
          </h1>
          <p className="text-zinc-500 text-xs mt-1">
            View, manage, and respond to messages submitted by customers via the Contact Us form.
          </p>
        </div>

        <button
          onClick={loadMessages}
          className="inline-flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors self-start sm:self-auto"
        >
          Refresh Inbox
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Inbox</span>
            <div className="w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-600">
              <Inbox size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900 mt-2">{totalCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Unread Messages</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{unreadCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reviewed</span>
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900 mt-2">{readCount}</p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(["all", "unread", "read"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {tab === "all" ? "All Messages" : tab}
              {tab === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[9px]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-zinc-900 bg-zinc-50/50"
          />
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Inbox size={24} />
          </div>
          <h3 className="font-bold text-zinc-800 text-sm">No Messages Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {search ? "No customer inquiries match your search filter." : "Your contact form inbox is clear! New customer messages will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] relative ${
                msg.status === "unread"
                  ? "border-amber-200/80 bg-amber-50/10"
                  : "border-zinc-100"
              }`}
            >
              {/* Top Header of Message Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    {msg.name?.charAt(0).toUpperCase() || <User size={16} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-zinc-900">{msg.name}</h3>
                      {msg.status === "unread" && (
                        <span className="text-[9px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          New Message
                        </span>
                      )}
                    </div>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 mt-0.5"
                    >
                      <Mail size={12} />
                      {msg.email}
                      <ExternalLink size={10} className="text-zinc-400" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-[11px] font-medium text-zinc-400">
                    {formatDate(msg.createdAt)}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(msg)}
                    className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                      msg.status === "unread"
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                    title={msg.status === "unread" ? "Mark as Read" : "Mark as Unread"}
                  >
                    {msg.status === "unread" ? "Mark Read" : "Mark Unread"}
                  </button>

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Message Content Body */}
              <div className="bg-zinc-50/80 rounded-xl p-4 border border-zinc-100/80">
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-800 whitespace-pre-line font-normal">
                  {msg.message}
                </p>
              </div>

              {/* Quick Reply Button */}
              <div className="mt-4 flex justify-end">
                <a
                  href={`mailto:${msg.email}?subject=RE: DEEP STORE Inquiry Response&body=Hi ${encodeURIComponent(msg.name)},\n\nThank you for reaching out to DEEP STORE.\n\n`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-zinc-900 text-white px-4 py-2.5 rounded-xl hover:bg-zinc-800 transition-all shadow-md shadow-zinc-900/10"
                >
                  <Mail size={14} />
                  Reply via Email
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
