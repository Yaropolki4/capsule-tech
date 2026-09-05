import { useMemo } from "react";
import { useClothes, mapCategoryToGroup, type CategoryGroup } from "@/entities/clothes";
import { BaseVirtualList } from "@/shared/ui/ui/base-virtual-list";
import type { Clothes } from "../model/types";
import { Skeleton } from "@/shared/ui/ui/skeleton";
import { usePageUser } from "@/shared/providers/page-user/page-user-context";
import { useCurrentUser, useUser } from "@/entities/user-session";
import { SelfEmptyClothes } from "./self-empty-clothes";
import { EmptyClothes } from "./empty-clothes";
import { ClothesItem } from "./clothes-item";
import { useModal } from "@/shared/lib/modal/use-modal";
import { ClothesInfo } from "./clothes-info";

export function ClothesList({
  parentRef,
  lanes,
  filterCategory,
  searchQuery,
}: {
  parentRef: React.RefObject<HTMLDivElement | null>;
  lanes: number;
  filterCategory?: CategoryGroup;
  searchQuery?: string;
}) {
  const { openModal } = useModal();
  const renderItem = (item: Clothes) => {
    return (
      <ClothesItem
        item={item}
        onClick={() => {
          openModal({ Component: ClothesInfo, props: { clothes: item } });
        }}
      />
    );
  };
  const pageUserName = usePageUser();
  const [currentUser] = useCurrentUser();
  const isCurrentUser = currentUser?.name === pageUserName;

  const {
    data: pageUserData,
    isLoading: pageUserIsLoading,
    error: pageUserError,
  } = useUser(pageUserName);

  const { data: allData, isLoading, error } = useClothes(
    pageUserData?.data?.id,
    !pageUserIsLoading
  );

  const query = searchQuery?.trim().toLowerCase();

  const data = useMemo(() => {
    if (!allData) return allData;

    return allData.filter((item) => {
      const matchesCategory =
        !filterCategory ||
        filterCategory === "Все" ||
        mapCategoryToGroup[item.category] === filterCategory;
      const matchesQuery =
        !query || (item.brand ?? "").toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [allData, filterCategory, query]);

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

  if (allData && allData.length > 0 && data && data.length === 0) {
    return (
      <div className="mt-10 text-center text-muted-foreground">
        Ничего не найдено
      </div>
    );
  }

  return data && data.length > 0 ? (
    <div className="border-t border-border pt-2">
      <BaseVirtualList
        parentRef={parentRef}
        items={data}
        renderItem={renderItem}
        getItemKey={(item) => item.imageUrl}
        lanes={lanes}
        aspectRatio={3 / 4}
      />
    </div>
  ) : (
    <div className="mt-10">
      {isCurrentUser ? (
        <SelfEmptyClothes />
      ) : (
        <EmptyClothes userName={pageUserName} />
      )}
    </div>
  );
}
