"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  XCircle,
  ExternalLink,
  Terminal,
  Filter,
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

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getSystemErrorLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load system error logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleToggleStatus = async (id: string, currentResolved: boolean) => {
    try {
      await updateSystemErrorStatus(id, !currentResolved);
      setLogs((prev) =>
        prev.map((log) => (log.id === id ? { ...log, resolved: !currentResolved } : log))
      );
      toast.success(!currentResolved ? "Marked error as resolved" : "Marked error as unresolved");
    } catch {
      toast.error("Failed to update error status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this error log?")) return;
    try {
      await deleteSystemErrorLog(id);
      setLogs((prev) => prev.filter((log) => log.id !== id));
      if (selectedLog?.id === id) setSelectedLog(null);
      toast.success("Error log deleted");
    } catch {
      toast.error("Failed to delete error log");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete ALL system error logs?")) return;
    try {
      await clearAllSystemErrors();
      setLogs([]);
      setSelectedLog(null);
      toast.success("All error logs cleared");
    } catch {
      toast.error("Failed to clear error logs");
    }
  };

  const handleCopyStack = (stack: string, id: string) => {
    navigator.clipboard.writeText(stack);
    setCopiedId(id);
    toast.success("Stack trace copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = logs
    .filter((log) => {
      if (filter === "unresolved") return !log.resolved;
      if (filter === "resolved") return log.resolved;
      return true;
    })
    .filter((log) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        log.message?.toLowerCase().includes(q) ||
        log.context?.toLowerCase().includes(q) ||
        log.url?.toLowerCase().includes(q) ||
        log.stack?.toLowerCase().includes(q)
      );
    });

  const unresolvedCount = logs.filter((l) => !l.resolved).length;
  const resolvedCount = logs.filter((l) => l.resolved).length;

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

  return (
    <div className="space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={22} />
            System Error & Runtime Logs
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time automated error tracking and diagnostic logs from storefront and admin panel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} />
              Clear All Logs
            </button>
          )}
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Total Recorded Errors</p>
            <p className="text-2xl font-black text-zinc-900 mt-1">{logs.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 font-bold">
            <Terminal size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">Unresolved Errors</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{unresolvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <XCircle size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">Resolved Errors</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search error message, stack, or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-zinc-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter size={14} className="text-zinc-400 mr-1" />
          {(["all", "unresolved", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === f
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {f} {f === "unresolved" ? `(${unresolvedCount})` : f === "resolved" ? `(${resolvedCount})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Main Error Listing */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-16 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Spinner size="lg" />
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Loading System Logs...</p>
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-16 text-center space-y-3">
          <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
          <h3 className="text-base font-bold text-zinc-900">No System Errors Recorded</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {search || filter !== "all"
              ? "No errors match your current search filter."
              : "Your website is running cleanly with 0 active runtime errors!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all shadow-sm ${
                log.resolved
                  ? "border-zinc-200/80 opacity-70"
                  : "border-red-200 bg-red-50/10"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                        log.resolved
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {log.resolved ? "Resolved" : "Active Error"}
                    </span>

                    {log.context && (
                      <span className="text-[9px] font-extrabold bg-zinc-900 text-white uppercase px-2.5 py-0.5 rounded-md">
                        {log.context}
                      </span>
                    )}

                    <span className="text-[10px] text-zinc-400 font-mono">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-zinc-900 font-mono leading-relaxed">
                    {log.message}
                  </h3>

                  {log.url && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono truncate">
                      <ExternalLink size={12} className="text-zinc-400 shrink-0" />
                      <span className="truncate">{log.url}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(log.id, log.resolved)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      log.resolved
                        ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    }`}
                  >
                    {log.resolved ? "Reopen Error" : "Mark Resolved"}
                  </button>

                  <button
                    onClick={() => handleDelete(log.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete log entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Stack Trace Container */}
              {log.stack && (
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      Stack Trace
                    </span>
                    <button
                      onClick={() => handleCopyStack(log.stack!, log.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md transition-colors"
                    >
                      {copiedId === log.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      {copiedId === log.id ? "Copied" : "Copy Trace"}
                    </button>
                  </div>
                  <pre className="p-3 bg-zinc-950 text-zinc-300 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-48 scrollbar-thin">
                    {log.stack}
                  </pre>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
