import { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/ui/dialog";
import { Input } from "@/shared/ui/ui/input";
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
  const [search, setSearch] = useState("");

  return (
    <DialogContent
      aria-describedby="subscribers-list-modal"
      className="h-[600px] flex-col flex"
    >
      <DialogHeader className="mb-2">
        <DialogTitle>Подписчики</DialogTitle>
      </DialogHeader>
      <Input
        placeholder="Поиск"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="flex-1 relative -mx-6">
        <div className="absolute w-full h-full">
          <FollowersList
            userId={userId}
            renderActions={renderActions}
            onClick={closeModal}
            searchQuery={search}
          />
        </div>
      </div>
    </DialogContent>
  );
};
