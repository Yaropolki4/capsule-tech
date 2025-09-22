import { useState, useEffect, useRef } from "react";

/**
 * Parameters for the usePhotoEditor hook.
 */
interface UsePhotoEditorParams {
  /**
   * The image file to be edited.
   */
  file?: File;

  /**
   * Initial brightness level (default: 100).
   */
  defaultBrightness?: number;

  /**
   * Initial contrast level (default: 100).
   */
  defaultContrast?: number;

  /**
   * Initial saturation level (default: 100).
   */
  defaultSaturate?: number;

  /**
   * Initial grayscale level (default: 0).
   */
  defaultGrayscale?: number;

  /**
   * Flip the image horizontally (default: false).
   */
  defaultFlipHorizontal?: boolean;

  /**
   * Flip the image vertically (default: false).
   */
  defaultFlipVertical?: boolean;

  /**
   * Initial zoom level (default: 1).
   */
  defaultZoom?: number;

  /**
   * Initial rotation angle in degrees (default: 0).
   */
  defaultRotate?: number;

  /**
   * Initial line color for drawing (default: '#000000').
   */
  defaultLineColor?: string;

  /**
   * Initial line width for drawing (default: 2).
   */
  defaultLineWidth?: number;

  /**
   * Initial mode for the canvas (default: 'pan').
   */
  defaultMode?: "pan" | "draw";
  canvasWidth: number;
  canvasHeight: number;
  aspectRatio: number;
}

const ZOOM_STEP = 0.05;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.8;

/**
 * Custom hook for handling photo editing within a canvas.
 *
 * @param {UsePhotoEditorParams} params - Configuration parameters for the hook.
 * @returns {Object} - Returns state and functions for managing image editing.
 */
export const usePhotoEditor = ({
  file,
  defaultBrightness = 100,
  defaultContrast = 100,
  defaultSaturate = 100,
  defaultGrayscale = 0,
  defaultFlipHorizontal = false,
  defaultFlipVertical = false,
  defaultZoom = 1,
  defaultRotate = 0,
  defaultLineColor = "#000000",
  defaultLineWidth = 2,
  defaultMode = "pan",
  canvasWidth,
  canvasHeight,
  aspectRatio,
}: UsePhotoEditorParams) => {
  // Ref to the canvas element where the image will be drawn.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Create the image object using a ref
  const imgRef = useRef(new Image());

  // State to hold the source of the image.
  const [imageSrc, setImageSrc] = useState<string>("");

  // State variables for various image transformations.
  const [brightness, setBrightness] = useState(defaultBrightness);
  const [contrast, setContrast] = useState(defaultContrast);
  const [saturate, setSaturate] = useState(defaultSaturate);
  const [grayscale, setGrayscale] = useState(defaultGrayscale);
  const [rotate, setRotate] = useState(defaultRotate);
  const [flipHorizontal, setFlipHorizontal] = useState(defaultFlipHorizontal);
  const [flipVertical, setFlipVertical] = useState(defaultFlipVertical);
  const [zoom, setZoom] = useState(defaultZoom);

  // State variables for handling drag-and-drop panning.
  const [isDragging, setIsDragging] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [mode, setMode] = useState<"draw" | "pan">(defaultMode);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(
    null
  );

  // State variables for drawing on the canvas.
  const [lineColor, setLineColor] = useState<string>(defaultLineColor);

  const drawingPathsRef = useRef<
    { path: { x: number; y: number }[]; color: string; width: number }[]
  >([]);

  const currentDrawingWidthRef = useRef<number>(defaultLineWidth);

  // Effect to update the image source when the file changes.
  useEffect(() => {
    if (file) {
      const fileSrc = URL.createObjectURL(file);
      setImageSrc(fileSrc);

      // Clean up the object URL when the component unmounts or file changes.
      return () => {
        URL.revokeObjectURL(fileSrc);
      };
    }
  }, [file]);

  // Effect to apply transformations and filters whenever relevant state changes.
  useEffect(() => {
    applyFilter();
  }, [
    file,
    imageSrc,
    rotate,
    flipHorizontal,
    flipVertical,
    zoom,
    brightness,
    contrast,
    saturate,
    grayscale,
    offsetX,
    aspectRatio,
    offsetY,
  ]);

  const canvasToWorldCoords = (canvasX: number, canvasY: number) => {
    const imgElement = imgRef.current;
    const canvas = canvasRef.current;

    if (!imgElement || !canvas) return { x: canvasX, y: canvasY };

    const zoomedWidth = canvasWidth
      ? canvasWidth * zoom
      : imgElement.width * zoom;
    const zoomedHeight = canvasHeight
      ? canvasHeight * zoom
      : imgElement.height * zoom;

    const translateX = canvasWidth
      ? (canvasWidth - zoomedWidth) / 2
      : (imgElement.width - zoomedWidth) / 2;
    const translateY = canvasHeight
      ? (canvasHeight - zoomedHeight) / 2
      : (imgElement.height - zoomedHeight) / 2;

    const rotateAngle = (rotate * Math.PI) / 180;

    // Начинаем с координат канваса
    let x = canvasX;
    let y = canvasY;

    // 1. ОБРАТНЫЕ ТРАНСФОРМАЦИИ В ОБРАТНОМ ПОРЯДКЕ

    // 1.1 Убираем поворот вокруг центра канваса (если есть)
    if (rotate) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Translate обратно к центру
      x -= centerX;
      y -= centerY;

      // Обратный поворот
      const cosAngle = Math.cos(-rotateAngle);
      const sinAngle = Math.sin(-rotateAngle);
      const rotatedX = x * cosAngle - y * sinAngle;
      const rotatedY = x * sinAngle + y * cosAngle;

      x = rotatedX;
      y = rotatedY;

      // Translate обратно от центра
      x += centerX;
      y += centerY;
    }

    // 1.2 Убираем flip трансформации
    if (flipVertical) {
      // Обратная вертикальная трансформация
      y = canvas.height - y;
    }

    if (flipHorizontal) {
      // Обратная горизонтальная трансформация
      x = canvas.width - x;
    }

    // 1.3 Убираем translate с offset
    const offsetTransformX =
      offsetX * Math.cos(rotateAngle) + offsetY * Math.sin(rotateAngle);
    const offsetTransformY =
      -offsetX * Math.sin(rotateAngle) + offsetY * Math.cos(rotateAngle);

    x -= translateX + offsetTransformX;
    y -= translateY + offsetTransformY;

    // 1.4 Убираем scale
    x /= zoom;
    y /= zoom;

    return { x, y };
  };

  const redrawDrawingPaths = (context: CanvasRenderingContext2D) => {
    if (drawingPathsRef.current.length === 0) return;

    drawingPathsRef.current.forEach(({ path, width }) => {
      if (path.length === 0) return;

      // Сохраняем текущее состояние контекста
      context.save();

      // Применяем те же трансформации, что и к изображению
      const imgElement = imgRef.current;

      if (imgElement) {
        const zoomedWidth = canvasWidth
          ? canvasWidth * zoom
          : imgElement.width * zoom;
        const zoomedHeight = canvasHeight
          ? canvasHeight * zoom
          : imgElement.height * zoom;

        const translateX = canvasWidth
          ? (canvasWidth - zoomedWidth) / 2
          : (imgElement.width - zoomedWidth) / 2;
        const translateY = canvasHeight
          ? (canvasHeight - zoomedHeight) / 2
          : (imgElement.height - zoomedHeight) / 2;

        // ДОБАВЛЯЕМ: Поворот вокруг центра канваса (как в отрисовке изображения)
        if (rotate) {
          const canvas = context.canvas;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          context.translate(centerX, centerY);
          context.rotate((rotate * Math.PI) / 180);
          context.translate(-centerX, -centerY);
        }

        // ДОБАВЛЯЕМ: Flip трансформации (как в отрисовке изображения)
        if (flipHorizontal) {
          const canvas = context.canvas;
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        if (flipVertical) {
          const canvas = context.canvas;
          context.translate(0, canvas.height);
          context.scale(1, -1);
        }

        const rotateAngle = (rotate * Math.PI) / 180;

        // Применяем трансформации в том же порядке, что и для изображения
        context.translate(
          translateX +
            (offsetX * Math.cos(rotateAngle) + offsetY * Math.sin(rotateAngle)),
          translateY +
            -offsetX * Math.sin(rotateAngle) +
            offsetY * Math.cos(rotateAngle)
        );

        context.scale(zoom, zoom);
      }

      // ЛАСТИК: Устанавливаем режим удаления
      context.globalCompositeOperation = "destination-out";
      context.lineWidth = width;
      context.lineCap = "round";
      context.lineJoin = "round";

      context.beginPath();
      path.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      context.stroke();

      // Восстанавливаем состояние контекста
      context.restore();
    });
  };

  /**
   * Applies the selected filters and transformations to the image on the canvas.
   */
  const applyFilter = () => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    const imgElement = imgRef.current;
    imgRef.current.src = imageSrc;
    imgRef.current.onload = applyFilter;

    imgElement.onload = () => {
      if (canvas && context) {
        const zoomedWidth = canvasWidth
          ? canvasWidth * zoom
          : imgElement.width * zoom;
        const zoomedHeight = canvasHeight
          ? canvasHeight * zoom
          : imgElement.height * zoom;
        const translateX = canvasWidth
          ? (canvasWidth - zoomedWidth) / 2
          : (imgElement.width - zoomedWidth) / 2;
        const translateY = canvasHeight
          ? (canvasHeight - zoomedHeight) / 2
          : (imgElement.height - zoomedHeight) / 2;

        // Set canvas dimensions to match the image.
        canvas.width = canvasWidth ? canvasWidth : imgElement.width;
        canvas.height = canvasHeight ? canvasHeight : imgElement.height;

        // Clear the canvas before drawing the updated image.
        context.clearRect(0, 0, canvas.width, canvas.height);

        // ВАЖНО: Установить композицию по умолчанию
        context.globalCompositeOperation = "source-over";

        // Apply filters and transformations.
        context.filter = getFilterString();
        context.save();

        if (rotate) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          context.translate(centerX, centerY);
          context.rotate((rotate * Math.PI) / 180);
          context.translate(-centerX, -centerY);
        }

        if (flipHorizontal) {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        if (flipVertical) {
          context.translate(0, canvas.height);
          context.scale(1, -1);
        }

        const rotateAngle = (rotate * Math.PI) / 180;

        context.translate(
          translateX +
            (offsetX * Math.cos(rotateAngle) + offsetY * Math.sin(rotateAngle)),
          translateY +
            -offsetX * Math.sin(rotateAngle) +
            offsetY * Math.cos(rotateAngle)
        );

        context.scale(zoom, zoom);

        const imageWidth = canvasHeight
          ? (imgElement.width / imgElement.height) * canvasHeight
          : imgElement.width;
        const imageHeight = canvasHeight ? canvasHeight : imgElement.height;

        const dx = canvasWidth ? (canvasWidth - imageWidth) / 2 : 0;
        const dy = canvasHeight ? (canvasHeight - imageHeight) / 2 : 0;

        context.drawImage(imgElement, dx, dy, imageWidth, imageHeight);

        context.restore();
        context.filter = "none";

        // ВАЖНО: Сбрасываем композицию перед применением ластика
        context.globalCompositeOperation = "source-over";
        redrawDrawingPaths(context);
      }
    };
  };

  const generateEditedFile = (): Promise<File | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;

      if (!canvas || !file) {
        resolve(null);

        return;
      }

      const fileExtension = (file.name.split(".").pop() || "").toLowerCase();
      let mimeType;

      switch (fileExtension) {
        case "jpg":
        case "jpeg":
          mimeType = "image/jpeg";
          break;
        case "png":
          mimeType = "image/png";
          break;
        default:
          mimeType = "image/png";
      }

      const context = canvas?.getContext("2d");

      if (!context) {
        return;
      }

      const deltaWidth = canvasWidth - canvasHeight * aspectRatio;

      const newCanvas = document.createElement("canvas");
      newCanvas.width = canvasWidth - deltaWidth;
      newCanvas.height = canvasHeight;
      const newContext = newCanvas.getContext("2d");
      newContext?.drawImage(
        canvas,
        deltaWidth / 2,
        0,
        canvasWidth - deltaWidth,
        canvasHeight,
        0,
        0,
        canvasWidth - deltaWidth,
        canvasHeight
      );

      newCanvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], file.name, { type: blob.type });
          resolve(newFile);
        } else {
          resolve(null);
        }
      }, mimeType);
    });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;

    if (canvas && file) {
      const link = document.createElement("a");
      link.download = file.name;
      link.href = canvas.toDataURL(file?.type);
      link.click();
    }
  };

  /**
   * Generates a string representing the current filter settings.
   *
   * @returns {string} - A CSS filter string.
   */
  const getFilterString = (): string => {
    return `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) saturate(${saturate}%)`;
  };

  /**
   * Handles the zoom-in action.
   */
  const handleZoomIn = (clientX: Maybe<number>, clientY: Maybe<number>) => {
    const canvas = canvasRef.current;
    const imgElement = imgRef.current;

    if (!canvas || !imgElement) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = ((clientX ?? rect.width) - rect.left) * scaleX;
    const y = ((clientY ?? rect.height) - rect.top) * scaleY;

    const context = canvas.getContext("2d");

    if (!context) return;

    // Вычисляем текущие значения translate (как в функции отрисовки)
    const currentZoomedWidth = canvasWidth
      ? canvasWidth * zoom
      : imgElement.width * zoom;
    const currentZoomedHeight = canvasHeight
      ? canvasHeight * zoom
      : imgElement.height * zoom;

    const currentTranslateX = canvasWidth
      ? (canvasWidth - currentZoomedWidth) / 2
      : (imgElement.width - currentZoomedWidth) / 2;
    const currentTranslateY = canvasHeight
      ? (canvasHeight - currentZoomedHeight) / 2
      : (imgElement.height - currentZoomedHeight) / 2;

    // Находим координаты точки в "мировом пространстве" (до всех трансформаций)
    const worldX = (x - currentTranslateX - offsetX) / zoom;
    const worldY = (y - currentTranslateY - offsetY) / zoom;

    // Новый zoom
    const newZoom = zoom + ZOOM_STEP;

    // Вычисляем новые значения translate для нового zoom'а
    const newZoomedWidth = canvasWidth
      ? canvasWidth * newZoom
      : imgElement.width * newZoom;
    const newZoomedHeight = canvasHeight
      ? canvasHeight * newZoom
      : imgElement.height * newZoom;

    const newTranslateX = canvasWidth
      ? (canvasWidth - newZoomedWidth) / 2
      : (imgElement.width - newZoomedWidth) / 2;
    const newTranslateY = canvasHeight
      ? (canvasHeight - newZoomedHeight) / 2
      : (imgElement.height - newZoomedHeight) / 2;

    // Вычисляем новые offset'ы так, чтобы точка (worldX, worldY) осталась под курсором
    const newOffsetX = x - worldX * newZoom - newTranslateX;
    const newOffsetY = y - worldY * newZoom - newTranslateY;

    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);
    setZoom(
      newZoom > MAX_ZOOM ? MAX_ZOOM : newZoom < MIN_ZOOM ? MIN_ZOOM : newZoom
    );
  };

  /**
   * Handles the zoom-out action.
   */
  /**
   * Handles the zoom-out action.
   */
  const handleZoomOut = (clientX: Maybe<number>, clientY: Maybe<number>) => {
    const canvas = canvasRef.current;
    const imgElement = imgRef.current;

    if (!canvas || !imgElement) return;

    // Проверяем минимальный зум
    const newZoom = Math.max(zoom - ZOOM_STEP, ZOOM_STEP);

    if (newZoom === zoom) return; // Если зум не изменился, выходим

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = ((clientX ?? rect.width) - rect.left) * scaleX;
    const y = ((clientY ?? rect.height) - rect.top) * scaleY;

    const context = canvas.getContext("2d");

    if (!context) return;

    // Вычисляем текущие значения translate (как в функции отрисовки)
    const currentZoomedWidth = canvasWidth
      ? canvasWidth * zoom
      : imgElement.width * zoom;
    const currentZoomedHeight = canvasHeight
      ? canvasHeight * zoom
      : imgElement.height * zoom;

    const currentTranslateX = canvasWidth
      ? (canvasWidth - currentZoomedWidth) / 2
      : (imgElement.width - currentZoomedWidth) / 2;
    const currentTranslateY = canvasHeight
      ? (canvasHeight - currentZoomedHeight) / 2
      : (imgElement.height - currentZoomedHeight) / 2;

    // Находим координаты точки в "мировом пространстве" (до всех трансформаций)
    const worldX = (x - currentTranslateX - offsetX) / zoom;
    const worldY = (y - currentTranslateY - offsetY) / zoom;

    // Вычисляем новые значения translate для нового zoom'а
    const newZoomedWidth = canvasWidth
      ? canvasWidth * newZoom
      : imgElement.width * newZoom;
    const newZoomedHeight = canvasHeight
      ? canvasHeight * newZoom
      : imgElement.height * newZoom;

    const newTranslateX = canvasWidth
      ? (canvasWidth - newZoomedWidth) / 2
      : (imgElement.width - newZoomedWidth) / 2;
    const newTranslateY = canvasHeight
      ? (canvasHeight - newZoomedHeight) / 2
      : (imgElement.height - newZoomedHeight) / 2;

    // Вычисляем новые offset'ы так, чтобы точка (worldX, worldY) осталась под курсором
    const newOffsetX = x - worldX * newZoom - newTranslateX;
    const newOffsetY = y - worldY * newZoom - newTranslateY;

    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);
    setZoom(
      newZoom > MAX_ZOOM ? MAX_ZOOM : newZoom < MIN_ZOOM ? MIN_ZOOM : newZoom
    );
  };

  /**
   * Handles the pointer down event for initiating drawing or drag-and-drop panning.
   */
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === "draw") {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = (event.clientX - rect.left) * scaleX;
      const canvasY = (event.clientY - rect.top) * scaleY;

      // Преобразуем в мировые координаты
      const worldCoords = canvasToWorldCoords(canvasX, canvasY);
      setDrawStart(worldCoords);

      drawingPathsRef.current.push({
        path: [worldCoords],
        color: "erase", // Специальное значение для ластика
        width: currentDrawingWidthRef.current,
      });
    } else {
      setIsDragging(true);
      const initialX = event.clientX - (flipHorizontal ? -offsetX : offsetX);
      const initialY = event.clientY - (flipVertical ? -offsetY : offsetY);

      setPanStart({
        x: initialX,
        y: initialY,
      });
    }
  };

  /**
   * Handles the pointer move event for updating the drawing path or panning the image.
   */
  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === "draw" && drawStart) {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const rect = canvas?.getBoundingClientRect();

      if (!canvas || !context || !rect) return;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = (event.clientX - rect.left) * scaleX;
      const canvasY = (event.clientY - rect.top) * scaleY;

      // Преобразуем в мировые координаты
      const worldCoords = canvasToWorldCoords(canvasX, canvasY);
      const currentPath =
        drawingPathsRef.current[drawingPathsRef.current.length - 1].path;

      currentPath.push(worldCoords);
      setDrawStart(worldCoords);

      // Перерисовываем canvas
      applyFilter();
    }

    if (isDragging && panStart) {
      event.preventDefault();

      const offsetXDelta = event.clientX - panStart.x;
      const offsetYDelta = event.clientY - panStart.y;

      setOffsetX(flipHorizontal ? -offsetXDelta : offsetXDelta);
      setOffsetY(flipVertical ? -offsetYDelta : offsetYDelta);
    }
  };

  /**
   * Handles the pointer up event for ending the drawing or panning action.
   */
  const handlePointerUp = () => {
    setIsDragging(false);
    setDrawStart(null);
  };

  /**
   * Handles the wheel event for zooming in and out.
   */
  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (event.deltaY < 0) {
      handleZoomIn(event.clientX, event.clientY);
    } else {
      handleZoomOut(event.clientX, event.clientY); // Теперь передаем координаты курсора
    }
  };

  const backHistory = () => {
    drawingPathsRef.current = drawingPathsRef.current.slice(0, -1);
    applyFilter();
  };

  const setLineWidth = (width: number) => {
    currentDrawingWidthRef.current = width;
  };

  const handlePointerLeave = () => {
    setIsDragging(false);
    setDrawStart(null);
  };

  /**
   * Resets the filters and styles to its original state with the default settings.
   */
  const resetFilters = () => {
    setBrightness(defaultBrightness);
    setContrast(defaultContrast);
    setSaturate(defaultSaturate);
    setGrayscale(defaultGrayscale);
    setRotate(defaultRotate);
    setFlipHorizontal(defaultFlipHorizontal);
    setFlipVertical(defaultFlipVertical);
    setZoom(defaultZoom);
    setLineColor(defaultLineColor);
    setLineWidth(defaultLineWidth);
    drawingPathsRef.current = [];
    setOffsetX(0);
    setOffsetY(0);
    setPanStart(null);
    setIsDragging(false);
    setMode("pan");
    applyFilter();
  };

  // Expose the necessary state and handlers for external use.
  return {
    /** Reference to the canvas element. */
    canvasRef,
    /** Source URL of the image being edited. */
    imageSrc,
    /** Current brightness level. */
    brightness,
    /** Current contrast level. */
    contrast,
    /** Current saturation level. */
    saturate,
    /** Current grayscale level. */
    grayscale,
    /** Current rotation angle in degrees. */
    rotate,
    /** Flag indicating if the image is flipped horizontally. */
    flipHorizontal,
    /** Flag indicating if the image is flipped vertically. */
    flipVertical,
    /** Current zoom level. */
    zoom,
    /** Flag indicating if the image is being dragged. */
    isDragging,
    /** Starting coordinates for panning. */
    panStart,
    /** Current horizontal offset for panning. */
    offsetX,
    /** Current vertical offset for panning. */
    offsetY,
    /** Current mode ('pan' or 'draw') */
    mode,
    /** Current line color. */
    lineColor,
    /** Current line width. */
    /** Function to set the brightness level. */
    setBrightness,
    /** Function to set the contrast level. */
    setContrast,
    /** Function to set the saturation level. */
    setSaturate,
    /** Function to set the grayscale level. */
    setGrayscale,
    /** Function to set the rotation angle. */
    setRotate,
    /** Function to set the horizontal flip state. */
    setFlipHorizontal,
    /** Function to set the vertical flip state. */
    setFlipVertical,
    /** Function to set the zoom level. */
    setZoom,
    /** Function to set the dragging state. */
    setIsDragging,
    /** Function to set the starting coordinates for panning. */
    setPanStart,
    /** Function to set the horizontal offset for panning. */
    setOffsetX,
    /** Function to set the vertical offset for panning. */
    setOffsetY,
    /** Function to zoom in. */
    handleZoomIn,
    /** Function to zoom out. */
    handleZoomOut,
    /** Function to handle pointer down events. */
    handlePointerDown,
    /** Function to handle pointer up events. */
    handlePointerUp,
    /** Function to handle pointer move events. */
    handlePointerMove,
    /** Function to handle wheel events for zooming. */
    handleWheel,
    /** Function to download the edited image. */
    downloadImage,
    /** Function to generate the edited image file. */
    generateEditedFile,
    /** Function to reset filters and styles to default. */
    resetFilters,
    /** Function to apply filters and transformations. */
    applyFilter,
    /** Function to set the mode. */
    setMode,
    /** Function to set the line color. */
    setLineColor,
    /** Function to set the line width. */
    setLineWidth,
    backHistory,
    /** Function to handle pointer leave events. */
    handlePointerLeave,
  };
};
