import Image from "next/image";
import Link from "next/link";
import type { Capsule } from "@/entities/capsules";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/lib/utils";
// eslint-disable-next-line boundaries/element-types
import { TryOnButton } from "@/features/try-on";

export function CapsuleItem({ item }: { item: Capsule }) {
  return (
    <Link
      href={routes.getCapsule(item.id)}
      className={cn("block w-full h-full pl-0.5 pb-0.5")}
    >
      <div
        className={cn(
          "w-full h-full relative group",
          "rounded-[var(--radius-card)] overflow-hidden",
          "cursor-pointer",
          "transition-all duration-200"
        )}
      >
        <Image
          src={item.thumbnailUrl}
          alt={item.name ?? "Капсула"}
          width={1000}
          height={1000}
        />
        <TryOnButton capsuleId={item.id} previewImageUrl={item.thumbnailUrl} />
      </div>
    </Link>
  );
}
