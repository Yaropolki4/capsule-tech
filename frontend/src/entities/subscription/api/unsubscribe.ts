import { httpTransport } from "@/shared/api/http-transport";
import type { UnsubscribeDtoRequest } from "@capsule/common";

function serializeUnsubscribeDtoRequest(userId: string): UnsubscribeDtoRequest {
  return {
    id: userId,
  };
}

export const unsubscribe = async (userId: string): Promise<void> => {
  await httpTransport.post(`/subscription/unsubscribe`, {
    json: serializeUnsubscribeDtoRequest(userId),
    params: {
      withAuth: true,
    },
  });
};
