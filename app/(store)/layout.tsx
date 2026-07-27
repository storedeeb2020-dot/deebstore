import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { WishlistSidebar } from "@/components/wishlist/WishlistSidebar";
import { IntroManager } from "@/components/home/IntroManager";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IntroManager>
      <AnnouncementBar />
      <Header />
      <CartSidebar />
      <WishlistSidebar />
      <main>{children}</main>
      <Footer />
    </IntroManager>
  );
}
