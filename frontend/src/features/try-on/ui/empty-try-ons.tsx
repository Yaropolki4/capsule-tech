import {
  EmptyHeader,
  EmptyMedia,
  Empty,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/ui/empty";
import { Sparkles } from "lucide-react";

export function EmptyTryOns() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Sparkles />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Нет примерок</EmptyTitle>
      <EmptyDescription>
        Наведите на вещь или капсулу и нажмите «Примерить», чтобы увидеть
        результат здесь
      </EmptyDescription>
    </Empty>
  );
}
