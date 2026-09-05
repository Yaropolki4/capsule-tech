import { CloudAlert } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";
import { Button } from "./button";

export function ServerError() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CloudAlert />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Ошибка сервера</EmptyTitle>
      <EmptyDescription>
        Перезагрузите страницу или попробуйте позже
      </EmptyDescription>
      <EmptyContent>
        <Button onClick={() => window.location.reload()}>Перезагрузить</Button>
      </EmptyContent>
    </Empty>
  );
}
