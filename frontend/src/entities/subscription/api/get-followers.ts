import { httpTransport } from "@/shared/api/http-transport";
import type { GetSubscribersDtoRequest } from "@capsule/common";
import { getSubscribersResponseDtoSchema } from "@capsule/common";

function serializeGetSubscribersDtoRequest(
  userId: string
): GetSubscribersDtoRequest {
  return {
    id: userId,
  };
}

function deserializeGetSubscribersResponseDto(response: unknown) {
  return getSubscribersResponseDtoSchema.parse(response).map((subscriber) => ({
    ...subscriber,
    avatarUrl: subscriber.avatarUrl ?? undefined,
  }));
}

export const getFollowers = async (userId: string, signal: AbortSignal) => {
  return deserializeGetSubscribersResponseDto(
    await httpTransport.get(`/subscription/followers`, {
      params: {
        searchParams: serializeGetSubscribersDtoRequest(userId),
        withAuth: true,
      },
      signal,
    })
  );
};
