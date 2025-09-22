import { Button } from "@/shared/ui/ui/button";
import { TooltipLight } from "@/shared/ui/ui/tooltip";
import { ZoomIn as ZoomInIcon } from "lucide-react";

export function ZoomIn({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <TooltipLight text="Увеличить">
      <Button
        onClick={onClick}
        variant="secondary"
        size="icon"
        disabled={disabled}
      >
        <ZoomInIcon />
      </Button>
    </TooltipLight>
  );
}
