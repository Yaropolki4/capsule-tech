import {
  EmptyHeader,
  EmptyMedia,
  Empty,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/ui/empty";
import { Ban } from "lucide-react";

export function SelfEmptyClothes() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Ban />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Нет одежды</EmptyTitle>
      <EmptyDescription>
        Здесь пока пусто, но скоро здесь появятся ваши вещи
      </EmptyDescription>
    </Empty>
  );
}
