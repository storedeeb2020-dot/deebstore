"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/features/cart/CartProvider";
import { formatPrice } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          icon={<ShoppingBag className="text-gray-400" size={28} />}
          action={
            <Link href="/shop" className="btn-primary">
              Start Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
              <p className="text-gray-400 text-sm mt-1">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
            </div>
            <button
              onClick={clearCart}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear cart
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item, index) => {
                  const pId = item.product?.id || `item-${index}`;
                  const pSize = item.selectedSize || "قياسي";
                  const pColorHex = item.selectedColor?.hex || "#000000";
                  const pColorName = item.selectedColor?.name || "افتراضي";
                  const pImage = item.selectedColor?.image || item.product?.mainImage || "/placeholder.jpg";
                  const pName = item.product?.name || "منتج ديب ستور";
                  const pBrand = item.product?.brand || "DEEP STORE";
                  const price = item.product?.salePrice ?? item.product?.price ?? 0;
                  const qty = item.quantity || 1;
                  const key = `${pId}-${pSize}-${pColorHex}`;

                  return (
                    <motion.div
                      key={key}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      className="flex gap-5 p-5 bg-gray-50 rounded-2xl"
                    >
                      {/* Image */}
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-white flex-shrink-0">
                        <Image
                          src={pImage}
                          alt={pName}
                          width={128}
                          height={128}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">
                          {pBrand}
                        </p>
                        <h3 className="font-semibold truncate">{pName}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: pColorHex }}
                            />
                            {pColorName}
                          </div>
                          <span>/</span>
                          <span>Size {pSize}</span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity */}
                          <div className="flex items-center border border-gray-200 bg-white rounded-xl overflow-hidden">
                            <button
                              onClick={() => {
                                if (qty > 1) {
                                  updateQuantity(pId, pSize, pColorHex, qty - 1);
                                }
                              }}
                              className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(pId, pSize, pColorHex, qty + 1)}
                              className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-bold">
                              {formatPrice(price * qty)}
                            </span>
                            <button
                              onClick={() => removeItem(pId, pSize, pColorHex)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Continue Shopping */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mt-2"
              >
                <ArrowLeft size={14} />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                <h2 className="font-bold text-lg mb-5">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-400">Calculated at checkout</span>
                  </div>
                </div>

                <div className="my-5 border-t border-gray-200" />

                {/* Coupon placeholder */}
                <div className="flex gap-2 mb-5">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    disabled
                  />
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-200 text-gray-400 text-sm font-medium rounded-xl cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>

                <div className="flex justify-between font-bold text-lg mb-6">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full text-center py-4 bg-black text-white rounded-xl font-semibold text-sm hover:bg-gray-900 transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
