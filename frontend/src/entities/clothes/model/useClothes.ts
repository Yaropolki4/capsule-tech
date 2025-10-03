import { useQuery } from "@tanstack/react-query";
import { getClothes } from "../api/get-clothes";

const STALE_TIME = 1000 * 60 * 5;

export function useClothes(userId: Maybe<string>, enabled: boolean = true) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["clothes", userId],
    queryFn: () => getClothes(userId ?? ""),
    staleTime: STALE_TIME,
    enabled,
  });

  return { data, isLoading, error };
}
