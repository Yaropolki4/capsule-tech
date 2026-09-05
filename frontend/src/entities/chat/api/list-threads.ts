import { httpTransport } from "@/shared/api/http-transport";
import { getThreadsResponseDtoSchema } from "@capsule/common";

export const listChatThreads = async () => {
  return getThreadsResponseDtoSchema.parse(
    await httpTransport.get("/chat/threads", {
      params: { withAuth: true },
    })
  );
};
