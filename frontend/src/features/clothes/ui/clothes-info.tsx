import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/ui/dialog";
import type { Clothes } from "../model/types";
import Image from "next/image";
import { Button } from "@/shared/ui/ui/button";
import { useModal } from "@/shared/lib/modal/use-modal";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/shared/ui/ui/badge";
import { mapCategoryToLabel } from "@/entities/clothes";
import { Trash } from "lucide-react";
import { useCurrentUser } from "@/entities/user-session";
import { useDeleteClotherMutation } from "../model/use-delete-clother-mutation";

export function ClothesInfo({ clothes }: { clothes: Clothes }) {
  const { closeModal } = useModal();
  const [currentUser] = useCurrentUser();
  const { mutateAsync: deleteClothesAsync, isPending: isDeletingClothes } =
    useDeleteClotherMutation();

  return (
    <DialogContent className="flex flex-col">
      <DialogHeader>
        <VisuallyHidden>
          <DialogTitle>Информация о одежде</DialogTitle>
        </VisuallyHidden>
        <div className="flex gap-2">
          <Badge size="m">{clothes.brand ?? "Без бренда"}</Badge>
          <Badge variant="secondary" size="m">
            {mapCategoryToLabel[clothes.category]}
          </Badge>
        </div>
      </DialogHeader>
      <div
        className="relative flex justify-center items-center"
        style={{ height: 600 }}
      >
        <div className="absolute w-full h-full flex justify-center items-center">
          <Image
            src={clothes.imageUrl}
            alt={clothes.brand ?? "Вещь"}
            width={1000}
            height={1000}
            className="h-auto w-full rounded-md object-contain"
          />
        </div>
      </div>
      <DialogFooter>
        {clothes.sourceUrl && (
          <Button variant="outline" size="s" asChild>
            <a
              href={clothes.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть на Wildberries
            </a>
          </Button>
        )}
        {clothes.createdById === currentUser?.id ? (
          <Button
            variant="outline"
            size="s"
            onClick={async () => {
              await deleteClothesAsync(clothes.id);
              closeModal();
            }}
            disabled={isDeletingClothes}
          >
            <Trash />
            Удалить из гардероба
          </Button>
        ) : null}
        <Button size="s" variant="outline" onClick={() => closeModal()}>
          Закрыть
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
