import { httpTransport } from "@/shared/api/http-transport";
import type { GetFollowingDtoRequest } from "@capsule/common";
import { getFollowingResponseDtoSchema } from "@capsule/common";

function serializeGetFollowingDtoRequest(
  userId: string
): GetFollowingDtoRequest {
  return {
    id: userId,
  };
}

function deserializeGetFollowingResponseDto(response: unknown) {
  return getFollowingResponseDtoSchema.parse(response).map((following) => ({
    ...following,
    avatarUrl: following.avatarUrl ?? undefined,
  }));
}

export const getFollowings = async (userId: string, signal: AbortSignal) => {
  return deserializeGetFollowingResponseDto(
    await httpTransport.get(`/subscription/following`, {
      params: {
        searchParams: serializeGetFollowingDtoRequest(userId),
        withAuth: true,
      },
      signal,
    })
  );
};
