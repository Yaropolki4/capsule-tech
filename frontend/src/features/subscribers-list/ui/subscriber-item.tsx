import { AvatarContainer } from "@/shared/ui/ui/avatar";
import type { Subscriber } from "../model/types";
import { useUser } from "@/entities/user-session";

export const SubscriberItem = ({
  subscriber,
  renderActions,
  onActionClick,
  onClick,
}: {
  subscriber: Subscriber["name"];
  renderActions: (
    user: {
      id: string;
      name: string;
      isSubscribed: boolean;
    },
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  ) => React.ReactNode;
  onClick: () => void;
  onActionClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const {
    data: subscriberRequestData,
    error: subscriberRequestError,
    isLoading: subscriberRequestIsLoading,
  } = useUser(subscriber);

  if (subscriberRequestIsLoading) {
    return <div>Loading...</div>;
  }

  if (subscriberRequestError) {
    return <div>Error: {subscriberRequestError.message}</div>;
  }

  if (subscriberRequestData?.error) {
    return <div>Error: User not found</div>;
  }

  const subscriberData = subscriberRequestData?.data;

  if (!subscriberData) {
    return <div>Error: User not found</div>;
  }

  return (
    <div
      className="px-6 py-2 cursor-pointer"
      onClick={(e) => {
        if (e.defaultPrevented) return;

        onClick();
      }}
    >
      <div className="flex items-center justify-between w-full rounded-[var(--radius-card)] p-2 hover:bg-accent/30">
        <div className="flex items-center gap-4">
          <AvatarContainer url={subscriberData.avatarUrl} className="size-10" />
          <div className="text-lg font-medium">{subscriberData.name}</div>
        </div>
        {renderActions(
          {
            id: subscriberData.id,
            name: subscriberData.name,
            isSubscribed: subscriberData.isSubscribed,
          },
          onActionClick
        )}
      </div>
    </div>
  );
};
