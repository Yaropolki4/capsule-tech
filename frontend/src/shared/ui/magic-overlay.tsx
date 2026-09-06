"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { RotatingText } from "./rotating-text";

export function MagicOverlay({
  open,
  title,
  phrases,
}: {
  open: boolean;
  title: string;
  phrases: string[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center gap-6",
        "bg-background/95 backdrop-blur-sm animate-in fade-in duration-300"
      )}
    >
      <div className="relative flex size-28 items-center justify-center">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            aria-hidden
            className="absolute inset-0 m-auto size-16 rounded-full bg-brand-accent-soft animate-magic-ring"
            style={{ animationDelay: `${index * 0.7}s` }}
          />
        ))}
        <div
          className={cn(
            "relative flex size-16 items-center justify-center rounded-full",
            "bg-primary text-primary-foreground shadow-lg animate-magic-pulse"
          )}
        >
          <Sparkles className="size-7" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 px-6 text-center">
        <p className="text-base font-semibold">{title}</p>
        <RotatingText phrases={phrases} className="text-sm text-muted-foreground" />
      </div>
    </div>,
    document.body
  );
}
