import {
  EmptyHeader,
  EmptyMedia,
  Empty,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/ui/empty";
import { Shapes } from "lucide-react";

export function EmptyCapsules({ userName }: { userName: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Shapes />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Нет капсул</EmptyTitle>
      <EmptyDescription>
        <span className="font-bold">{userName}</span> пока не опубликовал ни
        одной капсулы
      </EmptyDescription>
    </Empty>
  );
}
