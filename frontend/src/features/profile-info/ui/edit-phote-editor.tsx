import type { PhotoEditorHandle } from "@/shared/lib/rich-photo-editor/photo-editor";
import { RichPhotoEditor } from "@/shared/lib/rich-photo-editor/rich-photo-editor";
import { Button } from "@/shared/ui/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/ui/dialog";
import { TooltipLight } from "@/shared/ui/ui/tooltip";
import {
  RotateCw,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useModal } from "@/shared/lib/modal/use-modal";
import { editProfile, useCurrentUser } from "@/entities/user-session";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const ASPECT_RATIO = 1 / 1;

export function EditPhotoEditor({ image }: { image: File | null }) {
  const renderMask = ({ width, height }: { width: number; height: number }) => {
    return (
      <>
        <div
          className="overflow-hidden blur-2xl absolute w-full h-full pointer-events-none"
          style={{
            maskImage: `radial-gradient(circle closest-side at 50% 50%, transparent ${100}%, black ${100}%)`,
            backdropFilter: "blur(20px)",
            aspectRatio: ASPECT_RATIO,
            width: width,
            height: height,
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none border border-primary border-dashed"
          style={{
            aspectRatio: ASPECT_RATIO,
            width: Math.min(width, height),
            height: Math.min(width, height),
          }}
        />
      </>
    );
  };

  const url = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image]
  );

  const photoEditorRef = useRef<PhotoEditorHandle>(null);

  const { closeModal } = useModal();
  const [currentUser] = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  return (
    <div>
      <DialogContent className="h-[600px] flex flex-col">
        <DialogHeader className="flex gap-2 flex-row">
          <VisuallyHidden>
            <DialogTitle>Обновление фото</DialogTitle>
          </VisuallyHidden>
          <TooltipLight text="Увеличить">
            <Button
              onClick={() => photoEditorRef.current?.zoomIn()}
              variant="secondary"
              size="icon"
              disabled={isLoading}
            >
              <ZoomInIcon />
            </Button>
          </TooltipLight>
          <TooltipLight text="Уменьшить">
            <Button
              onClick={() => photoEditorRef.current?.zoomOut()}
              variant="secondary"
              size="icon"
              disabled={isLoading}
            >
              <ZoomOutIcon />
            </Button>
          </TooltipLight>
          <TooltipLight text="Повернуть">
            <Button
              onClick={() => photoEditorRef.current?.rotateQuarter()}
              variant="secondary"
              size="icon"
              disabled={isLoading}
            >
              <RotateCw />
            </Button>
          </TooltipLight>
        </DialogHeader>
        <RichPhotoEditor
          aspectRatio={ASPECT_RATIO}
          image={image}
          loading={false}
          url={url}
          photoEditorRef={photoEditorRef}
          renderMask={renderMask}
        />
        <DialogFooter>
          <Button
            disabled={isLoading}
            onClick={() => closeModal()}
            variant="outline"
          >
            Назад
          </Button>
          <Button
            disabled={isLoading}
            onClick={async () => {
              const newImage = await photoEditorRef.current?.handleSave();

              if (newImage && currentUser) {
                setIsLoading(true);
                const formData = new FormData();
                formData.append("file", newImage);

                const { data } = await editProfile(
                  currentUser?.name ?? "",
                  formData
                );

                if (data) {
                  await queryClient.invalidateQueries({
                    queryKey: ["user", currentUser.name],
                  });
                  toast.success("Фотография успешно обновлена");
                } else {
                  toast.error("Ошибка при обновлении фотографии");
                }

                closeModal();
                setIsLoading(false);
              }
            }}
          >
            Далее
          </Button>
        </DialogFooter>
      </DialogContent>
    </div>
  );
}
