"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/ui/dialog";
import { Button } from "@/shared/ui/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/ui/tabs";
import { useModal } from "@/shared/lib/modal/use-modal";
import { useCurrentUser } from "@/entities/user-session";
import { useUserCapsules } from "@/entities/capsules";
import { useClothes } from "@/entities/clothes";
import { cn } from "@/lib/utils";
import { useCreatePostMutation } from "../model/use-create-post-mutation";

type AttachmentType = "none" | "capsule" | "clothes";

export function CreatePostForm() {
  const { closeModal } = useModal();
  const [currentUser] = useCurrentUser();
  const [text, setText] = useState("");
  const [attachmentType, setAttachmentType] = useState<AttachmentType>("none");
  const [selectedCapsuleId, setSelectedCapsuleId] = useState<string | null>(
    null
  );
  const [selectedClothesId, setSelectedClothesId] = useState<string | null>(
    null
  );

  const { data: capsules } = useUserCapsules(
    currentUser?.id,
    attachmentType === "capsule"
  );
  const { data: clothes } = useClothes(
    currentUser?.id,
    attachmentType === "clothes"
  );

  const { mutateAsync, isPending } = useCreatePostMutation();

  const handleSubmit = async () => {
    try {
      await mutateAsync({
        text: text.trim() || undefined,
        capsuleId:
          attachmentType === "capsule"
            ? (selectedCapsuleId ?? undefined)
            : undefined,
        clothesId:
          attachmentType === "clothes"
            ? (selectedClothesId ?? undefined)
            : undefined,
      });
      closeModal();
    } catch {
      toast.error("Не удалось создать пост");
    }
  };

  const canSubmit = Boolean(
    text.trim() ||
      (attachmentType === "capsule" && selectedCapsuleId) ||
      (attachmentType === "clothes" && selectedClothesId)
  );

  return (
    <DialogContent className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Новый пост</DialogTitle>
      </DialogHeader>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Что нового?"
        rows={3}
        className={cn(
          "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        )}
      />

      <Tabs
        variant="pill"
        value={attachmentType}
        onValueChange={(value) => {
          setAttachmentType(value as AttachmentType);
          setSelectedCapsuleId(null);
          setSelectedClothesId(null);
        }}
      >
        <TabsList>
          <TabsTrigger value="none">Без вложения</TabsTrigger>
          <TabsTrigger value="capsule">Капсула</TabsTrigger>
          <TabsTrigger value="clothes">Вещь</TabsTrigger>
        </TabsList>
      </Tabs>

      {attachmentType === "capsule" && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(capsules ?? []).map((capsule) => (
            <button
              key={capsule.id}
              type="button"
              onClick={() => setSelectedCapsuleId(capsule.id)}
              className={cn(
                "relative shrink-0 size-20 rounded-[var(--radius-card)] overflow-hidden",
                "border-2 border-transparent cursor-pointer",
                selectedCapsuleId === capsule.id && "border-primary"
              )}
            >
              <Image
                src={capsule.thumbnailUrl}
                alt={capsule.name ?? "Капсула"}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {attachmentType === "clothes" && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(clothes ?? []).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedClothesId(item.id)}
              className={cn(
                "relative shrink-0 size-20 rounded-[var(--radius-card)] overflow-hidden",
                "border-2 border-transparent cursor-pointer",
                selectedClothesId === item.id && "border-primary"
              )}
            >
              <Image
                src={item.imageUrl}
                alt={item.brand ?? "Вещь"}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={() => closeModal()}>
          Отмена
        </Button>
        <Button disabled={!canSubmit || isPending} onClick={handleSubmit}>
          Опубликовать
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
