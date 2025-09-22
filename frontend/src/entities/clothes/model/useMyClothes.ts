import { useQuery } from "@tanstack/react-query";
import { getClothes } from "../api/get-clothes";

const STALE_TIME = 1000 * 60 * 5;

export function useMyClothes() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-clothes"],
    queryFn: () => getClothes(),
    staleTime: STALE_TIME,
  });

  return { data, isLoading, error };
}
