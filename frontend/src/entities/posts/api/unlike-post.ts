import { httpTransport } from "@/shared/api/http-transport";
import { likePostResponseDtoSchema, type LikePostResponseDto } from "@capsule/common";

export const unlikePost = async (postId: string): Promise<LikePostResponseDto> => {
  return likePostResponseDtoSchema.parse(
    await httpTransport.delete(`/post/${postId}/like`, {
      params: {
        withAuth: true,
      },
    })
  );
};
