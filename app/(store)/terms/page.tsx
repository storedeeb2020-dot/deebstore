"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";

const defaultSections = [
  {
    title: "Acceptance of Terms",
    content:
      "By using DEEP STORE, you agree to these Terms of Service. If you do not agree, please do not use our website or services.",
  },
  {
    title: "Orders & Payments",
    content:
      "All orders are subject to availability. Payment must be completed via Cash on Delivery, Vodafone Cash, or InstaPay. We reserve the right to cancel orders that are not paid or verified.",
  },
  {
    title: "Shipping & Delivery",
    content:
      "We aim to ship all orders within 1–2 business days. Delivery takes 2–5 business days depending on your governorate. Shipping fees apply based on your location.",
  },
  {
    title: "Returns & Exchanges",
    content:
      "We accept returns within 7 days of delivery for unused items in original condition. Items must not be washed or damaged. Contact us to initiate a return.",
  },
  {
    title: "Limitation of Liability",
    content:
      "DEEP STORE is not responsible for delays caused by courier services or events beyond our control. We are not liable for any indirect or consequential damages.",
  },
];

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
    <div className="pt-20 min-h-screen bg-white dark:bg-black text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: {new Date().getFullYear()}</p>

        {customTermsText ? (
          <div className="prose dark:prose-invert max-w-none space-y-6 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {customTermsText}
          </div>
        ) : (
          <div className="space-y-8">
            {defaultSections.map(({ title, content }) => (
              <section key={title}>
                <h2 className="text-xl font-bold mb-3">{title}</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{content}</p>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
