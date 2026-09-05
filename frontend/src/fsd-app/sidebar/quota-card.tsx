"use client";

import type { ReactNode } from "react";
import { Sparkles, MessageCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/ui/button";
import { CircularProgress } from "@/shared/ui/ui/circular-progress";
import { useTokenBalances } from "@/entities/billing";
import { useCurrentUser } from "@/entities/user-session";

const MONTHS_SHORT = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

function formatResetDate(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return (
    `${day} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}, ` +
    `${hours}:${minutes}`
  );
}

function percentLeft(remaining: number, limit: number): number {
  if (limit <= 0) return 0;

  return Math.max(0, Math.min(100, (remaining / limit) * 100));
}

function QuotaRow({
  icon,
  title,
  description,
  remaining,
  limit,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  remaining: number;
  limit: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <CircularProgress percent={percentLeft(remaining, limit)}>
        <span className="text-primary">{icon}</span>
      </CircularProgress>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="text-sm whitespace-nowrap">
        <span className="font-bold">{Math.max(0, remaining)}</span>
        <span className="text-muted-foreground"> / {limit}</span>
      </div>
    </div>
  );
}

export function QuotaCard() {
  const [currentUser] = useCurrentUser();
  const { data: balances } = useTokenBalances(Boolean(currentUser));

  const photo = balances?.photo ?? { remaining: 0, limit: 1000, resetAt: "" };
  const chat = balances?.chat ?? { remaining: 0, limit: 250, resetAt: "" };

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-4 flex flex-col gap-4 max-md:hidden">
      <QuotaRow
        icon={<Sparkles className="size-5" />}
        title="AI-фото"
        description="Капсулы, примерки и добавление вещей"
        remaining={photo.remaining}
        limit={photo.limit}
      />
      <QuotaRow
        icon={<MessageCircle className="size-5" />}
        title="Чат"
        description="Общение с AI-стилистом"
        remaining={chat.remaining}
        limit={chat.limit}
      />
      {balances && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Лимиты обновятся {formatResetDate(photo.resetAt)}
        </div>
      )}
      <Button
        variant="default"
        size="s"
        onClick={() => toast("Функция в разработке")}
      >
        Пополнить
      </Button>
    </div>
  );
}
