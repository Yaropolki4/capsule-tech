import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/ui/dialog";
import { FollowingsList } from "./followings-list";
import { useModal } from "@/shared/lib/modal/use-modal";

export const FollowingsListModal = ({
  userId,
  renderActions,
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
}) => {
  const { closeModal } = useModal();

  return (
    <DialogContent
      aria-describedby="followings-list-modal"
      className="h-[600px] flex-col flex"
    >
      <DialogHeader className="mb-2">
        <DialogTitle>Подписки</DialogTitle>
      </DialogHeader>
      <div className="flex-1 relative -mx-6">
        <div className="absolute w-full h-full">
          <FollowingsList
            userId={userId}
            renderActions={renderActions}
            onClick={closeModal}
          />
        </div>
      </div>
    </DialogContent>
  );
};
