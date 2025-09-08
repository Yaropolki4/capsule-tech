import { z } from "zod";

export const AUTH_ERROR_CAUSES = ["email", "password"] as const;

export const loginErrorDtoSchema = z.object({
  message: z.string(),
  cause: z.union(AUTH_ERROR_CAUSES.map((cause) => z.literal(cause))),
});

export type LoginErrorDto = z.infer<typeof loginErrorDtoSchema>;
