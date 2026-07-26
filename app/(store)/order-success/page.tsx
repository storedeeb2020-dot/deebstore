"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Success Icon */}
        <motion.div
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 30 }}
        >
          <CheckCircle className="text-green-600" size={36} />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Order Placed! 🎉
        </motion.h1>

        <motion.p
          className="text-gray-500 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Thank you for your order. We&apos;ll start processing it right away.
        </motion.p>

        {orderId && (
          <motion.div
            className="bg-gray-50 rounded-xl px-4 py-3 mb-6 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-gray-400 mb-1">Order ID</p>
            <p className="font-mono text-sm font-semibold text-gray-700">
              #{orderId.slice(0, 12).toUpperCase()}
            </p>
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
