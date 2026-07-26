"use client";

import { useEffect, useState } from "react";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Search } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types/user";

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Customers</h1>
        <p className="text-zinc-400 text-xs mt-1">
          {customers.length} registered customer accounts in database
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="text"
          placeholder="Search by customer name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-zinc-100 rounded-xl text-xs bg-white focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all placeholder:text-zinc-400"
        />
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Spinner size="lg" />
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">Loading accounts</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100/80 p-16 text-center text-zinc-400 text-xs font-medium">
          {search ? "No customers match your search filters." : "No registered customers yet."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Customer Profile</th>
                  <th className="px-6 py-4 text-left">Email Address</th>
                  <th className="px-6 py-4 text-left">Registration Date</th>
                  <th className="px-6 py-4 text-right">Orders Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map((customer) => (
                  <tr key={customer.uid} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-black shadow-sm flex-shrink-0">
                          {customer.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="font-bold text-xs text-zinc-900">{customer.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-500 font-mono">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                      {customer.createdAt
                        ? formatDate(
                            customer.createdAt instanceof Date
                              ? customer.createdAt
                              : (customer.createdAt as { toDate(): Date }).toDate()
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-black text-zinc-950 pr-8">
                      {customer.orderCount || 0}
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
