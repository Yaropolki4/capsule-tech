"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CatalogSearchSourceDto, ChatStreamToolName } from "@capsule/common";
import {
  getChatThreadMessages,
  streamChatMessage,
  CHAT_THREADS_QUERY_KEY,
  type ChatMessage as ChatMessageDto,
} from "@/entities/chat";
import { TOKEN_BALANCES_QUERY_KEY } from "@/entities/billing";
import { queryClient } from "@/shared/query-client";
import { routes } from "@/shared/constants/routes";

export type ToolActivity = {
  tool: ChatStreamToolName;
  input?: Record<string, unknown>;
  done: boolean;
  source?: CatalogSearchSourceDto;
};

export type ChatMessage = ChatMessageDto & {
  isStreaming?: boolean;
  toolActivity?: ToolActivity[];
};

const STREAMING_MESSAGE_ID = "streaming";

// get_user_wardrobe — незаметная для пользователя сверка с гардеробом (см.
// системный промпт агента), её статус в UI не показываем, только видимые
// пользователю шаги (поиск на Wildberries, показ вещей из гардероба).
const HIDDEN_ACTIVITY_TOOLS: ChatStreamToolName[] = ["get_user_wardrobe"];

export function useAiChat(threadId: string) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [driftWarning, setDriftWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setMessages([]);
    setDriftWarning(null);

    async function load() {
      try {
        const history = await getChatThreadMessages(threadId);

        if (!cancelled) setMessages(history);
      } catch {
        if (!cancelled) {
          toast.error("Чат не найден");
          router.replace(routes.aiStylist);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [threadId, router]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();

    // Не даём отправить следующее сообщение, пока не завершился текущий
    // ход — иначе в списке окажутся два сообщения с одним и тем же
    // временным id черновика и рендер начинает вести себя непредсказуемо.
    if (!trimmed || isSending) return;

    const optimisticId = `pending-${crypto.randomUUID()}`;

    setMessages((prev) => [
      ...prev,
      { id: optimisticId, role: "user", text: trimmed },
      {
        id: STREAMING_MESSAGE_ID,
        role: "assistant",
        text: "",
        isStreaming: true,
        toolActivity: [],
      },
    ]);
    setIsSending(true);

    try {
      for await (const event of streamChatMessage(threadId, trimmed)) {
        switch (event.type) {
          case "user_message":
            setMessages((prev) =>
              prev.map((message) =>
                message.id === optimisticId ? event.message : message
              )
            );
            break;

          case "tool_start":
            if (HIDDEN_ACTIVITY_TOOLS.includes(event.tool)) break;

            setMessages((prev) =>
              prev.map((message) =>
                message.id === STREAMING_MESSAGE_ID
                  ? {
                      ...message,
                      toolActivity: [
                        ...(message.toolActivity ?? []),
                        { tool: event.tool, input: event.input, done: false },
                      ],
                    }
                  : message
              )
            );
            break;

          case "tool_end":
            if (HIDDEN_ACTIVITY_TOOLS.includes(event.tool)) break;

            // Не убираем завершённый статус из списка, а помечаем done —
            // иначе он мелькает и пропадает быстрее, чем пользователь
            // успевает его заметить. Полностью список сменится, когда
            // придёт финальный текст ответа.
            setMessages((prev) =>
              prev.map((message) => {
                if (message.id !== STREAMING_MESSAGE_ID) return message;

                const activity = message.toolActivity ?? [];
                const index = activity.findIndex(
                  (item) => item.tool === event.tool && !item.done
                );

                if (index === -1) return message;

                const next = [...activity];

                next[index] = { ...next[index], done: true, source: event.source };

                return { ...message, toolActivity: next };
              })
            );
            break;

          case "assistant_message":
            setMessages((prev) =>
              prev.map((message) =>
                message.id === STREAMING_MESSAGE_ID ? event.message : message
              )
            );
            break;

          case "drift_warning":
            // Перезаписываем безусловно (не мержим/не дедуплицируем) — так
            // предупреждение может появиться повторно за тред, даже если
            // прошлое уже было закрыто пользователем.
            setDriftWarning(event.message);
            break;

          case "error":
            toast.error(event.message);
            setMessages((prev) =>
              prev.filter((message) => message.id !== STREAMING_MESSAGE_ID)
            );
            break;
        }
      }
    } catch {
      toast.error("Не получилось отправить сообщение, попробуй ещё раз");
      setMessages((prev) =>
        prev.filter(
          (message) =>
            message.id !== optimisticId && message.id !== STREAMING_MESSAGE_ID
        )
      );
    } finally {
      setIsSending(false);
      await queryClient.invalidateQueries({
        queryKey: TOKEN_BALANCES_QUERY_KEY,
      });
      // Подхватывает и авто-сгенерированный title (после первого сообщения),
      // и свежий updatedAt для сортировки списка тредов.
      await queryClient.invalidateQueries({
        queryKey: CHAT_THREADS_QUERY_KEY,
      });
    }
  };

  const dismissDriftWarning = () => setDriftWarning(null);

  return { messages, isSending, sendMessage, driftWarning, dismissDriftWarning };
}
