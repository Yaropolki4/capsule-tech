import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClothesFromWildberries } from "@/entities/clothes";
import {
  describeInsufficientTokensError,
  TOKEN_BALANCES_QUERY_KEY,
} from "@/entities/billing";
import { queryClient } from "@/shared/query-client";
import { useCurrentUser } from "@/entities/user-session";

export const useSaveWildberriesItemMutation = () => {
  const [currentUser] = useCurrentUser();

  return useMutation({
    mutationFn: createClothesFromWildberries,
    onSuccess: async () => {
      toast("Добавлено в гардероб");
      await queryClient.invalidateQueries({
        queryKey: ["clothes", currentUser?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: TOKEN_BALANCES_QUERY_KEY,
      });
    },
    onError: (error) => {
      toast(
        describeInsufficientTokensError(error) ??
          "Не получилось сохранить вещь, попробуй ещё раз"
      );
    },
  });
};
