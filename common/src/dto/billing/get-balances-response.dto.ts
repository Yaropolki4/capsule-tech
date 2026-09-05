import { z } from "zod";
import { tokenBalanceSchema } from "./shared";

export const getBalancesResponseDtoSchema = z.object({
  chat: tokenBalanceSchema,
  photo: tokenBalanceSchema,
});

export type GetBalancesResponseDto = z.infer<
  typeof getBalancesResponseDtoSchema
>;
