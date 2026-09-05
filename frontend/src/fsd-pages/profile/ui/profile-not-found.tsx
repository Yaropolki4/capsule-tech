import { Button } from "@/shared/ui/ui/button";
import {
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Empty,
} from "@/shared/ui/ui/empty";
import { CloudAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileNotFound({ name }: { name: string }) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CloudAlert />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Пользователь не найден</EmptyTitle>
      <EmptyDescription>
        Пользователь с таким именем <span className="font-bold">{name}</span> не
        зарегистрирован
      </EmptyDescription>
      <EmptyContent>
        <Button onClick={handleGoHome}>Вернуться на главную</Button>
      </EmptyContent>
    </Empty>
  );
}
