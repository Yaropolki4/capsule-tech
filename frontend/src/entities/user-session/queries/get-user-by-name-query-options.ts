import { queryOptions } from "@tanstack/react-query";
import { getUserByName } from "../api/get-user-by-name";

export const getUserByNameQueryOptions = (userName: string) =>
  queryOptions({
    queryKey: ["user", userName],
    queryFn: async ({ signal }) => await getUserByName(userName, signal),
  });
