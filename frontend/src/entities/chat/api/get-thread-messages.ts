import { httpTransport } from "@/shared/api/http-transport";
import { getThreadMessagesResponseDtoSchema } from "@capsule/common";

export const getChatThreadMessages = async (threadId: string) => {
  return getThreadMessagesResponseDtoSchema.parse(
    await httpTransport.get(`/chat/threads/${threadId}/messages`, {
      params: { withAuth: true },
    })
  );
};
