"use client";

import { useEffect, useMemo, useRef } from "react";
import { useIntersection } from "react-use";
import { Users } from "lucide-react";
import { usePostsFeed } from "@/entities/posts";
import { BaseVirtualList } from "@/shared/ui/ui/base-virtual-list";
import { Skeleton } from "@/shared/ui/ui/skeleton";
import { ServerError } from "@/shared/ui/ui/server-error";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/shared/ui/ui/empty";
import { PostCard } from "./post-card";

export function PostsFeed({
  parentRef,
  userId,
  enabled = true,
}: {
  parentRef: React.RefObject<HTMLDivElement | null>;
  userId?: string;
  enabled?: boolean;
}) {
  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostsFeed(userId, enabled);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(sentinelRef as React.RefObject<HTMLElement>, {
    root: parentRef.current,
    threshold: 0,
  });

  useEffect(() => {
    if (intersection?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [intersection?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {new Array(4).fill(0).map((_, index) => (
          <Skeleton key={index} className="w-full h-40 rounded-[var(--radius-card)]" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ServerError />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
          </EmptyHeader>
          <EmptyTitle>Пока пусто</EmptyTitle>
          <EmptyDescription>
            Здесь появятся посты пользователей, как только кто-то поделится
            образом
          </EmptyDescription>
        </Empty>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-2">
      <BaseVirtualList
        parentRef={parentRef}
        items={items}
        renderItem={(item) => <PostCard post={item} />}
        getItemKey={(item) => item.id}
        lanes={1}
      />
      <div ref={sentinelRef} className="h-px w-full" />
    </div>
  );
}
