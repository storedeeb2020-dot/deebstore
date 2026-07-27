"use client";

import { DeepIntro } from "@/components/intros/DeepIntro";

export function IntroScreen({ onComplete }: { onComplete: () => void }) {
  return <DeepIntro onComplete={onComplete} />;
}
