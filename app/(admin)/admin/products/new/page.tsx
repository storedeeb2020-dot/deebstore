import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-white/[0.06] pb-4">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">إضافة منتج جديد للمتجر 🛍️</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
          قم بتعبئة تفاصيل المنتج، الأسعار (قبل وبعد الخصم)، الصور، خيارات الألوان والمقاسات.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
