import { useFollowers } from "@/entities/subscription";
import type { Subscriber } from "../model/types";
import { SubscriberItem } from "./subscriber-item";
import { OneLaneVirtualList } from "@/shared/ui/ui/one-lane-virtual-list";
import { useRouter } from "next/navigation";

const EMPTY_ITEMS: Subscriber[] = [];

export const FollowersList = ({
  userId,
  renderActions,
  onClick,
  searchQuery,
}: {
  userId: string;
  renderActions: (
    user: {
      id: string;
      name: string;
      isSubscribed: boolean;
    },
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  ) => React.ReactNode;
  onClick: () => void;
  searchQuery?: string;
}) => {
  const { data: items, isLoading, error } = useFollowers(userId);
  const router = useRouter();
  const filteredItems = (items ?? EMPTY_ITEMS).filter((item) =>
    item.name.toLowerCase().includes((searchQuery ?? "").toLowerCase())
  );
  const renderItem = (item: Subscriber) => {
    return (
      <SubscriberItem
        onClick={() => {
          onClick();
          router.push(`/${item.name}`);
        }}
        subscriber={item.name}
        renderActions={renderActions}
        onActionClick={onClick}
      />
    );
  };

  const getItemKey = (item: Subscriber) => item.id;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <OneLaneVirtualList
      items={filteredItems}
      renderItem={renderItem}
      getItemKey={getItemKey}
    />
  );
};
