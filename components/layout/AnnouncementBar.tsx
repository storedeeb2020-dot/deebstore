"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone } from "lucide-react";
import { getSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";

export function AnnouncementBar() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed in this session
    const wasDismissed = sessionStorage.getItem("announcement_dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }
    getSiteSettings()
      .then((s) => { if (s) setSettings(s); })
      .catch(console.error);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("announcement_dismissed", "1");
  };

  const show = !dismissed && settings?.announcementEnabled && settings?.announcementText;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden w-full z-50 relative"
          style={{ backgroundColor: settings?.announcementColor || "#F59E0B" }}
        >
          <div className="relative flex items-center justify-center px-10 py-2 min-h-[36px]">
            {/* Scrolling text wrapper */}
            <div className="flex items-center gap-2 overflow-hidden max-w-full">
              <Megaphone size={13} className="shrink-0 text-black/70" />
              {settings?.announcementLink ? (
                <a
                  href={settings.announcementLink}
                  className="text-[11px] sm:text-xs font-black text-black tracking-wide truncate hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {settings.announcementText}
                </a>
              ) : (
                <span className="text-[11px] sm:text-xs font-black text-black tracking-wide truncate">
                  {settings?.announcementText}
                </span>
              )}
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="إغلاق الإعلان"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X size={13} className="text-black/70" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
