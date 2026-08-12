"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Facebook, MessageCircle } from "lucide-react";
import { subscribeToSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";
import { SocialIconButton } from "@/components/ui/AnimatedButton";
import { motion } from "framer-motion";

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
    const unsubscribe = subscribeToSiteSettings((data) => {
      if (data) setSettings(data);
    });
    return () => unsubscribe();
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
      btnClass: "bg-[#E1306C]/10 dark:bg-[#E1306C]/20 text-[#E1306C] dark:text-[#E1306C] border-[#E1306C]/30 dark:border-[#E1306C]/50 hover:bg-[#E1306C] dark:hover:bg-[#E1306C] hover:text-white dark:hover:text-white shadow-lg shadow-[#E1306C]/10",
    },
    {
      icon: Facebook,
      label: "Facebook",
      href: settings?.facebookUrl || "https://www.facebook.com/share/1BeVGnopec/",
      btnClass: "bg-[#1877F2]/10 dark:bg-[#1877F2]/20 text-[#1877F2] dark:text-[#1877F2] border-[#1877F2]/30 dark:border-[#1877F2]/50 hover:bg-[#1877F2] dark:hover:bg-[#1877F2] hover:text-white dark:hover:text-white shadow-lg shadow-[#1877F2]/10",
    },
    {
      icon: TiktokIcon,
      label: "TikTok",
      href: settings?.tiktokUrl || "https://www.tiktok.com/@eldeeb.stoer?_r=1&_t=ZS-98MVHwLnOtM",
      btnClass: "bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 border-cyan-500/30 dark:border-cyan-500/50 hover:bg-cyan-400 dark:hover:bg-cyan-400 hover:text-black dark:hover:text-black shadow-lg shadow-cyan-500/10",
    },
  ];

  return (
    <footer className="bg-zinc-100 dark:bg-black text-zinc-900 dark:text-white font-sans transition-colors border-t border-zinc-200 dark:border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="DEEB STORE Logo"
              className="h-8 w-auto object-contain dark:invert"
            />
            <p className="mt-4 text-zinc-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
              {settings?.footerDescription ||
                "متجر ديب ستور الفاخر للستريت وير والموضة العصرية. تسوق أحدث التشكيلات بأفضل جودة وخامات ممتازة."}
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map(({ icon: Icon, label, href, btnClass }) => (
                <SocialIconButton key={label} href={href} label={label} className={btnClass}>
                  <Icon size={20} />
                </SocialIconButton>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase mb-4 text-amber-600 dark:text-amber-400">
              تسوق المتجر
            </h4>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-gray-400">
              {[
                { href: "/#products", label: "التشكيلة العصرية" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase mb-4 text-amber-600 dark:text-amber-400">
              معلومات المتجر
            </h4>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-gray-400">
              {[
                { href: "/about", label: "عن ديب ستور" },
                { href: "/contact", label: "اتصل بنا والشكاوى" },
                { href: "/privacy", label: "سياسة الخصوصية" },
                { href: "/terms", label: "الشروط والأحكام" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <motion.div
          className="mt-12 pt-6 border-t border-zinc-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>© {new Date().getFullYear()} DEEP STORE. All rights reserved.</p>

          {/* Developer Credit & WhatsApp */}
          <div className="flex flex-col md:items-end items-center gap-1">
            <p className="font-bold text-zinc-800 dark:text-zinc-300">
              Developed by Yousef
            </p>
            <a
              href="https://wa.me/201020451206"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-mono transition-colors"
            >
              <MessageCircle size={14} />
              <span>01020451206</span>
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
