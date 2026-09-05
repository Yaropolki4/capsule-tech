import { ThreadListPanel } from "./thread-list-panel";

// Постоянная колонка справа для больших экранов — та же начинка, что и в
// мобильном ThreadDrawer, но без Sheet/оверлея: список тредов виден без
// открытия чего-либо. Рендерится только при isDesktop (см. useIsDesktop),
// чтобы не гонять поллинг тредов вхолостую на мобильных.
export function ThreadSidebar({
  activeThreadId,
  onSelectThread,
  onCreateThread,
}: {
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
}) {
  return (
    <div className="h-full w-72 shrink-0 flex flex-col gap-4 border-l border-border pl-4 pr-4 py-4">
      <span className="font-semibold text-sm px-1">Чаты</span>
      <ThreadListPanel
        activeThreadId={activeThreadId}
        onSelectThread={onSelectThread}
        onCreateThread={onCreateThread}
      />
    </div>
  );
}
