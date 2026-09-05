import {
  EmptyHeader,
  EmptyMedia,
  Empty,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/ui/empty";
import { Ban } from "lucide-react";

export function EmptyClothes({ userName }: { userName: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Ban />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Нет одежды</EmptyTitle>
      <EmptyDescription>
        <span className="font-bold">{userName}</span> пока не добавил ни одной
        вещи
      </EmptyDescription>
    </Empty>
  );
}
