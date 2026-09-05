import Image from "next/image";
import type { Clothes } from "../model/types";
import { cn } from "@/lib/utils";
// eslint-disable-next-line boundaries/element-types
import { TryOnButton } from "@/features/try-on";

export function ClothesItem({
  item,
  onClick,
}: {
  item: Clothes;
  onClick: () => void;
}) {
  return (
    <div className={cn("w-full h-full pl-0.5 pb-0.5")} onClick={onClick}>
      <div
        className={cn(
          "w-full h-full relative group",
          "rounded-[var(--radius-card)] overflow-hidden",
          "cursor-pointer",
          "transition-all duration-200"
        )}
      >
        <Image
          src={item.imageUrl}
          alt={item.brand ?? "Вещь"}
          width={1000}
          height={1000}
        />
        <TryOnButton clothesId={item.id} previewImageUrl={item.imageUrl} />
      </div>
    </div>
  );
}
