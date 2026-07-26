"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, Heart } from "lucide-react";
import { useWishlist } from "@/features/wishlist/WishlistProvider";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? getDiscountPercentage(product.price, product.salePrice!)
    : 0;

  const staggerDelay = (index % 4) * 0.08;

  // Navigate by Firestore Document ID (always unique — never use slug)
  const navigateToProduct = () => {
    router.push(`/products?id=${encodeURIComponent(product.id)}`);
  };

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
    >
      {/* Outer wrapper — NO nested buttons, NO role=button on div */}
      <div className="block group cursor-pointer select-none" onClick={navigateToProduct}>

        {/* Floating Image Container */}
        <div className="relative overflow-visible">

          {/* Wishlist Heart Button — stops propagation so card click doesn't fire */}
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

          {/* Quick View Overlay */}
          <div className="absolute inset-0 z-10 flex items-end justify-center pb-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <motion.span
              className="flex items-center gap-2 bg-black/80 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl backdrop-blur-sm"
              initial={{ y: 10, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
            >
              <Eye size={13} />
              عرض المنتج
            </motion.span>
          </div>

          {/* Product Image */}
          <div className="aspect-[3/4] relative overflow-hidden">
            {product.mainImage ? (
              <motion.div
                className="w-full h-full"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={product.mainImage}
                  alt={product.name}
                  fill
                  priority={index < 4}
                  quality={95}
                  crossOrigin="anonymous"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain object-top transition-transform duration-500"
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-amber-500/40 text-3xl font-black tracking-widest">DEEP</span>
              </div>
            )}
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
                <span className="text-[10px] text-gray-400 font-bold">
                  +{product.variants.length - 5}
                </span>
              )}
            </div>
          )}

          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-center gap-2">
            <span className="text-sm sm:text-base font-black text-foreground">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through font-semibold">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
