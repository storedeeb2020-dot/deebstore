"use client";

import { useState, useEffect } from "react";
import { IntroScreen } from "./IntroScreen";

export function IntroManager({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const seen = sessionStorage.getItem("deep_intro_seen");
    if (!seen) {
      setShowIntro(true);
    }
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("deep_intro_seen", "true");
    setShowIntro(false);
  };

  if (!mounted) return <>{children}</>;

  return (
    <>
      {showIntro && <IntroScreen onComplete={handleComplete} />}
      {children}
    </>
  );
}
