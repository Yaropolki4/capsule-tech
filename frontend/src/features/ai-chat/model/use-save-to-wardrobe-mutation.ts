import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { addClothesToWardrobe } from "@/entities/clothes";
import { queryClient } from "@/shared/query-client";
import { useCurrentUser } from "@/entities/user-session";

export const useSaveToWardrobeMutation = () => {
  const [currentUser] = useCurrentUser();

  return useMutation({
    mutationFn: addClothesToWardrobe,
    onSuccess: async () => {
      toast("Добавлено в гардероб");
      await queryClient.invalidateQueries({
        queryKey: ["clothes", currentUser?.id],
      });
    },
    onError: () => {
      toast("Не получилось сохранить вещь, попробуй ещё раз");
    },
  });
};
