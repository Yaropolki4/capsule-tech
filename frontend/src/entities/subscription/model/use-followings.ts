import { useQueryClient } from "@tanstack/react-query";
import { getFollowings } from "../api/get-followings";
import { useFetch } from "@/shared/lib/react/use-fetch";

export const useFollowings = (userId: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useFetch(
    (signal) => getFollowings(userId, signal),
    {
      onSuccess: (data) => {
        data.forEach((following) => {
          queryClient.setQueryData(["user", following.name], following);
        });
      },
    }
  );

  return { data, isLoading, error };
};
