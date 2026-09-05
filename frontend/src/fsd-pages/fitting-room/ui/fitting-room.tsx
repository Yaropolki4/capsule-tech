"use client";

import { useRef } from "react";
import { useCurrentUser } from "@/entities/user-session";
import { useTryOns } from "@/entities/try-on";
import { TryOnsList } from "@/features/try-on";
import { useResponsiveLanes } from "@/shared/lib/use-responsive-lanes";
import { Scroller } from "@/shared/ui/ui/scroller";
import { Eyebrow } from "@/shared/ui/ui/eyebrow";

export function FittingRoom() {
  const [currentUser] = useCurrentUser();
  const parentRef = useRef<HTMLDivElement>(null);
  const lanes = useResponsiveLanes();

  const { data: tryOns } = useTryOns(currentUser?.id);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="bg-background w-full h-full flex flex-col overflow-scroll items-center">
      <Scroller ref={parentRef}>
        <div className="max-w-5xl mx-auto px-4 md:px-12 pt-6 pb-10 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-bold">Примерочная</h1>
            <Eyebrow>{tryOns?.length ?? 0} примерок</Eyebrow>
          </div>

          <TryOnsList parentRef={parentRef} lanes={lanes} />
        </div>
      </Scroller>
    </div>
  );
}
