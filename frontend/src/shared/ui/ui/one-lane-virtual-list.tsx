import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

const DEFAULT_SIZE = 48;

export const OneLaneVirtualList = <T,>({
  items,
  renderItem,
  getItemKey,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  getItemKey: (item: T) => string;
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => DEFAULT_SIZE,
  });

  return (
    <div ref={scrollerRef} className="h-full overflow-y-auto chat-scrollbar">
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
        }}
        className="relative w-full"
      >
        <div
          style={{
            transform: `translateY(${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px)`,
          }}
          className="absolute top-0 left-0 w-full"
        >
          {rowVirtualizer.getVirtualItems().map((item) => {
            const currentItem = items?.[item.index];

            if (!currentItem) {
              return null;
            }

            return (
              <div
                key={getItemKey(currentItem)}
                ref={rowVirtualizer.measureElement}
                data-index={item.index}
              >
                {renderItem(currentItem)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
