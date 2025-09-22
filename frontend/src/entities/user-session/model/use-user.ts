import { getUserByNameQueryOptions } from "../queries/get-user-by-name-query-options";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { User } from "./types";

export const useUser = (
  userName: string
): UseQueryResult<
  | { data: Omit<User, "email">; error: null }
  | { data: null; error: { cause: string; message: string } },
  Error
> => {
  return useQuery(getUserByNameQueryOptions(userName));
};
