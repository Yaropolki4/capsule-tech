import { useFollowings } from "@/entities/subscription";
import type { Subscriber } from "../model/types";
import { SubscriberItem } from "./subscriber-item";
import { OneLaneVirtualList } from "@/shared/ui/ui/one-lane-virtual-list";
import { useRouter } from "next/navigation";

const EMPTY_ITEMS: Subscriber[] = [];

export const FollowingsList = ({
  userId,
  renderActions,
  onClick,
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
}) => {
  const { data: items, isLoading, error } = useFollowings(userId);
  const router = useRouter();
  const renderItem = (item: Subscriber) => {
    return (
      <SubscriberItem
        onClick={() => {
          onClick();
          router.push(`/${item.name}`);
        }}
        subscriber={item.name}
        renderActions={renderActions}
        onActionClick={(e) => {
          e.preventDefault();
        }}
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
      items={items ?? EMPTY_ITEMS}
      renderItem={renderItem}
      getItemKey={getItemKey}
    />
  );
};
