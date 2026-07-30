"use client";

import { useEffect, useState } from "react";
import { Truck, Search, Save, RefreshCw } from "lucide-react";
import { getShippingRates, updateShippingRates } from "@/lib/firebase/firestore";
import type { GovernorateRate } from "@/constants/governorates";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminShippingPage() {
  const [rates, setRates] = useState<GovernorateRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const loadRates = async () => {
    setLoading(true);
    try {
      const data = await getShippingRates();
      setRates(data);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحميل أسعار الشحن");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handlePriceChange = (id: string, newPrice: number | string) => {
    setRates((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (newPrice === "") return { ...r, price: "" as any };
        const parsed = parseFloat(String(newPrice));
        return { ...r, price: isNaN(parsed) ? ("" as any) : Math.max(0, parsed) };
      })
    );
  };

  const handleToggleActive = (id: string) => {
    setRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const sanitizedRates = rates.map((r) => ({
        ...r,
        price: typeof r.price === "number" ? r.price : parseFloat(String(r.price)) || 0,
      }));
      await updateShippingRates(sanitizedRates);
      toast.success("تم حفظ أسعار الشحن لجميع المحافظات بنجاح 🐺");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حفظ أسعار الشحن");
    } finally {
      setSaving(false);
    }
  };

  const filtered = rates.filter(
    (r) =>
      r.nameAr.includes(search) ||
      r.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl pb-16 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0E0E10] p-6 rounded-3xl border border-zinc-200 dark:border-white/[0.06] shadow-sm dark:shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF274B] mb-1">
            <Truck size={18} />
            أسعار الشحن والمحافظات
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            تخصيص أسعار التوصيل للمحافظات المصرية (27 محافظة)
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            تحديد تكلفة الشحن وحالة التفعيل لكل محافظة. تطبق التغييرات فوراً في حاسبة الشحن بالشيك أوت.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRates}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.06] text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            إعادة تحميل
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF274B] to-amber-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#FF274B]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Spinner size="sm" className="border-white" /> : <Save size={15} />}
            حفظ أسعار الشحن 🐺
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md bg-white dark:bg-[#0E0E10] rounded-2xl border border-zinc-200 dark:border-white/[0.06] p-2 shadow-sm">
        <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FF274B]" />
        <input
          type="text"
          placeholder="ابحث باسم المحافظة (القاهرة، الإسكندرية...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-11 pl-4 py-2.5 text-xs bg-transparent text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none font-bold"
        />
      </div>

      {/* Shipping Rates Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#FF274B]">
          <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] shadow-sm dark:shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">المحافظة</th>
                  <th className="px-6 py-4">الاسم بالإنجليزية</th>
                  <th className="px-6 py-4">تكلفة الشحن (ج.م)</th>
                  <th className="px-6 py-4">حالة الشحن للمحافظة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
                {filtered.map((rate) => (
                  <tr key={rate.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4 font-black text-zinc-900 dark:text-white text-sm">
                      {rate.nameAr}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-zinc-500">
                      {rate.nameEn}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={rate.price === undefined || rate.price === null ? "" : rate.price}
                          onChange={(e) => handlePriceChange(rate.id, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-28 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono font-black text-xs outline-none focus:border-[#FF274B]"
                        />
                        <span className="text-[11px] font-bold text-zinc-400">ج.م</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(rate.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black transition-all ${
                          rate.active
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                            : "bg-red-500/10 border border-red-500/30 text-red-500"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${rate.active ? "bg-emerald-500" : "bg-red-500"}`} />
                        {rate.active ? "متاحة للشحن" : "معطلة مؤقتاً"}
                      </button>
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
