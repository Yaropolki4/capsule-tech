import type { ChatThreadSummaryDto } from "@/entities/chat";
import { cn } from "@/lib/utils";

export function ThreadListItem({
  thread,
  active,
  onClick,
}: {
  thread: ChatThreadSummaryDto;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-[var(--radius-card)] px-3 py-2.5 text-sm truncate cursor-pointer",
        "transition-colors",
        active
          ? "bg-brand-accent-soft text-brand-accent-text font-medium"
          : "hover:bg-secondary text-foreground"
      )}
    >
      {thread.title ?? "Новый чат"}
    </button>
  );
}
