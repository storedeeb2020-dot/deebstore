"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import { toast } from "sonner";
import { getProductBySlug } from "@/lib/firebase/firestore";
import { useCart } from "@/features/cart/CartProvider";
import { useWishlist } from "@/features/wishlist/WishlistProvider";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types/product";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";

export default function ProductDetailClient({ overrideSlug }: { overrideSlug?: string } = {}) {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "";
  const targetSlug = overrideSlug || rawSlug;
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string; image: string } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const { addItem, openCart } = useCart();

  useEffect(() => {
    getProductBySlug(targetSlug)
      .then((data) => {
        if (data) {
          setProduct(data);
          if (data?.variants && data.variants.length > 0 && data.variants[0]) {
            const firstVariant = data.variants[0];
            setSelectedColor({
              name: firstVariant.colorName || "افتراضي",
              hex: firstVariant.colorHex || "#000000",
              image: firstVariant.image || data.mainImage || "",
            });
            const firstInStock =
              firstVariant.sizes?.find((s) => s.stock > 0)?.size ||
              firstVariant.sizes?.[0]?.size ||
              "قياسي";
            setSelectedSize(firstInStock);
          } else {
            // Default fallback for products without variants (e.g. phone models / covers)
            setSelectedColor({
              name: "افتراضي",
              hex: "#000000",
              image: data.mainImage || "",
            });
            setSelectedSize("قياسي");
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [targetSlug]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-2">المنتج غير موجود</h2>
        <p className="text-gray-500 text-sm mb-6">عفواً، لم نتمكن من العثور على بيانات هذا المنتج.</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-sm"
        >
          العودة للمتجر
        </button>
      </div>
    );
  }

  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? getDiscountPercentage(product.price, product.salePrice!)
    : 0;

  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const activeVariant = hasVariants
    ? product.variants.find((v) => v.colorHex === selectedColor?.hex) || product.variants[0]
    : null;
  
  const galleryImages = Array.from(
    new Set(
      [
        activeVariant?.image,
        product.mainImage,
        ...(product.variants?.map((v) => v.image) || []),
      ].filter(Boolean) as string[]
    )
  );
  if (galleryImages.length === 0) {
    galleryImages.push("/placeholder.jpg");
  }

  const availableSizes = activeVariant?.sizes || [];
  const sizeStock = hasVariants
    ? activeVariant?.sizes?.find((s) => s.size === selectedSize)?.stock ?? 99
    : 99;

  const handleColorSelect = (variant: ProductVariant) => {
    setSelectedColor({
      name: variant.colorName || "افتراضي",
      hex: variant.colorHex || "#000000",
      image: variant.image || product.mainImage || "",
    });
    const firstInStock =
      variant.sizes?.find((s) => s.stock > 0)?.size || variant.sizes?.[0]?.size || "قياسي";
    setSelectedSize(firstInStock);
    setActiveImage(0);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    const finalSize = selectedSize || "قياسي";
    const finalColor = selectedColor || {
      name: "افتراضي",
      hex: "#000000",
      image: product.mainImage || "",
    };

    if (sizeStock === 0) {
      toast.error("هذا المقاس غير متوفر حالياً");
      return;
    }
    setAdding(true);
    addItem(product, quantity, finalSize, finalColor);
    await new Promise((r) => setTimeout(r, 400));
    setAdding(false);
    toast.success(`تمت إضافة ${product.name} إلى السلة بنجاح!`);
    openCart();
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="pt-14 sm:pt-16 pb-20 min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
            <span>العودة للمتجر / Back to Shop</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
            title="إغلاق / Close"
            aria-label="Close product details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-3">
            <motion.div
              className="aspect-square relative overflow-hidden rounded-2xl bg-background border border-zinc-200/50 dark:border-zinc-800/40"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Image
                    src={galleryImages[activeImage] || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    quality={95}
                    crossOrigin="anonymous"
                    className="object-contain p-4"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImage((i) =>
                        i === 0 ? galleryImages.length - 1 : i - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImage((i) =>
                        i === galleryImages.length - 1 ? 0 : i + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </motion.div>

            {galleryImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? "border-black dark:border-white"
                        : "border-gray-200 dark:border-zinc-800 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain p-1.5 bg-zinc-100 dark:bg-zinc-900"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              {product.bestSeller && (
                <Badge variant="default">Best Seller</Badge>
              )}
              {product.featured && (
                <Badge variant="info">New Arrival</Badge>
              )}
              {sizeStock <= 5 && sizeStock > 0 && (
                <Badge variant="warning">Only {sizeStock} left</Badge>
              )}
              {sizeStock === 0 && (
                <Badge variant="danger">Out of Stock</Badge>
              )}
            </div>

            <p className="text-xs text-gray-500 font-medium mb-1">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>

            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {product.description}
            </p>

            {product.variants.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold mb-2">
                  Color:{" "}
                  <span className="font-normal text-gray-500">
                    {selectedColor?.name}
                  </span>
                </p>
                <div className="flex gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.colorHex}
                      onClick={() => handleColorSelect(variant)}
                      title={variant.colorName}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColor?.hex === variant.colorHex
                          ? "border-black dark:border-white scale-110"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: variant.colorHex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {availableSizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold">
                    Size / المقاس:{" "}
                    <span className="font-normal text-gray-500">
                      {selectedSize}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60"
                  >
                    <span>📏 جدول المقاسات (Size Guide)</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableSizes.map((sizeStockItem) => {
                    const isOutOfStock = sizeStockItem.stock === 0;
                    return (
                      <button
                        key={sizeStockItem.size}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(sizeStockItem.size)}
                        className={`min-w-[36px] px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                          isOutOfStock
                            ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed line-through"
                            : selectedSize === sizeStockItem.size
                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-900 dark:bg-zinc-900 dark:text-gray-300 dark:border-zinc-800"
                        }`}
                      >
                        {sizeStockItem.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden h-10">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center font-semibold text-xs">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      sizeStock > 0 ? Math.min(sizeStock, q + 1) : q + 1
                    )
                  }
                  className="w-8 h-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              <motion.button
                onClick={handleAddToCart}
                disabled={adding || sizeStock === 0}
                className="flex-1 h-10 bg-black text-white dark:bg-white dark:text-black rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.98 }}
              >
                {adding ? (
                  <Spinner size="sm" className="border-white dark:border-black border-t-transparent" />
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    {sizeStock === 0 ? "Out of Stock" : "إضافة للسلة / Add to Cart"}
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                  isInWishlist(product.id)
                    ? "bg-red-50/50 text-red-500 border-red-100 dark:bg-red-950/20 dark:border-red-900/50"
                    : "bg-white dark:bg-zinc-900 text-zinc-400 border-gray-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                }`}
                title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={16} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""} />
              </button>
            </div>

            {sizeStock > 0 && (
              <p className="text-xs text-gray-400 mt-3">
                {sizeStock} items available in stock
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 flex items-center gap-3 shadow-2xl">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black truncate text-zinc-900 dark:text-white">{product.name}</p>
          <p className="text-xs font-extrabold text-amber-500">{formatPrice(displayPrice)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={adding || sizeStock === 0}
          className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-50"
        >
          {adding ? (
            <Spinner size="sm" className="border-white dark:border-black border-t-transparent" />
          ) : (
            <>
              <ShoppingBag size={14} />
              <span>إضافة للسلة</span>
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-zinc-950 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-800 relative overflow-hidden"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📏</span>
                  <h3 className="font-black text-sm uppercase tracking-wider text-white">
                    جدول مقاسات NXT ({product.sizeChartType === "pants" ? "بناطيل / Pants" : "تيشرتات / T-Shirts"})
                  </h3>
                </div>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-zinc-800 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex justify-center p-2 bg-black rounded-2xl border border-zinc-800/80 overflow-hidden shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.sizeChartType === "pants" ? "/size-chart-pants.png" : "/size-chart-tshirt.png"}
                  alt="NXT Size Guide"
                  className="w-full max-h-[70vh] object-contain rounded-xl"
                />
              </div>

              <p className="text-[11px] text-zinc-400 text-center mt-3 font-medium">
                جميع المقاسات دقيقة ومصممة بعناية لمنتجات NXT
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
