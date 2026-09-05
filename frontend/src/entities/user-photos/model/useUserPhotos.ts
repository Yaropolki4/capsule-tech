import { useQuery } from "@tanstack/react-query";
import { getUserPhotos } from "../api/get-user-photos";

const STALE_TIME = 1000 * 60 * 5;

export function useUserPhotos(userId: Maybe<string>, enabled: boolean = true) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-photos", userId],
    queryFn: getUserPhotos,
    staleTime: STALE_TIME,
    enabled: enabled && Boolean(userId),
  });

  return { data, isLoading, error };
}
