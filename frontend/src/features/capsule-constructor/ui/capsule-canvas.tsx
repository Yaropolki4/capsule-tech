import type { ReactNode, RefObject } from "react";
import {
  CAPSULE_CANVAS_ASPECT_RATIO,
  CAPSULE_ITEM_BASE_SIZE_RATIO,
} from "@/shared/constants/capsule";
import { cn } from "@/lib/utils";

export type CapsuleCanvasItem = {
  clothesId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CapsuleCanvas<T extends CapsuleCanvasItem>({
  items,
  renderItem,
  canvasRef,
  className,
  onCanvasClick,
  onDropClothes,
  emptyState,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  canvasRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  onCanvasClick?: () => void;
  onDropClothes?: (clothesId: string, position: { x: number; y: number }) => void;
  emptyState?: ReactNode;
}) {
  return (
    <div
      ref={canvasRef}
      onClick={onCanvasClick}
      onDragOver={
        onDropClothes ? (event) => event.preventDefault() : undefined
      }
      onDrop={
        onDropClothes
          ? (event) => {
              event.preventDefault();

              const clothesId = event.dataTransfer.getData("text/plain");

              if (!clothesId) {
                return;
              }

              const rect = event.currentTarget.getBoundingClientRect();

              onDropClothes(clothesId, {
                x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
                y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
              });
            }
          : undefined
      }
      data-capsule-canvas
      className={cn(
        "relative w-full bg-muted rounded-[var(--radius-container)] overflow-hidden select-none",
        className
      )}
      style={{ aspectRatio: CAPSULE_CANVAS_ASPECT_RATIO }}
    >
      {items.length === 0 && emptyState}
      {items.map((item) => (
        <div
          key={item.clothesId}
          className="absolute top-0 left-0 aspect-square"
          style={{
            left: `${item.x * 100}%`,
            top: `${item.y * 100}%`,
            width: `${CAPSULE_ITEM_BASE_SIZE_RATIO * 100}%`,
            zIndex: item.zIndex,
            transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
          }}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
