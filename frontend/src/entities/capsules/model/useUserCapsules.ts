import { useQuery } from "@tanstack/react-query";
import { getUserCapsules } from "../api/get-user-capsules";

const STALE_TIME = 1000 * 60 * 5;

export function useUserCapsules(userId: Maybe<string>, enabled: boolean = true) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["capsules", userId],
    queryFn: () => getUserCapsules(userId ?? ""),
    staleTime: STALE_TIME,
    enabled,
  });

  return { data, isLoading, error };
}
