import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/ui/sheet";
import { ThreadListPanel } from "./thread-list-panel";

export function ThreadDrawer({
  open,
  onOpenChange,
  activeThreadId,
  onSelectThread,
  onCreateThread,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Чаты</SheetTitle>
        </SheetHeader>
        <ThreadListPanel
          activeThreadId={activeThreadId}
          onSelectThread={onSelectThread}
          onCreateThread={onCreateThread}
        />
      </SheetContent>
    </Sheet>
  );
}
