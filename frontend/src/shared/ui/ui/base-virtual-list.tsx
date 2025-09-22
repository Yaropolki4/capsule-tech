import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";

export function BaseVirtualList<T>({
  items,
  renderItem,
  getItemKey,
  lanes,
  parentRef,
  className,
}: {
  items: Array<T>;
  renderItem: (item: T) => React.ReactNode;
  getItemKey: (item: T) => string;
  lanes: number;
  parentRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500,
    overscan: 8,
    lanes,
  });

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
      }}
      className={cn("relative w-full", className)}
    >
      <div className="w-full h-full relative">
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          return (
            <div
              ref={rowVirtualizer.measureElement}
              key={getItemKey(items[virtualRow.index])}
              style={{
                position: "absolute",
                top: 0,
                left: `${virtualRow.lane * (100 / lanes)}%`,
                width: `${100 / lanes}%`,
                transform: `translateY(${virtualRow.start}px)`,
                boxSizing: "border-box",
                aspectRatio: 3 / 4,
              }}
              data-index={virtualRow.index}
            >
              {renderItem(items[virtualRow.index])}
            </div>
          );
        })}
      </div>
    </div>
  );
}
