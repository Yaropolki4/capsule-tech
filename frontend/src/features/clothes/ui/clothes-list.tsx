import { useClothes } from "@/entities/clothes";
import { BaseVirtualList } from "@/shared/ui/ui/base-virtual-list";
import type { Clothes } from "../model/types";
import Image from "next/image";
import { Skeleton } from "@/shared/ui/ui/skeleton";
import { usePageUser } from "@/shared/providers/page-user/page-user-context";
import { useUser } from "@/entities/user-session";

export function ClothesList({
  parentRef,
  lanes,
}: {
  parentRef: React.RefObject<HTMLDivElement | null>;
  lanes: number;
}) {
  const renderItem = (item: Clothes) => {
    return (
      <div className="w-full h-full pl-0.5 pb-0.5">
        <div className="w-full h-full">
          <Image
            src={item.imageUrl}
            alt={item.brand}
            width={1000}
            height={1000}
          />
        </div>
      </div>
    );
  };
  const pageUserName = usePageUser();

  const {
    data: pageUserData,
    isLoading: pageUserIsLoading,
    error: pageUserError,
  } = useUser(pageUserName);

  const { data, isLoading, error } = useClothes(
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
              style={{ aspectRatio: 3 / 4 }}
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
    <BaseVirtualList
      className="border-t border-border"
      parentRef={parentRef}
      items={data}
      renderItem={renderItem}
      getItemKey={(item) => item.imageUrl}
      lanes={lanes}
      aspectRatio={3 / 4}
    />
  ) : (
    <div>No clothes</div>
  );
}
