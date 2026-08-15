import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "EGP"): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateSlug(name: string): string {
  if (!name) return `product-${Date.now().toString(36)}`;
  
  // Keep English alphanumeric, Arabic letters, spaces, hyphens
  const cleaned = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0600-\u06FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  if (!cleaned || cleaned === "-") {
    return `product-${Date.now().toString(36)}`;
  }
  return cleaned;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getDiscountPercentage(price: number, salePrice: number): number {
  return Math.round(((price - salePrice) / price) * 100);
}

export function formatDate(date: Date | { toDate(): Date }): string {
  const d = date instanceof Date ? date : date.toDate();
  return new Intl.DateTimeFormat("en-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** Generates a unique product SKU like DEEB-A4K2 */
export function generateSKU(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `DEEB-${code}`;
}

/** Ensures Egyptian & International WhatsApp phone numbers format correctly for wa.me links (e.g. 01012345678 -> 201012345678) */
export function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return "201012345678";
  let cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return "201012345678";

  // If local Egyptian format starting with 01 (11 digits: 010, 011, 012, 015...)
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    cleaned = "2" + cleaned;
  } else if (cleaned.startsWith("002")) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("1") && cleaned.length === 10) {
    cleaned = "20" + cleaned;
  }

  return cleaned;
}
