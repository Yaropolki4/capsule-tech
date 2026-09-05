import { httpTransport } from "@/shared/api/http-transport";
import {
  getPostsFeedResponseDtoSchema,
  type GetPostsFeedRequestDto,
} from "@capsule/common";

export const getPostsFeed = async (params: GetPostsFeedRequestDto) => {
  const searchParams: Record<string, string | number> = {
    limit: params.limit,
  };

  if (params.cursor) {
    searchParams.cursor = params.cursor;
  }

  if (params.userId) {
    searchParams.userId = params.userId;
  }

  return getPostsFeedResponseDtoSchema.parse(
    await httpTransport.get("/post/wall", {
      params: {
        searchParams,
        withAuth: true,
      },
    })
  );
};
