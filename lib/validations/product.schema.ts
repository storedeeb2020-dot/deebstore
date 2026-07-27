import { z } from "zod";

export const sizeStockSchema = z.object({
  size: z.string().min(1, "Size is required"),
  stock: z.number().int().min(0, "Stock must be 0 or more"),
});

export const productVariantSchema = z.object({
  colorName: z.string().min(1, "Color name is required"),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Valid hex color required"),
  image: z.string().url("Color variant image is required"),
  sizes: z.array(sizeStockSchema).optional().default([]),
});

export const productSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "الرابط يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطة فقط"),
  sku: z.string().min(3, "الكود مطلوب").max(20, "الكود طويل جداً"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  price: z.number().min(0, "السعر يجب أن يكون موجباً"),
  salePrice: z.number().min(0).optional(),
  category: z
    .string()
    .min(1, "يرجى اختيار قسم للمنتج")
    .refine((val) => val !== "all" && val.trim() !== "", {
      message: "يرجى اختيار قسم محدد للمنتج من القائمة",
    }),
  brand: z.string().min(1, "البراند مطلوب"),
  mainImage: z.string().url("صورة الغلاف الرئيسية مطلوبة"),
  variants: z.array(productVariantSchema).min(1, "أضف لون واحد على الأقل"),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  hasSizes: z.boolean().default(true),
  sizeChartUrl: z.string().optional(),
  sizeChartType: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
