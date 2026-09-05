"use client";

import { useTryOns, deleteTryOn, type TryOn } from "@/entities/try-on";
import { BaseVirtualList } from "@/shared/ui/ui/base-virtual-list";
import { Skeleton } from "@/shared/ui/ui/skeleton";
import { useCurrentUser } from "@/entities/user-session";
import { queryClient } from "@/shared/query-client";
import { useModal } from "@/shared/lib/modal/use-modal";
import { TryOnItem } from "./try-on-item";
import { EmptyTryOns } from "./empty-try-ons";
import { TryOnFullscreenModal } from "./try-on-fullscreen-modal";

export function TryOnsList({
  parentRef,
  lanes,
}: {
  parentRef: React.RefObject<HTMLDivElement | null>;
  lanes: number;
}) {
  const [currentUser] = useCurrentUser();
  const { data, isLoading, error } = useTryOns(currentUser?.id);
  const { openModal } = useModal();

  const onDelete = async (id: string) => {
    await deleteTryOn(id);
    await queryClient.invalidateQueries({
      queryKey: ["try-ons", currentUser?.id],
    });
  };

  const renderItem = (item: TryOn) => (
    <TryOnItem
      item={item}
      onClick={() =>
        openModal({
          Component: TryOnFullscreenModal,
          props: {
            imageUrl: item.resultImageUrl,
            caption: item.clothes?.brand || item.capsule?.name || "Примерка",
          },
        })
      }
      onDelete={() => onDelete(item.id)}
    />
  );

  if (isLoading) {
    return (
      <div className="flex flex-wrap">
        {new Array(12).fill(0).map((_, index) => (
          <div key={index} className="pb-0.5 pl-0.5 w-1/3">
            <Skeleton
              className="w-full h-full"
              style={{ aspectRatio: 3 / 4 }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return data && data.length > 0 ? (
    <div className="border-t border-border pt-2">
      <BaseVirtualList
        parentRef={parentRef}
        items={data}
        renderItem={renderItem}
        getItemKey={(item) => item.id}
        lanes={lanes}
        aspectRatio={3 / 4}
      />
    </div>
  ) : (
    <div className="mt-10">
      <EmptyTryOns />
    </div>
  );
}
