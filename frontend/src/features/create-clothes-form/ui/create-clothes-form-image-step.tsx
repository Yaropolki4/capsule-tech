import { Button } from "@/shared/ui/ui/button";
import { Input } from "@/shared/ui/ui/input";
import { useRef } from "react";

export function CreateClothesFormImageStep({
  onImageChange,
}: {
  onImageChange: (image: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="w-full h-full flex items-center justify-center">
        <Button onClick={() => inputRef.current?.click()} variant="outline">
          Выбрать изображение
        </Button>
        <Input
          accept="image/png,image/jpeg,image/jpg"
          ref={inputRef}
          onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
          type="file"
          className="w-40 hidden"
          id="file"
        />
      </div>
    </>
  );
}
