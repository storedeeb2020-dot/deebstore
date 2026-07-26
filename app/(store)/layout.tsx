import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { WishlistSidebar } from "@/components/wishlist/WishlistSidebar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <CartSidebar />
      <WishlistSidebar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
