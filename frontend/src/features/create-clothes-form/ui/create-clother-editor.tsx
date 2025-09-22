import { Button } from "@/shared/ui/ui/button";
import { DialogFooter, DialogHeader } from "@/shared/ui/ui/dialog";
import { useRef, useState } from "react";
import type { PhotoEditorHandle } from "@/shared/lib/rich-photo-editor/photo-editor";
import { cn } from "@/lib/utils";
import { removeBackground } from "@/entities/clothes";
import { toast } from "sonner";
import { RichPhotoEditor } from "@/shared/lib/rich-photo-editor/rich-photo-editor";
import { CutBackground } from "./create-clothes-editor-controls/cut-background";
import { ZoomIn } from "./create-clothes-editor-controls/zoom-in";
import { ZoomOut } from "./create-clothes-editor-controls/zoom-out";
import { Eraser } from "./create-clothes-editor-controls/eraser";
import { Rotate } from "./create-clothes-editor-controls/rotate";

type CreateClotherEditorProps = {
  url: string | null;
  image: File | null;
  onBackClick: () => void;
  onNextClick: () => void;
  setImage: (image: File) => void;
};

const ASPECT_RATIO = 3 / 4;

export function CreateClotherEditor({
  url,
  image,
  onBackClick,
  onNextClick,
  setImage,
}: CreateClotherEditorProps) {
  const photoEditorRef = useRef<PhotoEditorHandle>(null);
  const [cutStatus, setCutStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [isErasing, setIsErasing] = useState(false);

  const renderMask = ({ width, height }: { width: number; height: number }) => {
    const blurWidth = (width - height * ASPECT_RATIO) / 2;

    return (
      <>
        <div
          style={{ backdropFilter: "blur(10px)", width: blurWidth }}
          className="absolute h-full left-0"
        />
        <div
          style={{ backdropFilter: "blur(10px)", width: blurWidth }}
          className="absolute h-full right-0"
        />
      </>
    );
  };

  const handleCutBackground = async () => {
    const newImage = await photoEditorRef.current?.handleSave();

    if (newImage) {
      setImage(newImage);
    }

    const currentImage = newImage ?? image;

    setCutStatus("loading");

    const data = new FormData();

    if (currentImage) {
      data.append("file", currentImage);

      try {
        const newImage = await removeBackground(data);
        setImage(newImage);
        setCutStatus("success");
        toast.success("Фон удален");
      } catch {
        toast.error("Ошибка при удалении фона");
        setCutStatus("error");
      } finally {
        setIsErasing(false);
      }
    }
  };

  return (
    <>
      <DialogHeader className="mb-2">
        <div className="w-full flex gap-2 flex-wrap">
          <CutBackground
            disabled={cutStatus === "loading" || cutStatus === "success"}
            onClick={handleCutBackground}
          />
          <ZoomIn
            disabled={cutStatus === "loading"}
            onClick={() => photoEditorRef.current?.zoomIn()}
          />
          <ZoomOut
            disabled={cutStatus === "loading"}
            onClick={() => photoEditorRef.current?.zoomOut()}
          />
          <Rotate
            disabled={cutStatus === "loading"}
            onClick={() => photoEditorRef.current?.rotateQuarter()}
          />
          <Eraser
            disabled={cutStatus === "loading"}
            onEraserClick={() => {
              if (cutStatus !== "success") return;

              photoEditorRef.current?.toggleMode();
              setIsErasing(isErasing ? false : true);
            }}
            onUndoClick={() => photoEditorRef.current?.backHistory()}
            onLineWidthChange={(width) =>
              photoEditorRef.current?.setLineWidth(width)
            }
            mainButtonDisabled={cutStatus !== "success"}
            isErasing={isErasing}
          />
        </div>
      </DialogHeader>
      <RichPhotoEditor
        aspectRatio={ASPECT_RATIO}
        image={image}
        loading={cutStatus === "loading"}
        url={url}
        photoEditorRef={photoEditorRef}
        renderMask={renderMask}
      />
      <DialogFooter className={cn(!url && "hidden")}>
        <Button
          disabled={cutStatus === "loading"}
          onClick={onBackClick}
          variant="outline"
        >
          Назад
        </Button>
        <Button
          disabled={!url || cutStatus === "loading"}
          onClick={async () => {
            const newImage = await photoEditorRef.current?.handleSave();

            if (newImage) {
              setImage(newImage);
            }

            onNextClick();
          }}
        >
          Далее
        </Button>
      </DialogFooter>
    </>
  );
}
