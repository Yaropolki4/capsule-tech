import { useMutation } from "@tanstack/react-query";
import { createCapsule } from "@/entities/capsules";
import { queryClient } from "@/shared/query-client";
import { useCurrentUser } from "@/entities/user-session";

export const useCreateCapsuleMutation = () => {
  const [currentUser] = useCurrentUser();

  return useMutation({
    mutationFn: createCapsule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["capsules", currentUser?.id],
      });
      await queryClient.invalidateQueries({ queryKey: ["capsulesFeed"] });
    },
  });
};
