import { httpTransport } from "@/shared/api/http-transport";
import { getBalancesResponseDtoSchema } from "@capsule/common";
import type { TokenBalances } from "../model/types";

function deserializeBalances(data: unknown): TokenBalances {
  const parsed = getBalancesResponseDtoSchema.parse(data);

  return { chat: parsed.chat, photo: parsed.photo };
}

export async function getTokenBalances(): Promise<TokenBalances> {
  return deserializeBalances(
    await httpTransport.get("/billing/balances", {
      params: { withAuth: true },
    })
  );
}
