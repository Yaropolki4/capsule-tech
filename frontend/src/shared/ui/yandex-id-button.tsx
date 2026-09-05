"use client";

import { Button } from "@/shared/ui/ui/button";
import { API_BASE_URL } from "@/shared/api/http-transport";

function YandexIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#FC3F1D" />
      <path
        d={
          "M13.28 18.4h1.86V5.6h-2.7c-2.72 0-4.16 1.4-4.16 3.46 0 1.65.79 2.62 2.2 3.62L8.5 18.4h2.02" +
          "l2.24-5.36-1.02-.68c-1.15-.78-1.71-1.38-1.71-2.68 0-1.14.8-1.91 2.32-1.91h.93v10.63Z"
        }
        fill="#fff"
      />
    </svg>
  );
}

export function YandexIdButton({ children }: { children: React.ReactNode }) {
  return (
    <Button
      type="button"
      variant="default"
      size="l"
      fullWidth
      className="bg-foreground text-background hover:bg-foreground/90"
      onClick={() => {
        window.location.href = `${API_BASE_URL}/auth/yandex`;
      }}
    >
      <YandexIcon />
      {children}
    </Button>
  );
}
