import { PanelRight, Plus } from "lucide-react";
import { Eyebrow } from "@/shared/ui/ui/eyebrow";
import { Button } from "@/shared/ui/ui/button";
import { useTokenBalances } from "@/entities/billing";
import { useCurrentUser } from "@/entities/user-session";
import { AssistantAvatar } from "./assistant-avatar";

export function ChatHeader({
  onOpenThreads,
  onNewChat,
}: {
  onOpenThreads: () => void;
  onNewChat: () => void;
}) {
  const [currentUser] = useCurrentUser();
  const { data: balances } = useTokenBalances(Boolean(currentUser));
  const chatRemaining = Math.max(0, balances?.chat.remaining ?? 0);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
      <div className="flex items-center gap-3">
        <AssistantAvatar className="size-10" />
        <div className="flex flex-col">
          <span className="font-semibold">AI-стилист</span>
          <Eyebrow className="text-brand-accent-text normal-case tracking-normal">
            онлайн · видит твой гардероб
          </Eyebrow>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full bg-brand-accent-soft text-brand-accent-text text-xs font-mono px-3 py-2">
          {chatRemaining} токенов чата осталось
        </span>
        <Button
          type="button"
          variant="secondary"
          size="s"
          onClick={onNewChat}
          className="gap-1.5 lg:hidden"
        >
          <Plus className="size-4" />
          Новый чат
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={onOpenThreads}
          aria-label="История чатов"
          className="lg:hidden"
        >
          <PanelRight />
        </Button>
      </div>
    </div>
  );
}
