import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect } from "react";

export function BaseVirtualList<T>({
  items,
  renderItem,
  getItemKey,
  lanes,
  parentRef,
  className,
  aspectRatio,
}: {
  items: Array<T>;
  renderItem: (item: T) => React.ReactNode;
  getItemKey: (item: T) => string;
  lanes: number;
  parentRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  aspectRatio?: number;
}) {
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    getItemKey: (index) => getItemKey(items[index]),
    estimateSize: () => 40,
    overscan: 8,
    lanes,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, []);

  const virtualItems = rowVirtualizer.getVirtualItems();
  const baseOffset = virtualItems[0]?.start ?? 0;

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
      }}
      className={cn("relative w-full", className)}
    >
      <div
        className="w-full h-full absolute top-0 left-0"
        style={{
          transform: `translateY(${baseOffset}px)`,
        }}
      >
        {virtualItems.map((virtualRow) => {
          return (
            <div
              ref={rowVirtualizer.measureElement}
              key={getItemKey(items[virtualRow.index])}
              style={{
                position: "absolute",
                top: 0,
                left: `${virtualRow.lane * (100 / lanes)}%`,
                width: `${100 / lanes}%`,
                transform: `translateY(${virtualRow.start - baseOffset}px)`,
                boxSizing: "border-box",
                aspectRatio: aspectRatio,
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
