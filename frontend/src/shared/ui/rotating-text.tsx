"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_INTERVAL_MS = 3000;
const DEFAULT_TRANSITION_MS = 250;

export function RotatingText({
  phrases,
  intervalMs = DEFAULT_INTERVAL_MS,
  transitionMs = DEFAULT_TRANSITION_MS,
  className,
}: {
  phrases: string[];
  intervalMs?: number;
  transitionMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (phrases.length < 2) return;

    let swapTimeout: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setVisible(false);
      swapTimeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setVisible(true);
      }, transitionMs);
    }, intervalMs);

    return () => {
      clearInterval(interval);
      clearTimeout(swapTimeout);
    };
  }, [phrases.length, intervalMs, transitionMs]);

  return (
    <span
      className={cn(
        "inline-block transition-all ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
        className
      )}
      style={{ transitionDuration: `${transitionMs}ms` }}
    >
      {phrases[index]}
    </span>
  );
}
