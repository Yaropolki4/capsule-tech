import { Button } from "@/shared/ui/ui/button";
import { useSubscribeMutation } from "../model/use-subscribe-mutation";
import { useUnsubscribeMutation } from "../model/use-unsubscribe-mutation";
import { useCurrentUser } from "@/entities/user-session";

export const ManageSubscriptionButton = ({
  user,
  onClick,
}: {
  user: { name: string; id: string; isSubscribed: boolean };
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const { mutate: unsubscribe, isPending: isUnsubscribing } =
    useUnsubscribeMutation(user.name);
  const { mutate: subscribe, isPending: isSubscribing } = useSubscribeMutation(
    user.name
  );

  const [currentUser] = useCurrentUser();
  const isCurrentUser = user.id === currentUser?.id;

  if (isCurrentUser) {
    return null;
  }

  if (user.isSubscribed) {
    return (
      <Button
        onClick={(e) => {
          if (onClick) {
            onClick(e);
          }

          unsubscribe(user.id);
        }}
        size="s"
        disabled={isUnsubscribing}
        variant="secondary"
        className="w-32"
      >
        Отписаться
      </Button>
    );
  }

  return (
    <Button
      onClick={(e) => {
        if (onClick) {
          onClick(e);
        }

        subscribe(user.id);
      }}
      size="s"
      disabled={isSubscribing}
      className="w-32"
    >
      Подписаться
    </Button>
  );
};
