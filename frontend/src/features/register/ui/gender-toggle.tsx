import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/ui/button";

export type GenderValue = "MALE" | "FEMALE";

const GENDER_OPTIONS: { value: GenderValue; label: string }[] = [
  { value: "FEMALE", label: "Женский" },
  { value: "MALE", label: "Мужской" },
];

export function GenderToggle({
  value,
  onChange,
  error,
}: {
  value: Maybe<GenderValue>;
  onChange: (value: GenderValue) => void;
  error?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Пол"
      className={cn(
        "bg-background border-input flex gap-1 rounded-xl border p-1",
        error && "border-destructive"
      )}
    >
      {GENDER_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          variant={value === option.value ? "default" : "ghost"}
          size="m"
          className="min-w-0 flex-1 shrink"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
