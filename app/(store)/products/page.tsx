"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import { Spinner } from "@/components/ui/Spinner";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || searchParams.get("id") || "";

  return <ProductDetailClient overrideSlug={slug} />;
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
