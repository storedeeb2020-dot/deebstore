import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, ShoppingBag, Check } from "lucide-react";
import { useWishlist } from "@/features/wishlist/WishlistProvider";
import { useCart } from "@/features/cart/CartProvider";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addItem, openCart } = useCart();
  const isFavorite = isInWishlist(product.id);
  const [quickBought, setQuickBought] = useState(false);
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? getDiscountPercentage(product.price, product.salePrice!)
    : 0;

  const staggerDelay = (index % 4) * 0.08;

  // Build image gallery: mainImage first, then variant images (deduplicated)
  const allImages: string[] = [];
  if (product.mainImage) allImages.push(product.mainImage);
  if (product.variants) {
    for (const v of product.variants) {
      if (v.image && !allImages.includes(v.image)) {
        allImages.push(v.image);
      }
    }
  }

  const [hovered, setHovered] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (hovered && allImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
      }, 900);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!hovered) setCurrentImgIndex(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hovered, allImages.length]);

  const navigateToProduct = () => {
    router.push(`/products?id=${encodeURIComponent(product.id)}`);
  };

  // Quick Buy: add first available size of first variant directly
  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const firstVariant = product.variants?.[0];
    const firstSize = firstVariant?.sizes?.find((s) => s.stock > 0)?.size || "قياسي";
    const color = firstVariant
      ? { name: firstVariant.colorName || "افتراضي", hex: firstVariant.colorHex || "#000", image: firstVariant.image || product.mainImage || "" }
      : { name: "افتراضي", hex: "#000", image: product.mainImage || "" };
    addItem(product, 1, firstSize, color);
    setQuickBought(true);
    setTimeout(() => { setQuickBought(false); openCart(); }, 700);
  };

  const currentImage = allImages[currentImgIndex] ?? product.mainImage;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40, scale: 0.93, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.65,
        delay: staggerDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="block group cursor-pointer select-none" onClick={navigateToProduct}>

        {/* Floating Image Container */}
        <div className="relative overflow-visible">

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/30 dark:bg-white/10 backdrop-blur-md text-white hover:text-red-400 hover:scale-110 active:scale-95 transition-all shadow-lg"
            title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={14} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
          </button>

          {/* Discount & Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
            {hasDiscount && (
              <span className="bg-red-500 text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-md">
                -{discountPct}%
              </span>
            )}
            {product.bestSeller && (
              <span className="bg-amber-400 text-black text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-md">
                Best Seller
              </span>
            )}
          </div>

          {/* Hover Overlay — View + Quick Buy */}
          <div className="absolute inset-0 z-10 flex items-end justify-center pb-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-2">
              {/* View Product */}
              <motion.span
                className="flex items-center gap-1.5 bg-black/80 text-white text-[11px] font-bold px-3 py-2 rounded-full shadow-xl backdrop-blur-sm pointer-events-none"
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
              >
                <Eye size={12} />
                عرض
              </motion.span>

              {/* Quick Buy button */}
              <motion.button
                type="button"
                onClick={handleQuickBuy}
                className="flex items-center gap-1.5 text-[11px] font-black px-3 py-2 rounded-full shadow-xl backdrop-blur-sm pointer-events-auto cursor-pointer"
                style={{
                  background: quickBought ? "rgba(16,185,129,0.9)" : "rgba(251,191,36,0.95)",
                  color: "#000",
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <AnimatePresence mode="wait">
                  {quickBought ? (
                    <motion.span key="check" className="flex items-center gap-1" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check size={12} /> تمت!
                    </motion.span>
                  ) : (
                    <motion.span key="buy" className="flex items-center gap-1" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <ShoppingBag size={12} /> اشتري
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Image slideshow dots */}
          {hovered && allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1 pointer-events-none">
              {allImages.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full bg-amber-400"
                  animate={{ width: i === currentImgIndex ? 16 : 4, opacity: i === currentImgIndex ? 1 : 0.4 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          )}

          {/* Product Image with crossfade animation */}
          <div className="aspect-[3/4] relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 p-2 border border-zinc-200/60 dark:border-zinc-800/80 transition-colors">
            <AnimatePresence mode="wait">
              {currentImage ? (
                <motion.div
                  key={currentImage}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    priority={index < 4}
                    quality={95}
                    crossOrigin="anonymous"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain object-top"
                  />
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-amber-500/40 text-3xl font-black tracking-widest">DEEP</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Product Info */}
        <div className="pt-4 text-center space-y-1.5 px-1">
          {/* Color swatches */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 mb-1">
              {product.variants.slice(0, 5).map((variant) => (
                <div
                  key={variant.colorHex}
                  className="w-3 h-3 rounded-full shadow-sm ring-1 ring-black/10 dark:ring-white/10"
                  style={{ backgroundColor: variant.colorHex }}
                  title={variant.colorName}
                />
              ))}
              {product.variants.length > 5 && (
                <span className="text-[10px] text-zinc-500 dark:text-gray-400 font-bold">
                  +{product.variants.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Product name */}
          <h3 className="text-xs sm:text-sm font-bold leading-tight text-zinc-900 dark:text-amber-400 group-hover:text-amber-500 transition-colors duration-200">
            {product.name}
          </h3>

          <div className="flex items-center justify-center gap-2">
            <span className="text-sm sm:text-base font-black text-amber-600 dark:text-white">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-zinc-400 dark:text-gray-400 line-through font-semibold">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
