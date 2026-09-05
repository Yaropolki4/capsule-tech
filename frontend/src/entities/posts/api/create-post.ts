import { httpTransport } from "@/shared/api/http-transport";
import {
  createPostResponseDtoSchema,
  type CreatePostRequestDto,
} from "@capsule/common";

export const createPost = async (data: CreatePostRequestDto) => {
  return createPostResponseDtoSchema.parse(
    await httpTransport.post("/post", {
      json: data,
      params: {
        withAuth: true,
      },
    })
  );
};
