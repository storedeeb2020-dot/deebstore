import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/features/cart/CartProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { WishlistProvider } from "@/features/wishlist/WishlistProvider";
import { Toaster } from "sonner";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

try {
  const src = "C:\\Users\\youse\\.gemini\\antigravity-ide\\brain\\7143436e-db2e-4dd9-8309-d096b857b2cc\\media__1785122093009.png";
  const dest = path.join(process.cwd(), "public", "wolf-icon.png");
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
  const oldFile = path.join(process.cwd(), "components", "intros", "NXTIntro.tsx");
  if (fs.existsSync(oldFile)) {
    fs.unlinkSync(oldFile);
  }
} catch (e) {
  console.error("Error copying wolf icon/deleting old intro:", e);
}

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://deebstore.vercel.app"
  ),
  title: {
    default: "DEEP STORE | البراند المفضل للملابس والستريت وير الفاخرة",
    template: "%s | DEEP STORE",
  },
  description:
    "تسوق أحدث تشكيلات الملابس والستريت وير العصرية من براند ديب ستور DEEP STORE. اكتشف أفضل الهوديز، التيشيرتات، والبنطلونات المصممة بأعلى جودة وخامات ممتازة في مصر والوطن العربي.",
  keywords: [
    // 1. اسم البراند وتنويعاته (Brand Name Variations)
    "DEEP STORE",
    "DEEP STORE Egypt",
    "DEEP Streetwear",
    "DEEP Clothing",
    "DEEP Fashion",
    "DEEP Brand",
    "براند DEEP STORE",
    "ديب ستور",
    "براند ديب ستور",
    "متجر ديب ستور",
    "براند ملابس ديب ستور",

    // 2. ملابس + اسم البراند (Clothing + Brand)
    "ملابس DEEP STORE",
    "ملابس ديب ستور",
    "براند ملابس ديب ستور",
    "DEEP streetwear",
    "هوديز ديب ستور",
    "تيشيرتات ديب ستور",
    "بنطلونات ديب ستور",
    "سويت شيرت ديب ستور",
    "DEEP t-shirts",
    "DEEP hoodies",
    "DEEP pants",
    "DEEP jackets",

    // 3. كلمات SEO موضة وستريت وير محلية وإقليمية (Local & Category SEO)
    "DEEP Egypt",
    "ديب ستور مصر",
    "براندات ستريت وير في مصر",
    "ملابس ستريت وير مصر",
    "Streetwear Egypt",
    "Fashion Brand Egypt",
    "ملابس شبابي عصرية",
    "أحدث صيحات الموضة ديب ستور",
    "تسوق ملابس اونلاين مصر",
    "أونلاين شوبينج ملابس",
  ],
  authors: [{ name: "DEEP STORE Brand" }],
  creator: "DEEP STORE",
  publisher: "DEEP STORE",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "/",
    siteName: "DEEP STORE - براند ديب ستور للملابس الفاخرة",
    title: "DEEP STORE | البراند المفضل للملابس والستريت وير العصرية",
    description:
      "تسوق أحدث تشكيلات الملابس والستريت وير من براند ديب ستور DEEP STORE. خامات ممتازة وتصاميم عصرية تناسب أسلوب حياتك.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "DEEP STORE Clothing Brand",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DEEP STORE | البراند المفضل للملابس والستريت وير العصرية",
    description: "تسوق أحدث تشكيلات الملابس والستريت وير العصرية من براند ديب ستور DEEP STORE.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { ErrorTrackerProvider } from "@/components/ui/ErrorTrackerProvider";
import { ChatBot } from "@/components/ui/ChatBot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Brand",
              "name": "DEEP STORE",
              "alternateName": ["ديب ستور", "DEEP STORE", "DEEP Streetwear", "ملابس DEEP STORE"],
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://deebstore.vercel.app",
              "logo": "/logo.png",
              "description": "متجر DEEP STORE الفاخر المتخصص في أفضل ملابس الستريت وير والموضة العصرية في مصر والوطن العربي."
            })
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-300">
        <ErrorTrackerProvider>
          <AuthProvider>
            <ThemeProvider>
              <CartProvider>
                <WishlistProvider>
                  {children}
                  <ChatBot />
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      style: {
                        background: "#000",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                      },
                    }}
                  />
                </WishlistProvider>
              </CartProvider>
            </ThemeProvider>
          </AuthProvider>
        </ErrorTrackerProvider>
      </body>
    </html>
  );
}
