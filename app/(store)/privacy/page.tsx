"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";

const defaultSections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide directly to us, such as your name, phone number, delivery address, and payment method when you place an order. We also collect information about how you use our website.",
  },
  {
    title: "How We Use Your Information",
    content:
      "We use the information we collect to process orders, communicate with you about your orders, and improve our services. We do not sell your personal information to third parties.",
  },
  {
    title: "Data Security",
    content:
      "We take reasonable measures to protect your information from unauthorized access or disclosure. Your payment information is never stored on our servers.",
  },
  {
    title: "Cookies",
    content:
      "We use cookies to improve your browsing experience and analyze site traffic. You can choose to disable cookies through your browser settings.",
  },
  {
    title: "Contact Us",
    content:
      "If you have questions about this Privacy Policy, please contact us at our official support channels.",
  },
];

export default function PrivacyPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(console.error);
  }, []);

  const customPolicyText = settings?.privacyPolicyText;

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: {new Date().getFullYear()}</p>

        {customPolicyText ? (
          <div className="prose dark:prose-invert max-w-none space-y-6 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {customPolicyText}
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
