import { useMutation } from "@tanstack/react-query";
import { deleteClothes } from "@/entities/clothes";
import { queryClient } from "@/shared/query-client";
import { useCurrentUser } from "@/entities/user-session";

export const useDeleteClotherMutation = () => {
  const [currentUser] = useCurrentUser();

  return useMutation({
    mutationFn: deleteClothes,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["clothes", currentUser?.id],
      });
    },
  });
};
