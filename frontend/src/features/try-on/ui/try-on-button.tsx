"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/ui/button";
import { useModal } from "@/shared/lib/modal/use-modal";
import { TryOnModal } from "./try-on-modal";
import { cn } from "@/lib/utils";

export function TryOnButton({
  clothesId,
  capsuleId,
  previewImageUrl,
  className,
}: {
  clothesId?: string;
  capsuleId?: string;
  previewImageUrl: string;
  className?: string;
}) {
  const { openModal } = useModal();

  return (
    <Button
      type="button"
      size="s"
      variant="secondary"
      className={cn(
        "absolute bottom-2 left-1/2 -translate-x-1/2 z-10",
        "opacity-0 group-hover:opacity-100 transition-opacity shadow-md",
        className
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        openModal({
          Component: TryOnModal,
          props: { clothesId, capsuleId, previewImageUrl },
        });
      }}
    >
      <Sparkles />
      Примерить
    </Button>
  );
}
