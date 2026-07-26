import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;       // كود فريد للمنتج مثل DEEP-AB12 — يُدمج في رابط المنتج
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  brand: string;
  mainImage: string;
  variants: ProductVariant[];
  featured: boolean;
  bestSeller: boolean;
  sizeChartType?: "tshirt" | "pants"; // نوع جدول المقاسات للمنتج
  createdAt: Timestamp | Date;
}


export interface ProductVariant {
  colorName: string;
  colorHex: string;
  image: string; // Cloudinary URL for this specific color
  sizes: SizeStock[]; // Specific sizes and stock levels for this color
}

export interface SizeStock {
  size: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: {
    name: string;
    hex: string;
    image: string;
  };
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
  bestSeller?: boolean;
}
