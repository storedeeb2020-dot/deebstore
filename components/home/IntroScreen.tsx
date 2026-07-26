"use client";

import { NXTIntro } from "@/components/intros/NXTIntro";

export function IntroScreen({ onComplete }: { onComplete: () => void }) {
  return <NXTIntro onComplete={onComplete} />;
}
