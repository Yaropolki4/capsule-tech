import { Button } from "@/shared/ui/ui/button";
import { TooltipLight } from "@/shared/ui/ui/tooltip";
import { Scissors } from "lucide-react";

export function CutBackground({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <TooltipLight text="Удалить фон">
      <Button
        disabled={disabled}
        onClick={onClick}
        variant="secondary"
        size="icon"
      >
        <Scissors />
      </Button>
    </TooltipLight>
  );
}
