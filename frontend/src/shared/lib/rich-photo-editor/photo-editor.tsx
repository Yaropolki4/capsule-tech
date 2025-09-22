import { useImperativeHandle } from "react";
import { usePhotoEditor } from "./use-photo-editor";

export type PhotoEditorHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  rotateQuarter: () => void;
  handleSave: () => Promise<File | null>;
  toggleMode: () => "draw" | "pan";
  backHistory: () => void;
  setLineWidth: (width: number) => void;
};

export function PhotoEditor({
  file,
  width,
  height,
  ref,
  aspectRatio,
}: {
  file: File;
  width: number;
  height: number;
  ref: React.RefObject<PhotoEditorHandle | null>;
  aspectRatio: number;
}) {
  const {
    canvasRef,
    handleZoomIn,
    handleZoomOut,
    generateEditedFile,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    setRotate,
    setMode,
    mode,
    backHistory,
    setLineWidth,
    handlePointerLeave,
  } = usePhotoEditor({
    file,
    defaultBrightness: 100,
    defaultContrast: 100,
    defaultSaturate: 100,
    defaultGrayscale: 0,
    canvasWidth: width,
    canvasHeight: height,
    aspectRatio,
  });

  useImperativeHandle<PhotoEditorHandle, PhotoEditorHandle>(ref, () => ({
    zoomIn: () => handleZoomIn(undefined, undefined),
    zoomOut: () => handleZoomOut(undefined, undefined),
    rotateQuarter: () => setRotate((prev) => prev + 90),
    handleSave: generateEditedFile,
    toggleMode: () => {
      setMode((prev) => (prev === "draw" ? "pan" : "draw"));

      return mode === "draw" ? "pan" : "draw";
    },
    backHistory: backHistory,
    setLineWidth: setLineWidth,
  }));

  return (
    <div className="w-full h-full">
      <canvas
        ref={canvasRef}
        style={{ minWidth: width, minHeight: height, width, height }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onWheel={handleWheel}
      />
    </div>
  );
}
