import { useQuery } from "@tanstack/react-query";
import { getTryOns } from "../api/get-try-ons";

const STALE_TIME = 1000 * 60 * 5;

export function useTryOns(userId: Maybe<string>, enabled: boolean = true) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["try-ons", userId],
    queryFn: getTryOns,
    staleTime: STALE_TIME,
    enabled: enabled && Boolean(userId),
  });

  return { data, isLoading, error };
}
