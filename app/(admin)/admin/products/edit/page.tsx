// Static route — product ID is passed as ?id=XXX query param
// This avoids the output:export incompatibility with dynamic [id] routes
import EditProductClient from "@/components/admin/EditProductClient";

export default function EditProductPage() {
  return <EditProductClient />;
}
