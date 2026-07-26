import EditProductClient from "@/components/admin/EditProductClient";
import { getProducts } from "@/lib/firebase/firestore";

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    const params = products.map((p) => ({ id: p.id }));
    if (params.length > 0) {
      return [
        ...params,
        { id: "sample" },
        { id: "placeholder" },
        { id: "default" },
      ];
    }
  } catch (err) {
    console.error("Error generating static params for admin edit:", err);
  }

  return [
    { id: "sample" },
    { id: "placeholder" },
    { id: "default" },
    { id: "1" },
    { id: "2" },
  ];
}

export const dynamicParams = false;

export default function EditProductPage() {
  return <EditProductClient />;
}
