import { Button } from "@/shared/ui/ui/button";
import { TooltipLight } from "@/shared/ui/ui/tooltip";
import { ZoomOut as ZoomOutIcon } from "lucide-react";

export function ZoomOut({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <TooltipLight text="Уменьшить">
      <Button
        onClick={onClick}
        variant="secondary"
        size="icon"
        disabled={disabled}
      >
        <ZoomOutIcon />
      </Button>
    </TooltipLight>
  );
}
