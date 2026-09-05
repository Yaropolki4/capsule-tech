"use client";

import { useState } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/ui/button";
import { cn } from "@/lib/utils";

export function ChatInputBar({
  onSend,
  disabled,
  size = "default",
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  size?: "default" | "large";
}) {
  const [text, setText] = useState("");
  const isLarge = size === "large";

  const handleSend = () => {
    if (!text.trim() || disabled) return;

    onSend(text);
    setText("");
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full bg-background border border-border transition-all duration-200",
        isLarge ? "p-3 pl-6" : "p-2 pl-4"
      )}
    >
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleSend();
        }}
        disabled={disabled}
        placeholder="Опиши вещь, повод, бюджет…"
        className={cn(
          "flex-1 bg-transparent outline-none disabled:opacity-50",
          isLarge ? "text-base py-1.5" : "text-sm"
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => toast("Прикрепление файлов скоро появится")}
      >
        <Plus />
      </Button>
      <Button
        type="button"
        size={isLarge ? "iconBig" : "icon"}
        disabled={disabled}
        onClick={handleSend}
      >
        <ArrowUp />
      </Button>
    </div>
  );
}
