"use client";

import { useEffect, useState } from "react";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Search, UserCheck, Mail, Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types/user";
import { motion } from "framer-motion";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    getDocs(q)
      .then((snap) => {
        setCustomers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as User));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl pb-16 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF274B] mb-1">
            <UserCheck size={18} />
            قاعدة بيانات العملاء
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            حسابات العملاء المسجلين ({customers.length})
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            متابعة قائمة العملاء، التفاعل، وتفاصيل حسابات التسجيل بالمتجر.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl bg-white dark:bg-[#0E0E10] rounded-2xl border border-zinc-200 dark:border-white/[0.06] p-2 shadow-sm">
        <Search
          size={16}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FF274B]"
        />
        <input
          type="text"
          placeholder="ابحث باسم العميل أو البريد الإلكتروني..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-11 pl-4 py-2.5 text-xs bg-transparent text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none font-bold"
        />
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#FF274B]">
          <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-4">جاري تحميل سجلات العملاء...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-16 text-center text-zinc-400 text-xs font-bold shadow-sm">
          {search ? "لا توجد نتائج مطابقة لبحثك." : "لا يوجد عملاء مسجلين حتى الآن."}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] shadow-sm dark:shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">العميل</th>
                  <th className="px-6 py-4">البريد الإلكتروني</th>
                  <th className="px-6 py-4">تاريخ التسجيل</th>
                  <th className="px-6 py-4">حالة الحساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
                {filtered.map((customer) => (
                  <tr key={customer.uid} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF274B] to-amber-400 text-white flex items-center justify-center text-xs font-black shadow-md shrink-0">
                          {customer.name?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <span className="font-black text-sm text-zinc-900 dark:text-white">{customer.name || "عميل مجهول"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-zinc-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-zinc-500">
                      {customer.createdAt
                        ? formatDate(
                            customer.createdAt instanceof Date
                              ? customer.createdAt
                              : (customer.createdAt as { toDate(): Date }).toDate()
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
                        <ShieldCheck size={12} />
                        حساب مفعل
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
