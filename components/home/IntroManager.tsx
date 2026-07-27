"use client";

import { useState, useEffect } from "react";
import { IntroScreen } from "./IntroScreen";

export function IntroManager({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);

  const handleComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <IntroScreen onComplete={handleComplete} />}
      {children}
    </>
  );
}
