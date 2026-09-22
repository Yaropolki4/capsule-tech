import { Button } from "@/shared/ui/ui/button";
import { Input } from "@/shared/ui/ui/input";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePhotoConsent } from "@/shared/lib/photo-consent/use-photo-consent";

export function CreateClothesFormImageStep({
  onImageChange,
}: {
  onImageChange: (image: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { withConsent, consentDialog } = usePhotoConsent();

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col items-center justify-center gap-3",
        "rounded-[var(--radius-card)] border-2 border-dashed border-border transition-colors",
        isDragOver && "border-primary bg-brand-accent-soft"
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files?.[0] ?? null;
        withConsent(() => onImageChange(file));
      }}
    >
      <span className="text-sm text-muted-foreground">
        Перетащи фото или
      </span>
      <Button
        onClick={() => withConsent(() => inputRef.current?.click())}
        variant="outline"
      >
        Выбрать изображение
      </Button>
      <span className="font-mono text-xs text-muted-foreground">
        jpg, png, heic · до 10 мб
      </span>
      <Input
        accept="image/png,image/jpeg,image/jpg,image/heic,image/heif"
        ref={inputRef}
        onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
        type="file"
        className="w-40 hidden"
        id="file"
      />
      {consentDialog}
    </div>
  );
}
