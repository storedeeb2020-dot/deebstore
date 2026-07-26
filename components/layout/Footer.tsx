"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Facebook, MessageCircle } from "lucide-react";
import { getSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";

function TiktokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(console.error);
  }, []);

  // Hide footer on dedicated product details page
  if (pathname?.startsWith("/products/")) {
    return null;
  }

  const socialLinks = [
    {
      icon: Instagram,
      label: "Instagram",
      href: settings?.instagramUrl || "https://www.instagram.com/eldeeb_st0re?igsh=MTh3dDBheWJ1MjNneg==",
    },
    {
      icon: Facebook,
      label: "Facebook",
      href: settings?.facebookUrl || "https://www.facebook.com/share/1BeVGnopec/",
    },
    {
      icon: TiktokIcon,
      label: "TikTok",
      href: settings?.tiktokUrl || "https://www.tiktok.com/@eldeeb.stoer?_r=1&_t=ZS-98MVHwLnOtM",
    },
  ];

  return (
    <footer className="bg-black text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="DEEP STORE Logo"
              className="h-8 w-auto object-contain invert"
            />
            <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm">
              {settings?.footerDescription ||
                "متجر ديب ستور الفاخر للستريت وير والموضة العصرية. تسوق أحدث التشكيلات بأفضل جودة وخامات ممتازة."}
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase mb-4 text-amber-400">
              تسوق المتجر
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                { href: "/#products", label: "التشكيلة العصرية" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase mb-4 text-amber-400">
              معلومات المتجر
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                { href: "/about", label: "عن ديب ستور" },
                { href: "/contact", label: "اتصل بنا والشكاوى" },
                { href: "/privacy", label: "سياسة الخصوصية" },
                { href: "/terms", label: "الشروط والأحكام" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} DEEP STORE. All rights reserved.</p>

          {/* Developer Credit & WhatsApp */}
          <div className="flex flex-col md:items-end items-center gap-1">
            <p className="font-bold text-zinc-300">
              Developed by Yousef
            </p>
            <a
              href="https://wa.me/201020451206"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
            >
              <MessageCircle size={14} />
              <span>01020451206</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
