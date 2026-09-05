export function MobileProfileInfo({
  onSubscribersCountClick,
  onFollowingsCountClick,
  followersCount,
  followingCount,
  capsulesQuantity,
  itemsCount,
}: {
  onSubscribersCountClick: () => void;
  onFollowingsCountClick: () => void;
  followersCount: number;
  followingCount: number;
  capsulesQuantity: number;
  itemsCount: number;
}) {
  return (
    <div className="grid grid-cols-4 border-t border-border py-2 gap-2 mt-8">
      <div
        className="flex justify-center items-center flex-col cursor-pointer"
        onClick={onFollowingsCountClick}
      >
        <div className="font-semibold">{followingCount}</div>
        <div className="text-xs text-muted-foreground">подписок</div>
      </div>
      <div
        className="flex justify-center items-center flex-col cursor-pointer"
        onClick={onSubscribersCountClick}
      >
        <div className="font-semibold">{followersCount}</div>
        <div className="text-xs text-muted-foreground">подписчиков</div>
      </div>
      <div className="flex justify-center items-center flex-col">
        <div className="font-semibold">{capsulesQuantity}</div>
        <div className="text-xs text-muted-foreground">капсул</div>
      </div>
      <div className="flex justify-center items-center flex-col">
        <div className="font-semibold">{itemsCount}</div>
        <div className="text-xs text-muted-foreground">вещей</div>
      </div>
    </div>
  );
}
