"use client";

import { useDrag } from "@use-gesture/react";
import Image from "next/image";
import type { RefObject } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CAPSULE_ITEM_MAX_SCALE,
  CAPSULE_ITEM_MIN_SCALE,
} from "@/shared/constants/capsule";
import {
  useCanvasActions,
  useSelectedClothesId,
} from "../model/canvas.store";
import type { PlacedCapsuleItem } from "@/entities/capsules";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function withStoppedPropagation<T extends { onPointerDown?: (event: React.PointerEvent) => void }>(
  bindProps: T
): T {
  return {
    ...bindProps,
    onPointerDown: (event: React.PointerEvent) => {
      event.stopPropagation();
      bindProps.onPointerDown?.(event);
    },
  };
}

export function PlacedItem({
  item,
  imageUrl,
  canvasRef,
}: {
  item: PlacedCapsuleItem;
  imageUrl: string;
  canvasRef: RefObject<HTMLDivElement | null>;
}) {
  const { updateTransform, removeItem, selectItem } = useCanvasActions();
  const selectedClothesId = useSelectedClothesId();
  const isSelected = selectedClothesId === item.clothesId;

  const bindDrag = useDrag(
    ({ first, movement: [mx, my], memo }) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return memo;
      }

      const rect = canvas.getBoundingClientRect();
      const base = first ? { x: item.x, y: item.y } : memo;

      updateTransform(item.clothesId, {
        x: clamp(base.x + mx / rect.width, 0, 1),
        y: clamp(base.y + my / rect.height, 0, 1),
      });

      return base;
    },
    { pointer: { touch: true } }
  );

  const bindRotateHandle = useDrag(
    ({ xy: [px, py] }) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + item.x * rect.width;
      const centerY = rect.top + item.y * rect.height;
      const angle = (Math.atan2(py - centerY, px - centerX) * 180) / Math.PI;

      updateTransform(item.clothesId, { rotation: angle + 90 });
    },
    { pointer: { touch: true } }
  );

  const bindScaleHandle = useDrag(
    ({ first, xy: [px, py], memo }) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return memo;
      }

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + item.x * rect.width;
      const centerY = rect.top + item.y * rect.height;
      const distance = Math.hypot(px - centerX, py - centerY);

      const base = first
        ? { distance, scale: item.scale }
        : (memo as { distance: number; scale: number });

      const scale = clamp(
        (distance / base.distance) * base.scale,
        CAPSULE_ITEM_MIN_SCALE,
        CAPSULE_ITEM_MAX_SCALE
      );

      updateTransform(item.clothesId, { scale });

      return base;
    },
    { pointer: { touch: true } }
  );

  return (
    <div
      {...bindDrag()}
      onClick={(event) => {
        event.stopPropagation();
        selectItem(item.clothesId);
      }}
      className={cn(
        "relative w-full h-full cursor-grab touch-none active:cursor-grabbing rounded-lg",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <Image
        src={imageUrl}
        alt=""
        fill
        className="object-contain pointer-events-none"
        draggable={false}
      />
      {isSelected && (
        <>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              removeItem(item.clothesId);
            }}
            className="absolute -top-3 -right-3 bg-destructive text-white rounded-full p-1 cursor-pointer"
          >
            <X size={12} />
          </button>
          <div
            {...withStoppedPropagation(bindRotateHandle())}
            data-rotate-handle
            className="absolute -top-8 left-1/2 -translate-x-1/2 size-4 rounded-full bg-primary cursor-grab touch-none"
          />
          <div
            {...withStoppedPropagation(bindScaleHandle())}
            data-scale-handle
            className="absolute -bottom-2 -right-2 size-4 rounded-full bg-primary cursor-nwse-resize touch-none"
          />
        </>
      )}
    </div>
  );
}
