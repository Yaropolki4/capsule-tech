import { useMutation, type InfiniteData } from "@tanstack/react-query";
import { likePost, unlikePost } from "@/entities/posts";
import { queryClient } from "@/shared/query-client";
import type { GetPostsFeedResponseDto } from "@capsule/common";

function setPostInFeedCache(
  postId: string,
  updater: (
    item: GetPostsFeedResponseDto["items"][number]
  ) => GetPostsFeedResponseDto["items"][number]
) {
  queryClient.setQueriesData<InfiniteData<GetPostsFeedResponseDto>>(
    { queryKey: ["postsFeed"] },
    (data) => {
      if (!data) return data;

      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === postId ? updater(item) : item
          ),
        })),
      };
    }
  );
}

export function useTogglePostLikeMutation() {
  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      liked ? likePost(postId) : unlikePost(postId),
    onMutate: async ({ postId, liked }) => {
      await queryClient.cancelQueries({ queryKey: ["postsFeed"] });

      setPostInFeedCache(postId, (item) => ({
        ...item,
        isLikedByMe: liked,
        likesCount: item.likesCount + (liked ? 1 : -1),
      }));
    },
    onError: (_error, { postId, liked }) => {
      setPostInFeedCache(postId, (item) => ({
        ...item,
        isLikedByMe: !liked,
        likesCount: item.likesCount + (liked ? -1 : 1),
      }));
    },
    onSuccess: (data, { postId }) => {
      setPostInFeedCache(postId, (item) => ({
        ...item,
        isLikedByMe: data.isLikedByMe,
        likesCount: data.likesCount,
      }));
    },
  });
}
