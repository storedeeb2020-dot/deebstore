import ProductDetailClient from "@/components/store/ProductDetailClient";
import { getProducts } from "@/lib/firebase/firestore";

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    const params = products.flatMap((p) => {
      const items = [{ slug: p.id }];
      if (p.slug) items.push({ slug: p.slug });
      return items;
    });

    if (params.length > 0) {
      return [
        ...params,
        { slug: "sample" },
        { slug: "product" },
        { slug: "t-shirt" },
      ];
    }
  } catch (err) {
    console.error("Error generating static params for products:", err);
  }

  return [
    { slug: "sample" },
    { slug: "product" },
    { slug: "t-shirt" },
    { slug: "hoodie" },
  ];
}

export const dynamicParams = false;

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
