import { httpTransport } from "@/shared/api/http-transport";
import type { SubscribeDtoRequest } from "@capsule/common";

function serializeSubscribeDtoRequest(userId: string): SubscribeDtoRequest {
  return {
    id: userId,
  };
}

export const subscribe = async (userId: string): Promise<void> => {
  await httpTransport.post(`/subscription/subscribe`, {
    json: serializeSubscribeDtoRequest(userId),
    params: {
      withAuth: true,
    },
  });
};
