import { z } from "zod";

export const REGISTER_ERROR_CAUSES = ["email", "password", "name"] as const;

export const registerErrorDtoSchema = z.object({
  message: z.string(),
  cause: z.union(REGISTER_ERROR_CAUSES.map((cause) => z.literal(cause))),
});

export type RegisterErrorDto = z.infer<typeof registerErrorDtoSchema>;
