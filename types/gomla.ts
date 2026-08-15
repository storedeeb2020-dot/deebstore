import { Timestamp } from "firebase/firestore";

export interface GomlaPriceTier {
  minQuantity: number;
  maxQuantity?: number;
  note?: string; // e.g. "درستة 12 قطعة" or "كميات كبرى للتجار"
}

export interface GomlaCategory {
  id: string;
  name: string;        // Name (English/Slug identifier)
  nameAr: string;      // Name in Arabic for display
  slug: string;
  description?: string;
  image?: string;
  order: number;
  createdAt?: Timestamp | Date;
}

export interface GomlaProduct {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  mainImage: string;
  images: string[];
  description: string;
  priceTiers: GomlaPriceTier[];
  minOrderQuantity?: number;
  inStock: boolean;
  featured?: boolean;
  createdAt: Timestamp | Date;
}

export interface GomlaFilters {
  categoryId?: string;
  search?: string;
}
