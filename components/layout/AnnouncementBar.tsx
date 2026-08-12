"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone } from "lucide-react";
import { subscribeToSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";

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
    const unsubscribe = subscribeToSiteSettings((s) => {
      if (s) setSettings(s);
    });
    return () => unsubscribe();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("announcement_dismissed", "1");
  };

  const parsed = settings?.announcementText
    ? settings.announcementText.split("|").map((t) => t.trim()).filter(Boolean)
    : [];

  // Repeat items to ensure there's enough content to fill the screen width and loop seamlessly
  let singleGroup = [...parsed];
  while (singleGroup.length < 15 && singleGroup.length > 0) {
    singleGroup = [...singleGroup, ...parsed];
  }

  const show = !dismissed && settings?.announcementEnabled && parsed.length > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden w-full z-50 relative select-none"
          style={{ backgroundColor: settings?.announcementColor || "#F59E0B" }}
        >
          {/* Injecting CSS for continuous marquee scrolling and hover-to-pause */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes marqueeScroll {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee-track {
              display: flex;
              width: max-content;
              animation: marqueeScroll 28s linear infinite;
            }
            .animate-marquee-track:hover {
              animation-play-state: paused;
            }
          `}} />

          <div className="relative flex items-center justify-start py-2.5 min-h-[36px] overflow-hidden pl-12" dir="ltr">
            {/* Marquee Track Container */}
            <div className="animate-marquee-track flex">
              {/* Sub-Track 1 */}
              <div className="flex items-center gap-16 pr-16 shrink-0">
                {singleGroup.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 shrink-0">
                    <Megaphone size={12.5} className="text-black/75 shrink-0" />
                    {settings?.announcementLink ? (
                      <a
                        href={settings.announcementLink}
                        className="text-[11px] sm:text-xs font-black text-black tracking-wide hover:underline cursor-pointer"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item}
                      </a>
                    ) : (
                      <span className="text-[11px] sm:text-xs font-black text-black tracking-wide">
                        {item}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Sub-Track 2 (Identical duplicate for mathematically perfect seamless loop) */}
              <div className="flex items-center gap-16 pr-16 shrink-0">
                {singleGroup.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 shrink-0">
                    <Megaphone size={12.5} className="text-black/75 shrink-0" />
                    {settings?.announcementLink ? (
                      <a
                        href={settings.announcementLink}
                        className="text-[11px] sm:text-xs font-black text-black tracking-wide hover:underline cursor-pointer"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item}
                      </a>
                    ) : (
                      <span className="text-[11px] sm:text-xs font-black text-black tracking-wide">
                        {item}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dismiss Button Overlay - Fading from Solid Theme Color to Transparent */}
            <div 
              className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pr-8 z-20 pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${settings?.announcementColor || "#F59E0B"} 50%, transparent)`
              }}
            >
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="إغلاق الإعلان"
                className="p-1 rounded-full bg-black/5 hover:bg-black/15 active:scale-95 transition-all pointer-events-auto cursor-pointer"
              >
                <X size={13} className="text-black/75" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
