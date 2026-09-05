"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCanvasActions } from "@/features/capsule-constructor";
import { routes } from "@/shared/constants/routes";
import { createChatThread } from "@/entities/chat";
import { useIsDesktop } from "@/shared/lib/use-is-desktop";
import { cn } from "@/lib/utils";
import {
  ChatHeader,
  MessageThread,
  SuggestionChipRow,
  ChatInputBar,
  TopicDriftWarning,
  ThreadDrawer,
  ThreadSidebar,
  useAiChat,
} from "@/features/ai-chat";

export function AiStylist({ threadId }: { threadId: string }) {
  const router = useRouter();
  const { addItem } = useCanvasActions();
  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { messages, isSending, sendMessage, driftWarning, dismissDriftWarning } =
    useAiChat(threadId);

  const isEmpty = messages.length === 0;

  const handleAddToCapsule = (ids: string[]) => {
    ids.forEach((id) => addItem(id));
    router.push(routes.newCapsule);
  };

  const goToNewThread = async () => {
    const thread = await createChatThread();

    setDrawerOpen(false);
    router.push(routes.getAiStylistThread(thread.id));
  };

  const selectThread = (id: string) => {
    setDrawerOpen(false);
    router.push(routes.getAiStylistThread(id));
  };

  return (
    <div className="w-full h-full overflow-hidden flex">
      <div className="flex-1 min-w-0 h-full flex justify-center p-4">
        <div className="w-full h-full max-w-2xl flex flex-col min-h-0">
          <ChatHeader
            onOpenThreads={() => setDrawerOpen(true)}
            onNewChat={goToNewThread}
          />

          <div className="flex-1 min-h-0 flex flex-col">
            {!isEmpty && (
              <MessageThread
                messages={messages}
                onAddToCapsule={handleAddToCapsule}
                onSelectConcept={sendMessage}
              />
            )}

            <div
              className={cn(
                "flex flex-col gap-3",
                isEmpty ? "flex-1 justify-center" : "pt-2"
              )}
            >
              {driftWarning && (
                <TopicDriftWarning
                  message={driftWarning}
                  onDismiss={dismissDriftWarning}
                  onNewChat={goToNewThread}
                />
              )}
              <SuggestionChipRow onSelect={sendMessage} disabled={isSending} />
              <ChatInputBar
                onSend={sendMessage}
                disabled={isSending}
                size={isEmpty ? "large" : "default"}
              />
            </div>
          </div>
        </div>
      </div>

      {isDesktop && (
        <ThreadSidebar
          activeThreadId={threadId}
          onSelectThread={selectThread}
          onCreateThread={goToNewThread}
        />
      )}

      <ThreadDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        activeThreadId={threadId}
        onSelectThread={selectThread}
        onCreateThread={goToNewThread}
      />
    </div>
  );
}
