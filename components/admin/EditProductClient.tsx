"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getProductById } from "@/lib/firebase/firestore";
import { ProductForm } from "@/components/admin/ProductForm";
import { Spinner } from "@/components/ui/Spinner";
import type { Product } from "@/types/product";

function EditProductContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Supports both /admin/products/123/edit AND /admin/products/edit?id=123
  const id = (params?.id as string) || searchParams.get("id") || "";
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || id === "placeholder" || id === "sample" || id === "default") {
      setLoading(false);
      return;
    }
    getProductById(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center text-zinc-400">
        <p className="font-bold text-sm">المنتج غير موجود أو تعذر العثور عليه.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">تعديل المنتج</h1>
        <p className="text-zinc-400 text-sm mt-1">{product.name}</p>
      </div>
      <ProductForm initialData={product} productId={id} />
    </div>
  );
}

export default function EditProductClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      }
    >
      <EditProductContent />
    </Suspense>
  );
}
