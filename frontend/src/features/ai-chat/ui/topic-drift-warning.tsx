import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopicDriftWarning({
  message,
  onDismiss,
  onNewChat,
}: {
  message: string;
  onDismiss: () => void;
  onNewChat: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg",
        "bg-brand-accent-soft border border-brand-accent-text/10 px-3 py-2"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="size-4 text-brand-accent-text shrink-0" />
        <p className="text-sm text-brand-accent-text truncate">{message}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onNewChat}
          className="text-sm font-medium text-brand-accent-text underline cursor-pointer"
        >
          Новый чат
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Закрыть"
          className="text-brand-accent-text cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
