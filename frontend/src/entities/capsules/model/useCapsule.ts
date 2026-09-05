import { useQuery } from "@tanstack/react-query";
import { getCapsule } from "../api/get-capsule";

const STALE_TIME = 1000 * 60 * 5;

export function useCapsule(capsuleId: Maybe<string>) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["capsule", capsuleId],
    queryFn: () => getCapsule(capsuleId ?? ""),
    staleTime: STALE_TIME,
    enabled: Boolean(capsuleId),
  });

  return { data, isLoading, error };
}
