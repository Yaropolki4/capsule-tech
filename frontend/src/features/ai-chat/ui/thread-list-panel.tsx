import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/ui/button";
import { useChatThreads } from "@/entities/chat";
import { ThreadListItem } from "./thread-list-item";

const THREADS_POLL_INTERVAL_MS = 4000;

// Общий контент для мобильного дровера и для постоянной десктопной колонки —
// сам по себе не решает, показывать ли себя: поллинг тредов идёт, пока этот
// компонент смонтирован (Radix Dialog размонтирует контент дровера при
// закрытии сам, отдельный enabled-флаг для этого не нужен).
export function ThreadListPanel({
  activeThreadId,
  onSelectThread,
  onCreateThread,
}: {
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
}) {
  const { data } = useChatThreads({
    refetchInterval: THREADS_POLL_INTERVAL_MS,
  });

  return (
    <>
      <div className="pb-4 border-b border-border">
        <Button
          type="button"
          size="m"
          fullWidth
          onClick={onCreateThread}
          className="gap-2"
        >
          <Plus className="size-4" />
          Новый чат
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 -mx-1 px-1">
        {data?.items.map((thread) => (
          <ThreadListItem
            key={thread.id}
            thread={thread}
            active={thread.id === activeThreadId}
            onClick={() => onSelectThread(thread.id)}
          />
        ))}
      </div>
    </>
  );
}
