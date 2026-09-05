import { httpTransport } from "@/shared/api/http-transport";
import { createThreadResponseDtoSchema } from "@capsule/common";

export const createChatThread = async () => {
  return createThreadResponseDtoSchema.parse(
    await httpTransport.post("/chat/threads", {
      params: { withAuth: true },
    })
  );
};
