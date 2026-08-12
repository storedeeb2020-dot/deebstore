"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(console.error);
  }, []);

  const aboutTitle = settings?.aboutTitle || "عن ديب ستور";
  const aboutSubtitle = settings?.aboutSubtitle || "";

  const section1Title = settings?.aboutSection1Title || "";
  const section1Text = settings?.aboutSection1Text || "";
  const section1Image = settings?.aboutSection1Image || "";
  const section2Title = settings?.aboutSection2Title || "";
  const section2Text = settings?.aboutSection2Text || "";
  const section2Image = settings?.aboutSection2Image || "";

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
            Our Story
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {aboutTitle}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
            {aboutSubtitle}
          </p>
        </motion.div>

        <div className="space-y-16">
          {/* Section 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">{section1Title}</h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                {section1Text}
              </p>
            </div>
            {section1Image && (
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section1Image}
                  alt={section1Title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </motion.div>

          {/* Section 2 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`grid grid-cols-1 ${section2Image ? "md:grid-cols-2" : ""} gap-8 items-center`}
          >
            {section2Image && (
              <div className="order-2 md:order-1 aspect-[4/3] relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section2Image}
                  alt={section2Title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="order-1 md:order-2">
              <h2 className="text-2xl font-bold mb-4 text-foreground">{section2Title}</h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                {section2Text}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
