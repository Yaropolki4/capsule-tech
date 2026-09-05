import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostsFeed } from "../api/get-posts-feed";

const FEED_PAGE_SIZE = 20;

export function usePostsFeed(userId?: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["postsFeed", userId],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      getPostsFeed({ cursor: pageParam, limit: FEED_PAGE_SIZE, userId }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}
