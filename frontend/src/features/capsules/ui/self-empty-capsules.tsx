"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/ui/button";
import {
  EmptyHeader,
  EmptyMedia,
  Empty,
  EmptyDescription,
  EmptyTitle,
  EmptyContent,
} from "@/shared/ui/ui/empty";
import { Shapes } from "lucide-react";
import { routes } from "@/shared/constants/routes";

export function SelfEmptyCapsules() {
  const router = useRouter();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Shapes />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Нет капсул</EmptyTitle>
      <EmptyDescription>
        Здесь пока пусто, но скоро здесь появятся ваши капсулы
      </EmptyDescription>
      <EmptyContent>
        <Button onClick={() => router.push(routes.newCapsule)}>
          Создать капсулу
        </Button>
      </EmptyContent>
    </Empty>
  );
}
