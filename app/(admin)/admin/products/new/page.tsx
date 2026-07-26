import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-gray-400 text-sm mt-1">
          Fill in the details to add a new product
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
