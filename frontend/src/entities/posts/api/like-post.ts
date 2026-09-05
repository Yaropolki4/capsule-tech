import { httpTransport } from "@/shared/api/http-transport";
import { likePostResponseDtoSchema, type LikePostResponseDto } from "@capsule/common";

export const likePost = async (postId: string): Promise<LikePostResponseDto> => {
  return likePostResponseDtoSchema.parse(
    await httpTransport.post(`/post/${postId}/like`, {
      params: {
        withAuth: true,
      },
    })
  );
};
