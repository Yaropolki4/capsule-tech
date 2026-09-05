import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { PlacedCapsuleItem } from "@/entities/capsules";

export type CanvasStep = "edit" | "result";

interface CanvasStore {
  items: Record<string, PlacedCapsuleItem>;
  selectedClothesId: string | null;
  step: CanvasStep;
  styledImageUrl: string | null;
  addItem: (clothesId: string) => void;
  removeItem: (clothesId: string) => void;
  updateTransform: (
    clothesId: string,
    patch: Partial<Pick<PlacedCapsuleItem, "x" | "y" | "rotation" | "scale">>
  ) => void;
  bringToFront: (clothesId: string) => void;
  sendToBack: (clothesId: string) => void;
  selectItem: (clothesId: string | null) => void;
  setStyledImage: (url: string) => void;
  backToEdit: () => void;
  reset: () => void;
}

const DEFAULT_POSITION = 0.5;
const DEFAULT_ROTATION = 0;
const DEFAULT_SCALE = 1;

export const canvasStore = create<CanvasStore>()(
  immer((set) => ({
    items: {},
    selectedClothesId: null,
    step: "edit",
    styledImageUrl: null,
    addItem: (clothesId) =>
      set((state) => {
        if (state.items[clothesId]) {
          return;
        }

        state.items[clothesId] = {
          clothesId,
          x: DEFAULT_POSITION,
          y: DEFAULT_POSITION,
          rotation: DEFAULT_ROTATION,
          scale: DEFAULT_SCALE,
          zIndex: Object.keys(state.items).length,
        };
        state.selectedClothesId = clothesId;
      }),
    removeItem: (clothesId) =>
      set((state) => {
        delete state.items[clothesId];

        if (state.selectedClothesId === clothesId) {
          state.selectedClothesId = null;
        }
      }),
    updateTransform: (clothesId, patch) =>
      set((state) => {
        const item = state.items[clothesId];

        if (!item) {
          return;
        }

        Object.assign(item, patch);
      }),
    bringToFront: (clothesId) =>
      set((state) => {
        const item = state.items[clothesId];

        if (!item) {
          return;
        }

        const maxZIndex = Math.max(
          0,
          ...Object.values(state.items).map((i) => i.zIndex)
        );

        item.zIndex = maxZIndex + 1;
      }),
    sendToBack: (clothesId) =>
      set((state) => {
        const item = state.items[clothesId];

        if (!item) {
          return;
        }

        const minZIndex = Math.min(
          0,
          ...Object.values(state.items).map((i) => i.zIndex)
        );

        item.zIndex = minZIndex - 1;
      }),
    selectItem: (clothesId) =>
      set((state) => {
        state.selectedClothesId = clothesId;
      }),
    setStyledImage: (url) =>
      set((state) => {
        state.styledImageUrl = url;
        state.step = "result";
      }),
    backToEdit: () =>
      set((state) => {
        state.styledImageUrl = null;
        state.step = "edit";
      }),
    reset: () =>
      set((state) => {
        state.items = {};
        state.selectedClothesId = null;
        state.styledImageUrl = null;
        state.step = "edit";
      }),
  }))
);

export function useCanvasItems() {
  return canvasStore((state) => state.items);
}

export function useSelectedClothesId() {
  return canvasStore((state) => state.selectedClothesId);
}

export function useCanvasStep() {
  return canvasStore((state) => state.step);
}

export function useStyledImageUrl() {
  return canvasStore((state) => state.styledImageUrl);
}

export function useCanvasActions() {
  return {
    addItem: canvasStore((state) => state.addItem),
    removeItem: canvasStore((state) => state.removeItem),
    updateTransform: canvasStore((state) => state.updateTransform),
    bringToFront: canvasStore((state) => state.bringToFront),
    sendToBack: canvasStore((state) => state.sendToBack),
    selectItem: canvasStore((state) => state.selectItem),
    setStyledImage: canvasStore((state) => state.setStyledImage),
    backToEdit: canvasStore((state) => state.backToEdit),
    reset: canvasStore((state) => state.reset),
  };
}
