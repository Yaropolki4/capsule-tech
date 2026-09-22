"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/ui/button";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "capsule:cookie-notice-accepted";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}

    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Уведомление об использовании cookie"
      className={cn(
        "fixed inset-x-4 bottom-4 z-40 max-md:bottom-24",
        "sm:left-auto sm:max-w-[420px]",
        "bg-card border-border shadow-elevated rounded-2xl border p-4",
        "flex items-start gap-4"
      )}
    >
      <p className="text-muted-foreground flex-1 text-[12.5px] leading-relaxed text-pretty">
        Сайт использует файлы cookie для авторизации и работы личного кабинета.
        Продолжая пользоваться сайтом, вы соглашаетесь с их использованием.{" "}
        <Link
          href={routes.privacy}
          className="text-brand-accent-text underline underline-offset-2 hover:no-underline"
        >
          Подробнее
        </Link>
      </p>
      <Button size="s" onClick={dismiss} className="shrink-0">
        Понятно
      </Button>
    </div>
  );
}
