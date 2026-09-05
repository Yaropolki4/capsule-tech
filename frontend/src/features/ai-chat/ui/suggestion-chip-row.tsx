import { cn } from "@/lib/utils";

const QUICK_REPLIES = [
  "Что надеть на работу?",
  "Подбери верх к джинсам",
  "Капсула на 5 дней",
];

export function SuggestionChipRow({
  onSelect,
  disabled,
}: {
  onSelect: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {QUICK_REPLIES.map((reply) => (
        <button
          key={reply}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          className={cn(
            "rounded-full bg-secondary text-muted-foreground text-xs px-3 py-2",
            "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
