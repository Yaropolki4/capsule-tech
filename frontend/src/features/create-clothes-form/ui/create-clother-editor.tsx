import { Button } from "@/shared/ui/ui/button";
import { DialogFooter, DialogHeader } from "@/shared/ui/ui/dialog";
import { useRef, useState } from "react";
import type { PhotoEditorHandle } from "@/shared/lib/rich-photo-editor/photo-editor";
import { cn } from "@/lib/utils";
import { createClothes } from "@/entities/clothes";
import { RichPhotoEditor } from "@/shared/lib/rich-photo-editor/rich-photo-editor";
import { ZoomIn } from "./create-clothes-editor-controls/zoom-in";
import { ZoomOut } from "./create-clothes-editor-controls/zoom-out";
import { Rotate } from "./create-clothes-editor-controls/rotate";
import { useModal } from "@/shared/lib/modal/use-modal";
import { useCurrentUser } from "@/entities/user-session";
import {
  describeInsufficientTokensError,
  TOKEN_BALANCES_QUERY_KEY,
} from "@/entities/billing";
import { queryClient } from "@/shared/query-client";
import { TextCell } from "@/shared/ui/ui/text-cell";
import { Loader } from "@/shared/ui/ui/loader";

type CreateClotherEditorProps = {
  url: string | null;
  image: File | null;
  onBackClick: () => void;
  setImage: (image: File) => void;
};

const ASPECT_RATIO = 3 / 4;

export function CreateClotherEditor({
  url,
  image,
  onBackClick,
  setImage,
}: CreateClotherEditorProps) {
  const photoEditorRef = useRef<PhotoEditorHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Maybe<string>>(undefined);

  const { closeModal } = useModal();
  const [currentUser] = useCurrentUser();

  const renderMask = ({ width, height }: { width: number; height: number }) => {
    const blurWidth = (width - height * ASPECT_RATIO) / 2;

    return (
      <>
        <div
          style={{ backdropFilter: "blur(10px)", width: blurWidth }}
          className="absolute h-full left-0 border-r border-primary border-dashed"
        />
        <div
          style={{ backdropFilter: "blur(10px)", width: blurWidth }}
          className="absolute h-full right-0 border-l border-primary border-dashed"
        />
      </>
    );
  };

  const handleSubmit = async () => {
    const newImage = await photoEditorRef.current?.handleSave();

    if (newImage) {
      setImage(newImage);
    }

    const currentImage = newImage ?? image;

    if (!currentImage) {
      setSubmitError("Изображение не найдено");

      return;
    }

    setSubmitError(undefined);
    setIsSubmitting(true);

    const formData = new FormData();

    formData.append("file", currentImage);

    try {
      await createClothes(formData);
      await queryClient.invalidateQueries({
        queryKey: ["clothes", currentUser?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: TOKEN_BALANCES_QUERY_KEY,
      });
      closeModal();
    } catch (error) {
      setSubmitError(
        describeInsufficientTokensError(error) ??
          "Ошибка сервера, попробуйте позже"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader className="mb-2">
        <div className="w-full flex gap-2 flex-wrap">
          <ZoomIn
            disabled={isSubmitting}
            onClick={() => photoEditorRef.current?.zoomIn()}
          />
          <ZoomOut
            disabled={isSubmitting}
            onClick={() => photoEditorRef.current?.zoomOut()}
          />
          <Rotate
            disabled={isSubmitting}
            onClick={() => photoEditorRef.current?.rotateQuarter()}
          />
        </div>
      </DialogHeader>
      {submitError && <TextCell message={submitError} size="s" />}
      <RichPhotoEditor
        aspectRatio={ASPECT_RATIO}
        image={image}
        url={url}
        photoEditorRef={photoEditorRef}
        renderMask={renderMask}
      />
      <DialogFooter className={cn(!url && "hidden", "items-center")}>
        {isSubmitting && (
          <span className="text-xs text-muted-foreground mr-auto max-sm:hidden">
            Анализируем фото с помощью ИИ...
          </span>
        )}
        <Button
          disabled={isSubmitting}
          onClick={onBackClick}
          variant="outline"
        >
          Назад
        </Button>
        <Button
          disabled={!url || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? <Loader size="s" /> : "Добавить"}
        </Button>
      </DialogFooter>
    </>
  );
}
