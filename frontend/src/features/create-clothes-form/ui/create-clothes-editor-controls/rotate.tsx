import { Button } from "@/shared/ui/ui/button";
import { TooltipLight } from "@/shared/ui/ui/tooltip";
import { RotateCw as RotateIcon } from "lucide-react";

export function Rotate({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <TooltipLight text="Повернуть">
      <Button
        onClick={onClick}
        variant="secondary"
        size="icon"
        disabled={disabled}
      >
        <RotateIcon />
      </Button>
    </TooltipLight>
  );
}
