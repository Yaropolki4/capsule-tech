import { useMutation } from "@tanstack/react-query";
import { unsubscribe } from "@/entities/subscription";
import { queryClient } from "@/shared/query-client";
import { useCurrentUser } from "@/entities/user-session";
import { toast } from "sonner";

export function useUnsubscribeMutation(userName: string) {
  const [currentUser] = useCurrentUser();

  return useMutation({
    mutationFn: (userId: string) => unsubscribe(userId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user", userName] }),
        currentUser?.name &&
          queryClient.invalidateQueries({
            queryKey: ["user", currentUser.name],
          }),
      ]);
    },
    onError: () => {
      toast.error("Ошибка при отписке");
    },
  });
}
