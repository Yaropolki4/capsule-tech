"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";
import { Button } from "@/shared/ui/ui/button";
import { MagicOverlay } from "@/shared/ui/magic-overlay";
import { stylizeCapsule } from "@/entities/capsules";
import {
  describeInsufficientTokensError,
  TOKEN_BALANCES_QUERY_KEY,
} from "@/entities/billing";
import { queryClient } from "@/shared/query-client";
import { useCanvasActions } from "../model/canvas.store";

const STYLIZE_PHRASES = [
  "Оформляем образ...",
  "Подбираем стиль...",
  "Рисуем капсулу...",
  "Почти готово...",
];

export function StylizeButton({
  itemImageUrls,
  disabled,
}: {
  itemImageUrls: string[];
  disabled?: boolean;
}) {
  const { setStyledImage, selectItem } = useCanvasActions();
  const [isStylizing, setIsStylizing] = useState(false);

  const handleStylize = async () => {
    if (itemImageUrls.length === 0) {
      return;
    }

    selectItem(null);
    setIsStylizing(true);

    try {
      const styledImageUrl = await stylizeCapsule(itemImageUrls);

      setStyledImage(styledImageUrl);
      await queryClient.invalidateQueries({
        queryKey: TOKEN_BALANCES_QUERY_KEY,
      });
    } catch (error) {
      toast.error(
        describeInsufficientTokensError(error) ??
          "Не удалось оформить капсулу"
      );
    } finally {
      setIsStylizing(false);
    }
  };

  return (
    <>
      <MagicOverlay
        open={isStylizing}
        title="Оформляем капсулу"
        phrases={STYLIZE_PHRASES}
      />
      <Button
        onClick={handleStylize}
        disabled={disabled || isStylizing}
        variant="destructive"
        fullWidth
        size="l"
      >
        <Wand2 />
        {isStylizing ? "Оформляем..." : "Оформить"}
      </Button>
    </>
  );
}
