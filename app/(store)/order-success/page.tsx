"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";
import { Suspense, useState } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success(`تم نسخ رقم الطلب (${orderId.slice(0, 8).toUpperCase()}) بنجاح 📋`);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4 font-['Tajawal',sans-serif]" dir="rtl">
      <motion.div
        className="text-center max-w-md w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Success Icon */}
        <motion.div
          className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 30 }}
        >
          <CheckCircle className="text-emerald-500" size={40} />
        </motion.div>

        <motion.h1
          className="text-2xl sm:text-3xl font-black mb-3 text-zinc-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          تم تسجيل طلبك بنجاح! 🎉
        </motion.h1>

        <motion.p
          className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-2 font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          شكراً لثقتك بـ ديب ستور. جاري مراجعة وتجهيز طلبك فوراً 🐺
        </motion.p>

        {orderId && (
          <motion.div
            className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-2xl px-5 py-3.5 mb-6 mt-4 flex items-center justify-between shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-right">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">كود/رقم الطلب (Order ID)</p>
              <p className="font-mono text-sm font-black text-[#FF274B] mt-0.5">
                #{orderId.slice(0, 12).toUpperCase()}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="px-3 py-1.5 rounded-xl bg-[#FF274B]/10 hover:bg-[#FF274B]/20 text-[#FF274B] border border-[#FF274B]/30 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
            >
              <Copy size={13} />
              <span>{copied ? "تم النسخ!" : "نسخ الكود"}</span>
            </button>
          </motion.div>
        )}

        <motion.div
          className="bg-black/5 rounded-2xl p-5 mb-8 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <Package className="text-gray-600 mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="font-semibold text-sm mb-1">What&apos;s next?</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Complete your payment via the selected method</li>
                <li>• Send your Order ID with payment</li>
                <li>• We&apos;ll confirm and ship your order</li>
                <li>• You&apos;ll receive your items in 2–5 business days</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-900 transition-colors"
          >
            Continue Shopping
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Go Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="pt-20 min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
