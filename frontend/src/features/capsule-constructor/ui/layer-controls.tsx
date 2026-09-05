"use client";

import { ArrowDownToLine, ArrowUpToLine, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/ui/button";
import {
  useCanvasActions,
  useSelectedClothesId,
} from "../model/canvas.store";

export function LayerControls() {
  const selectedClothesId = useSelectedClothesId();
  const { bringToFront, sendToBack, removeItem } = useCanvasActions();

  if (!selectedClothesId) {
    return null;
  }

  return (
    <div className="flex gap-2 p-1.5 rounded-full bg-card border border-border shadow-elevated">
      <Button
        variant="outline"
        size="s"
        onClick={() => bringToFront(selectedClothesId)}
      >
        <ArrowUpToLine size={16} />
        На передний план
      </Button>
      <Button
        variant="outline"
        size="s"
        onClick={() => sendToBack(selectedClothesId)}
      >
        <ArrowDownToLine size={16} />
        На задний план
      </Button>
      <Button
        variant="outline"
        size="s"
        onClick={() => removeItem(selectedClothesId)}
      >
        <Trash2 size={16} />
        Удалить
      </Button>
    </div>
  );
}
