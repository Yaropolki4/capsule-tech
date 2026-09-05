"use client";

import { useState } from "react";
import type { RefObject } from "react";
import { toBlob } from "html-to-image";
import { toast } from "sonner";
import { Button } from "@/shared/ui/ui/button";
import { uploadCapsuleThumbnail } from "@/entities/capsules";
import { useCreateCapsuleMutation } from "../model/use-create-capsule-mutation";
import {
  useCanvasActions,
  useCanvasItems,
  useStyledImageUrl,
} from "../model/canvas.store";

export function PublishButton({
  canvasRef,
  name,
  isPublic,
  variant = "default",
  onPublished,
}: {
  canvasRef: RefObject<HTMLDivElement | null>;
  name?: string;
  isPublic: boolean;
  variant?: "default" | "outline";
  onPublished: (capsuleId: string) => void;
}) {
  const items = useCanvasItems();
  const styledImageUrl = useStyledImageUrl();
  const { reset, selectItem } = useCanvasActions();
  const { mutateAsync, isPending } = useCreateCapsuleMutation();
  const [isRasterizing, setIsRasterizing] = useState(false);

  const itemsList = Object.values(items);

  const handlePublish = async () => {
    if (itemsList.length === 0) {
      toast.error("Добавьте хотя бы одну вещь");

      return;
    }

    selectItem(null);
    setIsRasterizing(true);

    try {
      let thumbnailUrl = styledImageUrl;

      if (!thumbnailUrl) {
        const canvas = canvasRef.current;

        if (!canvas) {
          return;
        }

        const blob = await toBlob(canvas, { pixelRatio: 2 });

        if (!blob) {
          throw new Error("Не удалось создать превью");
        }

        thumbnailUrl = await uploadCapsuleThumbnail(blob);
      }

      const capsule = await mutateAsync({
        name: name || undefined,
        thumbnailUrl,
        items: itemsList,
        public: isPublic,
      });

      reset();
      onPublished(capsule.id);
    } catch {
      toast.error(
        isPublic ? "Не удалось опубликовать капсулу" : "Не удалось сохранить капсулу"
      );
    } finally {
      setIsRasterizing(false);
    }
  };

  const isBusy = isPending || isRasterizing;

  return (
    <Button
      onClick={handlePublish}
      disabled={isBusy}
      fullWidth
      size="l"
      variant={variant}
    >
      {isBusy
        ? isPublic
          ? "Публикация..."
          : "Сохранение..."
        : isPublic
          ? "Опубликовать капсулу"
          : "Сохранить капсулу"}
    </Button>
  );
}
