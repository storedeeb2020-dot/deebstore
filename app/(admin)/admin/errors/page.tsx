"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Terminal,
} from "lucide-react";
import {
  getSystemErrorLogs,
  updateSystemErrorStatus,
  deleteSystemErrorLog,
  clearAllSystemErrors,
  type SystemErrorLog,
} from "@/lib/firebase/firestore";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminErrorLogsPage() {
  const [logs, setLogs] = useState<SystemErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<SystemErrorLog | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSystemErrorLogs();
      setLogs(data);
      if (data.length > 0 && !selectedLog) {
        setSelectedLog(data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل سجلات الأخطاء");
    } finally {
      setLoading(false);
    }
  }, [selectedLog]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleToggleStatus = async (id: string, currentResolved: boolean) => {
    try {
      await updateSystemErrorStatus(id, !currentResolved);
      setLogs((prev) =>
        prev.map((log) => (log.id === id ? { ...log, resolved: !currentResolved } : log))
      );
      if (selectedLog?.id === id) {
        setSelectedLog((prev) => (prev ? { ...prev, resolved: !currentResolved } : prev));
      }
      toast.success(!currentResolved ? "تمت معالجة الخطأ" : "تم إلغاء علم المعالجة");
    } catch {
      toast.error("فشل تحديث حالة الخطأ");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت تأكد من رغبتك في حذف هذا الخطأ؟")) return;
    try {
      await deleteSystemErrorLog(id);
      setLogs((prev) => prev.filter((log) => log.id !== id));
      if (selectedLog?.id === id) setSelectedLog(null);
      toast.success("تم مسح السجل بنجاح");
    } catch {
      toast.error("فشل مسح السجل");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("هل أنت تأكد من رغبتك في مسح كافة سجلات الأخطاء نهائياً؟")) return;
    try {
      await clearAllSystemErrors();
      setLogs([]);
      setSelectedLog(null);
      toast.success("تم مسح جميع السجلات بنجاح 🐺");
    } catch {
      toast.error("فشل مسح السجلات");
    }
  };

  const handleCopyStack = (stack: string, id: string) => {
    navigator.clipboard.writeText(stack);
    setCopiedId(id);
    toast.success("تم نسخ تفاصيل الخطأ (Stack Trace) بنجاح 📋");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "unresolved" && log.resolved) return false;
    if (filter === "resolved" && !log.resolved) return false;

    const query = search.toLowerCase();
    return (
      !search ||
      log.message?.toLowerCase().includes(query) ||
      log.path?.toLowerCase().includes(query) ||
      log.stack?.toLowerCase().includes(query)
    );
  });

  const unresolvedCount = logs.filter((l) => !l.resolved).length;
  const resolvedCount = logs.filter((l) => l.resolved).length;

  return (
    <div className="space-y-8 max-w-7xl pb-16 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF274B] mb-1">
            <Terminal size={18} />
            منصة تتبع أخطاء وسجلات النظام (System Console)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            سجلات ومراقبة الأخطاء البرمجية ({logs.length})
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            تتبع الاستثناءات، قراءة الـ Stack Trace الفني، ومعالجة المشاكل التقنية للمتجر.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.06] text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            إعادة تحميل
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 bg-[#FF274B]/10 hover:bg-[#FF274B]/20 text-[#FF274B] border border-[#FF274B]/30 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <Trash2 size={14} />
              مسح السجلات بالكامل
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0E0E10] p-4 rounded-2xl border border-zinc-200 dark:border-white/[0.06] shadow-sm">
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
                : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
            }`}
          >
            الكل ({logs.length})
          </button>
          <button
            onClick={() => setFilter("unresolved")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "unresolved"
                ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
                : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
            }`}
          >
            جديد/غير محلول ({unresolvedCount})
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "resolved"
                ? "bg-[#FF274B] text-white shadow-md shadow-[#FF274B]/20"
                : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
            }`}
          >
            تمت معالجته ({resolvedCount})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FF274B]" />
          <input
            type="text"
            placeholder="ابحث بـ المسار، الـ Stack Trace، أخطاء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none font-bold"
          />
        </div>
      </div>

      {/* IDE Terminal Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#FF274B]">
          <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-[#050505] rounded-3xl border border-white/[0.08] p-16 text-center text-zinc-500 text-xs font-mono">
          <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
          <p className="font-bold text-white text-sm">النظام يعمل بكفاءة 100% ولا توجد أي أخطاء مسجلة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Logs List Pane */}
          <div className="lg:col-span-5 bg-[#0A0A0C] rounded-3xl border border-white/[0.08] p-4 shadow-2xl space-y-2 max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer font-mono text-xs ${
                    isSelected
                      ? "bg-zinc-900 text-white border-[#FF274B] shadow-[0_0_15px_rgba(255,39,75,0.2)]"
                      : "bg-[#0E0E10] border-white/[0.06] hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.resolved ? "bg-emerald-500/20 text-emerald-400" : "bg-[#FF274B]/20 text-[#FF274B]"}`}>
                      {log.resolved ? "RESOLVED" : "CRITICAL"}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(log.createdAt?.toDate ? log.createdAt.toDate() : log.createdAt).toLocaleTimeString("en-US")}
                    </span>
                  </div>
                  <p className="font-bold text-xs truncate text-white">{log.message}</p>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{log.path || "/api/unknown"}</p>
                </div>
              );
            })}
          </div>

          {/* Log Detail Pane (IDE Terminal Output) */}
          <div className="lg:col-span-7 bg-[#050505] rounded-3xl border border-white/[0.1] p-6 shadow-2xl space-y-5 text-white font-mono dir-ltr" dir="ltr">
            {selectedLog ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4" dir="rtl">
                  <div>
                    <span className="text-[10px] font-bold text-[#FF274B] uppercase tracking-widest block">System Stack Trace</span>
                    <h3 className="font-bold text-sm text-white mt-0.5">{selectedLog.path || "API Route"}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(selectedLog.id, selectedLog.resolved)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        selectedLog.resolved
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {selectedLog.resolved ? "معالَج ✅" : "تعليم كمحلول"}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedLog.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-bold">Error Message:</span>
                    <button
                      onClick={() => handleCopyStack(selectedLog.stack || selectedLog.message, selectedLog.id)}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold"
                    >
                      {copiedId === selectedLog.id ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedId === selectedLog.id ? "Copied" : "Copy Stack"}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0B0B0D] border border-white/[0.08] text-xs leading-relaxed text-red-400 font-mono overflow-x-auto max-h-96">
                    <p className="font-bold text-white mb-2">&gt; {selectedLog.message}</p>
                    <pre className="text-[11px] text-zinc-400 whitespace-pre-wrap">{selectedLog.stack || "No additional stack trace details recorded."}</pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-zinc-600 text-xs">
                Select an error log entry from the sidebar terminal to inspect stack trace.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
