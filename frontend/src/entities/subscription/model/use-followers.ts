import { useQueryClient } from "@tanstack/react-query";
import { getFollowers } from "../api/get-followers";
import { useFetch } from "@/shared/lib/react/use-fetch";

export const useFollowers = (userId: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useFetch(
    (signal) => getFollowers(userId, signal),
    {
      onSuccess: (data) => {
        data.forEach((follower) => {
          queryClient.setQueryData(["user", follower.name], follower);
        });
      },
    }
  );

  return { data, isLoading, error };
};
