"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useClothes } from "@/entities/clothes";
import { useCurrentUser } from "@/entities/user-session";
import { routes } from "@/shared/constants/routes";
import { Input } from "@/shared/ui/ui/input";
import { Button } from "@/shared/ui/ui/button";
import { cn } from "@/lib/utils";
import { useCanvasActions, useCanvasItems } from "../model/canvas.store";

export function ClothesPicker() {
  const router = useRouter();
  const [currentUser] = useCurrentUser();
  const { data } = useClothes(currentUser?.id);
  const placedItems = useCanvasItems();
  const { addItem, selectItem } = useCanvasActions();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data ?? [];

    return (data ?? []).filter((item) =>
      (item.brand ?? "").toLowerCase().includes(query)
    );
  }, [data, search]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <Input
        placeholder="Поиск вещи"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="shrink-0"
      />

      <div className="grid grid-cols-2 auto-rows-min content-start gap-2 flex-1 min-h-0 overflow-y-auto">
        {filtered.map((clothes) => {
          const isPlaced = Boolean(placedItems[clothes.id]);

          return (
            <button
              key={clothes.id}
              type="button"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", clothes.id);
                event.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => {
                if (isPlaced) {
                  selectItem(clothes.id);

                  return;
                }

                addItem(clothes.id);
              }}
              className={cn(
                "relative aspect-square rounded-[var(--radius-card)] overflow-hidden",
                "border-2 border-transparent cursor-grab active:cursor-grabbing",
                isPlaced && "border-primary"
              )}
            >
              <Image
                src={clothes.imageUrl}
                alt={clothes.brand ?? "Вещь"}
                fill
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      <div className="rounded-[var(--radius-card)] bg-brand-accent-soft p-4 flex flex-col gap-2 shrink-0">
        <span className="text-sm font-semibold">Подобрать вещи с AI</span>
        <p className="text-xs text-muted-foreground">
          Стилист дополнит капсулу из гардероба.
        </p>
        <Button
          size="s"
          className="self-start"
          onClick={() => router.push(routes.aiStylist)}
        >
          <Sparkles />
          Открыть чат
        </Button>
      </div>
    </div>
  );
}
