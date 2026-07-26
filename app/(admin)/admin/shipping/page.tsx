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
      toast.error("Failed to load shipping rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handlePriceChange = (id: string, newPrice: number) => {
    setRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, price: Math.max(0, newPrice) } : r))
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
      await updateShippingRates(rates);
      toast.success("Shipping rates for all Egyptian governorates saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save shipping rates");
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
    <div className="space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Truck className="text-amber-500" size={24} />
            Egyptian Governorates Shipping Management (أسعار الشحن للمحافظات)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configure custom shipping rates for all 27 Egyptian governorates. Changes apply instantly to customer checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRates}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Reload
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-zinc-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {saving ? <Spinner size="sm" className="border-white" /> : <Save size={15} />}
            Save Shipping Rates
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md bg-white rounded-2xl border border-zinc-200/80 p-2 shadow-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search governorate by Arabic or English name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-transparent text-xs font-semibold focus:outline-none"
        />
      </div>

      {/* Governorates Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-16 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Spinner size="lg" />
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Loading Governorates Shipping Data...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-100 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Governorate (المحافظة)</th>
                  <th className="px-6 py-4 text-left">English Name</th>
                  <th className="px-6 py-4 text-left">Shipping Price (سعر الشحن EGP)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((rate) => (
                  <tr key={rate.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-black text-zinc-900">
                      {rate.nameAr}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-zinc-500 font-mono">
                      {rate.nameEn}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[160px]">
                        <input
                          type="number"
                          min="0"
                          value={rate.price}
                          onChange={(e) => handlePriceChange(rate.id, parseFloat(e.target.value) || 0)}
                          className="w-24 px-3 py-1.5 border border-zinc-200 rounded-xl text-xs font-black text-zinc-900 focus:outline-none focus:border-zinc-900 bg-white"
                        />
                        <span className="text-xs font-bold text-zinc-400">EGP</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(rate.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                          rate.active
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                        }`}
                      >
                        {rate.active ? "Active" : "Disabled"}
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
