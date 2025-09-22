import { Button } from "@/shared/ui/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/shared/ui/ui/dropdown-menu";
import { TooltipLight } from "@/shared/ui/ui/tooltip";
import { CircleDot, Eraser as EraserIcon, Undo2 } from "lucide-react";

const WIDTH_OPTIONS = [1, 2, 3, 5, 8, 10, 15, 20, 30, 50];

export function Eraser({
  onEraserClick,
  onUndoClick,
  onLineWidthChange,
  disabled,
  mainButtonDisabled,
  isErasing,
}: {
  onEraserClick: () => void;
  onUndoClick: () => void;
  onLineWidthChange: (width: number) => void;
  disabled: boolean;
  mainButtonDisabled: boolean;
  isErasing: boolean;
}) {
  return (
    <div className="flex gap-2 ml-4">
      <TooltipLight
        text={
          !mainButtonDisabled
            ? "Ластик"
            : "Чтобы использовать ластик, сначала нужно удалить фон"
        }
      >
        <Button
          disabled={mainButtonDisabled && disabled}
          onClick={onEraserClick}
          variant={isErasing ? "default" : "secondary"}
          size="icon"
        >
          <EraserIcon />
        </Button>
      </TooltipLight>
      <TooltipLight text={"Назад"}>
        <Button
          onClick={onUndoClick}
          variant="secondary"
          size="icon"
          disabled={mainButtonDisabled || disabled}
        >
          <Undo2 />
        </Button>
      </TooltipLight>
      <DropdownMenu>
        <TooltipLight text={"Размер ластика"}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              disabled={mainButtonDisabled || disabled}
            >
              <CircleDot />
            </Button>
          </DropdownMenuTrigger>
        </TooltipLight>
        <DropdownMenuContent>
          <DropdownMenuLabel>Размер ластика</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {WIDTH_OPTIONS.map((width) => (
            <DropdownMenuItem
              onClick={() => onLineWidthChange(width)}
              key={width}
            >
              {width}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
