import { useQuery } from "@tanstack/react-query";
import { getTokenBalances } from "../api/get-balances";

export const TOKEN_BALANCES_QUERY_KEY = ["token-balances"];

export function useTokenBalances(enabled: boolean = true) {
  return useQuery({
    queryKey: TOKEN_BALANCES_QUERY_KEY,
    queryFn: getTokenBalances,
    enabled,
  });
}
