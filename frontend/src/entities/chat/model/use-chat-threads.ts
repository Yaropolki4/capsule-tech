import { useQuery } from "@tanstack/react-query";
import { listChatThreads } from "../api/list-threads";

export const CHAT_THREADS_QUERY_KEY = ["chat-threads"];

export function useChatThreads(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: CHAT_THREADS_QUERY_KEY,
    queryFn: listChatThreads,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
  });
}
