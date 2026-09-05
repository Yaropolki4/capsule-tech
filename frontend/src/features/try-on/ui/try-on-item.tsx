import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/ui/button";
import type { TryOn } from "@/entities/try-on";
import { cn } from "@/lib/utils";

export function TryOnItem({
  item,
  onClick,
  onDelete,
}: {
  item: TryOn;
  onClick: () => void;
  onDelete: () => void;
}) {
  const caption = item.clothes?.brand || item.capsule?.name || "Примерка";

  return (
    <div className={cn("w-full h-full pl-0.5 pb-0.5 group")} onClick={onClick}>
      <div
        className={cn(
          "w-full h-full relative",
          "rounded-[var(--radius-card)] overflow-hidden bg-muted",
          "cursor-pointer"
        )}
      >
        <Image
          src={item.resultImageUrl}
          alt={caption}
          fill
          className="object-cover"
        />
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="size-4" />
        </Button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <span className="text-white text-xs font-medium truncate block">
            {caption}
          </span>
        </div>
      </div>
    </div>
  );
}
