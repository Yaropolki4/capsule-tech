import { PhotoEditor, type PhotoEditorHandle } from "./photo-editor";
import { useMeasure } from "react-use";
import { Ban } from "lucide-react";
import { Loader } from "@/shared/ui/ui/loader";

type RichPhotoEditorProps = {
  aspectRatio: number;
  image: File | null;
  loading?: boolean;
  url: string | null;
  photoEditorRef: React.RefObject<PhotoEditorHandle | null>;
  renderMask: ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) => React.ReactNode;
};

export function RichPhotoEditor({
  aspectRatio,
  image,
  loading,
  url,
  photoEditorRef,
  renderMask,
}: RichPhotoEditorProps) {
  const [imageContainerRef, { width, height }] = useMeasure<HTMLDivElement>();

  return !loading ? (
    <div
      ref={imageContainerRef}
      className="grow relative flex items-center justify-center border border-border"
    >
      <div className="absolute w-full h-full flex items-center justify-center">
        {renderMask({ width, height })}
        <div
          className="absolute h-full border border-primary border-dashed pointer-events-none"
          style={{ aspectRatio: aspectRatio }}
        />
        {url ? (
          <>
            {image && width && height && (
              <PhotoEditor
                file={image}
                width={width}
                height={height}
                ref={photoEditorRef}
                aspectRatio={aspectRatio}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center gap-2">
            <Ban className="w-10 h-10" />
            Изображение не найдено
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="grow flex w-full items-center justify-center flex-col gap-2">
      <Loader className="w-10 h-10" />
      Обработка изображения...
    </div>
  );
}
