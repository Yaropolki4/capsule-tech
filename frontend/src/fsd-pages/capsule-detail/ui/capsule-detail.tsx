"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { useCapsule } from "@/entities/capsules";
import { mapCategoryToLabel } from "@/entities/clothes";
import { useCurrentUser } from "@/entities/user-session";
import { useDeleteCapsuleMutation } from "@/features/capsules";
import { AvatarContainer } from "@/shared/ui/ui/avatar";
import { Badge } from "@/shared/ui/ui/badge";
import { Button } from "@/shared/ui/ui/button";
import { Skeleton } from "@/shared/ui/ui/skeleton";
import { ServerError } from "@/shared/ui/ui/server-error";
import { CAPSULE_CANVAS_ASPECT_RATIO } from "@/shared/constants/capsule";
import { routes } from "@/shared/constants/routes";

export function CapsuleDetail({ capsuleId }: { capsuleId: string }) {
  const router = useRouter();
  const [currentUser] = useCurrentUser();
  const { data: capsule, isLoading, error } = useCapsule(capsuleId);
  const { mutateAsync: deleteCapsuleAsync, isPending: isDeleting } =
    useDeleteCapsuleMutation();

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto mt-10 p-4">
        <Skeleton
          className="w-full"
          style={{ aspectRatio: CAPSULE_CANVAS_ASPECT_RATIO }}
        />
      </div>
    );
  }

  if (error || !capsule) {
    return <ServerError />;
  }

  const isOwner = capsule.createdBy.id === currentUser?.id;

  return (
    <div className="w-full h-full overflow-auto flex flex-col items-center p-4">
      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <AvatarContainer url={capsule.createdBy.avatarUrl} className="size-10" />
          <div className="font-medium">{capsule.createdBy.name}</div>
        </div>

        {capsule.name && (
          <h1 className="font-heading text-xl font-bold">{capsule.name}</h1>
        )}

        <div
          className="relative w-full bg-muted rounded-[var(--radius-container)] overflow-hidden"
          style={{ aspectRatio: CAPSULE_CANVAS_ASPECT_RATIO }}
        >
          <Image
            src={capsule.thumbnailUrl}
            alt={capsule.name ?? "Капсула"}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {capsule.items.map((item) => (
            <Badge key={item.id} variant="secondary" size="m">
              {item.brand ?? "Без бренда"} · {mapCategoryToLabel[item.category]}
            </Badge>
          ))}
        </div>

        {isOwner && (
          <Button
            variant="outline"
            disabled={isDeleting}
            onClick={async () => {
              await deleteCapsuleAsync(capsule.id);
              router.push(routes.getProfile(currentUser.name));
            }}
          >
            <Trash />
            Удалить капсулу
          </Button>
        )}
      </div>
    </div>
  );
}
