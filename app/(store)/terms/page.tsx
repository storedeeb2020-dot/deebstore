"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";

export default function TermsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(console.error);
  }, []);

  const customTermsText = settings?.termsOfServiceText;

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black text-foreground dir-rtl" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">الشروط والأحكام — Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-8">آخر تحديث: {new Date().getFullYear()}</p>

        {customTermsText ? (
          <div className="prose dark:prose-invert max-w-none space-y-6 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {customTermsText}
          </div>
        ) : (
          <div className="text-zinc-500 dark:text-zinc-400 text-sm italic">
            يمكنك كتابة وتعديل نص الشروط والأحكام كاملاً من لوحة التحكم (إعدادات المتجر).
          </div>
        )}
      </div>
    </div>
  );
}
