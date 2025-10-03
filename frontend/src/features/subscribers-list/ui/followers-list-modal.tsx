import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/ui/dialog";
import { FollowersList } from "./followers-list";
import { useModal } from "@/shared/lib/modal/use-modal";

export const FollowersListModal = ({
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
      aria-describedby="subscribers-list-modal"
      className="h-[600px] flex-col flex"
    >
      <DialogHeader className="mb-2">
        <DialogTitle>Подписчики</DialogTitle>
      </DialogHeader>
      <div className="flex-1 relative -mx-6">
        <div className="absolute w-full h-full">
          <FollowersList
            userId={userId}
            renderActions={renderActions}
            onClick={closeModal}
          />
        </div>
      </div>
    </DialogContent>
  );
};
