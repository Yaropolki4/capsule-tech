import { useMutation } from "@tanstack/react-query";
import { createPost } from "@/entities/posts";
import { queryClient } from "@/shared/query-client";

export const useCreatePostMutation = () => {
  return useMutation({
    mutationFn: createPost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["postsFeed"] });
    },
  });
};
