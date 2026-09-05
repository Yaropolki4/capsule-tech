"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useCurrentUser } from "@/entities/user-session";
import {
  useClothes,
  mapCategoryToGroup,
  CATEGORY_GROUPS,
  type CategoryGroup,
} from "@/entities/clothes";
import { ClothesList } from "@/features/clothes";
import { CreateClothesForm } from "@/features/create-clothes-form";
import { PageUserProvider } from "@/shared/providers/page-user/page-user-provider";
import { useModal } from "@/shared/lib/modal/use-modal";
import { useResponsiveLanes } from "@/shared/lib/use-responsive-lanes";
import { Scroller } from "@/shared/ui/ui/scroller";
import { Input } from "@/shared/ui/ui/input";
import { Button } from "@/shared/ui/ui/button";
import { Eyebrow } from "@/shared/ui/ui/eyebrow";
import { cn } from "@/lib/utils";

export function Wardrobe() {
  const [currentUser] = useCurrentUser();
  const { openModal } = useModal();
  const parentRef = useRef<HTMLDivElement>(null);
  const lanes = useResponsiveLanes();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryGroup>("Все");

  const { data: allClothes } = useClothes(currentUser?.id);

  const counts = useMemo(() => {
    const result: Partial<Record<CategoryGroup, number>> = {
      Все: allClothes?.length ?? 0,
    };

    for (const item of allClothes ?? []) {
      const group = mapCategoryToGroup[item.category];
      result[group] = (result[group] ?? 0) + 1;
    }

    return result;
  }, [allClothes]);

  const onAddClothes = () => {
    openModal({ Component: CreateClothesForm, props: {} });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <PageUserProvider pageUser={currentUser.name}>
      <div className="bg-background w-full h-full flex flex-col overflow-scroll items-center">
        <Scroller ref={parentRef}>
          <div className="max-w-5xl mx-auto px-4 md:px-12 pt-6 pb-10 flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex flex-col gap-1">
                <h1 className="font-heading text-2xl font-bold">Гардероб</h1>
                <Eyebrow>{counts.Все ?? 0} вещей</Eyebrow>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Поиск по бренду"
                    className="pl-9 w-56 rounded-full"
                  />
                </div>
                <Button onClick={onAddClothes}>
                  <Plus />
                  Добавить вещь
                </Button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {CATEGORY_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setCategory(group)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-colors",
                    category === group
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {group} · {counts[group] ?? 0}
                </button>
              ))}
            </div>

            <ClothesList
              parentRef={parentRef}
              lanes={lanes}
              filterCategory={category}
              searchQuery={search}
            />

            <button
              type="button"
              onClick={onAddClothes}
              className={cn(
                "flex flex-col items-center justify-center gap-2 min-h-40",
                "rounded-[var(--radius-card)] border border-dashed border-border",
                "text-muted-foreground hover:text-brand-accent-text hover:border-brand-accent cursor-pointer"
              )}
            >
              <Plus className="size-6" />
              <span className="text-sm font-medium">Добавить вещь</span>
            </button>
          </div>
        </Scroller>
      </div>
    </PageUserProvider>
  );
}
