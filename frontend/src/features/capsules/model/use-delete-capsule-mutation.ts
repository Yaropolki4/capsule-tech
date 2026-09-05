import { useMutation } from "@tanstack/react-query";
import { deleteCapsule } from "@/entities/capsules";
import { queryClient } from "@/shared/query-client";
import { useCurrentUser } from "@/entities/user-session";

export const useDeleteCapsuleMutation = () => {
  const [currentUser] = useCurrentUser();

  return useMutation({
    mutationFn: deleteCapsule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["capsules", currentUser?.id],
      });
      await queryClient.invalidateQueries({ queryKey: ["capsulesFeed"] });
    },
  });
};
