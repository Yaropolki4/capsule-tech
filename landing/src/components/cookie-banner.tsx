"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
      className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:max-w-[420px] animate-rise-in flex items-start gap-4 p-4 rounded-2xl bg-[rgba(15,13,17,.94)] backdrop-blur-md border border-white/[0.09] shadow-[0_30px_70px_-30px_rgba(0,0,0,.9)]"
    >
      <p className="flex-1 text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
        Сайт использует файлы cookie для авторизации и работы личного кабинета.
        Продолжая пользоваться сайтом, вы соглашаетесь с их использованием.{" "}
        <Link
          href="/privacy"
          className="text-brand-accent-text underline underline-offset-2 hover:no-underline"
        >
          Подробнее
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-[filter]"
      >
        Понятно
      </button>
    </div>
  );
}
