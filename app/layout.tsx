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
} catch (e) {
  console.error("Error copying wolf icon:", e);
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
    process.env.NEXT_PUBLIC_SITE_URL || "https://eldeeb.shop"
  ),
  title: {
    default: "EL DEEB STORE",
    template: "%s | EL DEEB STORE",
  },
  description:
    "تسوق أحدث تشكيلات ملابس البحر والشورتات والستريت وير العصرية من متجر الديب ستور EL DEEB STORE. اكتشف شورت بحر فاخر، ملابس بحر عصرية، هوديز وتيشيرتات بأعلى جودة في مصر.",
  keywords: [
    // 1. اسم البراند والمنتجات المستهدفة (Target Keywords & Brand Variations)
    "EL DEEB STORE",
    "الديب ستور",
    "ديب ستور",
    "متجر الديب ستور",
    "براند الديب ستور",
    "شورط بحر",
    "شورت بحر",
    "شورتات بحر",
    "شورت بحر رجالي",
    "ملابس بحر",
    "ملابس بحر رجالي",
    "مايوه بحر",
    "شورتات شاطئ",
    "DEEP STORE",
    "DEEP STORE Egypt",
    "DEEP Streetwear",
    "DEEP Clothing",
    "DEEP Fashion",
    "براند DEEP STORE",

    // 2. ملابس وفئات المتجر (Categories & Apparel)
    "ملابس الديب ستور",
    "شورط بحر الديب ستور",
    "ملابس بحر الديب ستور",
    "هوديز الديب ستور",
    "تيشيرتات الديب ستور",
    "بنطلونات الديب ستور",
    "سويت شيرت الديب ستور",
    "DEEP t-shirts",
    "DEEP hoodies",
    "DEEP swim shorts",
    "DEEP beachwear",

    // 3. كلمات SEO موضة وستريت وير محلية وإقليمية (Local & Category SEO)
    "الديب ستور مصر",
    "شورت بحر مصر",
    "ملابس بحر مصر",
    "براندات ستريت وير في مصر",
    "ملابس ستريت وير مصر",
    "Streetwear Egypt",
    "Beachwear Egypt",
    "Swim shorts Egypt",
    "ملابس صيفية وشاطئ",
    "تسوق ملابس اونلاين مصر",
  ],
  authors: [{ name: "EL DEEB STORE Brand" }],
  creator: "EL DEEB STORE",
  publisher: "EL DEEB STORE",
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
    siteName: "EL DEEB STORE - متجر الديب ستور للملابس وشورتات البحر",
    title: "EL DEEB STORE | متجر الديب ستور للملابس وشورتات البحر الفاخرة",
    description:
      "تسوق أحدث تشكيلات ملابس البحر والشورتات والستريت وير العصرية من متجر الديب ستور EL DEEB STORE. أفضل خامات وتصاميم صيفية عصرية.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "EL DEEB STORE Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EL DEEB STORE | متجر الديب ستور للملابس وشورتات البحر",
    description:
      "أحدث شورتات البحر وملابس الشاطئ والستريت وير الفاخرة من براند الديب ستور EL DEEB STORE.",
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
                  var saved = localStorage.getItem('deep-theme');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
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
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://eldeeb.shop",
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
