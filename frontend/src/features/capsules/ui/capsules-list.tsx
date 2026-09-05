"use client";

import { useUserCapsules } from "@/entities/capsules";
import type { Capsule } from "@/entities/capsules";
import { BaseVirtualList } from "@/shared/ui/ui/base-virtual-list";
import { Skeleton } from "@/shared/ui/ui/skeleton";
import { usePageUser } from "@/shared/providers/page-user/page-user-context";
import { useCurrentUser, useUser } from "@/entities/user-session";
import { CAPSULE_CANVAS_ASPECT_RATIO } from "@/shared/constants/capsule";
import { SelfEmptyCapsules } from "./self-empty-capsules";
import { EmptyCapsules } from "./empty-capsules";
import { CapsuleItem } from "./capsule-item";

export function CapsulesList({
  parentRef,
  lanes,
}: {
  parentRef: React.RefObject<HTMLDivElement | null>;
  lanes: number;
}) {
  const renderItem = (item: Capsule) => <CapsuleItem item={item} />;
  const pageUserName = usePageUser();
  const [currentUser] = useCurrentUser();
  const isCurrentUser = currentUser?.name === pageUserName;

  const {
    data: pageUserData,
    isLoading: pageUserIsLoading,
    error: pageUserError,
  } = useUser(pageUserName);

  const { data, isLoading, error } = useUserCapsules(
    pageUserData?.data?.id,
    !pageUserIsLoading
  );

  if (isLoading) {
    return (
      <div className="flex flex-wrap">
        {new Array(20).fill(0).map((_, index) => (
          <div key={index} className="pb-0.5 pl-0.5 w-1/3">
            <Skeleton
              className="w-full h-full"
              style={{ aspectRatio: CAPSULE_CANVAS_ASPECT_RATIO }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (error || pageUserError) {
    return <div>Error: {error?.message || pageUserError?.message}</div>;
  }

  return data && data.length > 0 ? (
    <div className="border-t border-border pt-2">
      <BaseVirtualList
        parentRef={parentRef}
        items={data}
        renderItem={renderItem}
        getItemKey={(item) => item.id}
        lanes={lanes}
        aspectRatio={CAPSULE_CANVAS_ASPECT_RATIO}
      />
    </div>
  ) : (
    <div className="mt-10">
      {isCurrentUser ? (
        <SelfEmptyCapsules />
      ) : (
        <EmptyCapsules userName={pageUserName} />
      )}
    </div>
  );
}
