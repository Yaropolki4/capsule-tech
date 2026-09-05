"use client";

import { usePageUser } from "@/shared/providers/page-user/page-user-context";
import { useUser } from "@/entities/user-session";
import { PostsFeed } from "./posts-feed";

export function UserPostsFeed({
  parentRef,
}: {
  parentRef: React.RefObject<HTMLDivElement | null>;
}) {
  const pageUserName = usePageUser();
  const {
    data: pageUserData,
    isLoading: pageUserIsLoading,
    error: pageUserError,
  } = useUser(pageUserName);

  if (pageUserError) {
    return <div>Error: {pageUserError.message}</div>;
  }

  return (
    <PostsFeed
      parentRef={parentRef}
      userId={pageUserData?.data?.id}
      enabled={!pageUserIsLoading}
    />
  );
}
