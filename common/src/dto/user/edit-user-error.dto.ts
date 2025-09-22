import { z } from "zod";

export const EDIT_USER_ERROR_CAUSES = ["name"] as const;

export const editUserErrorDtoSchema = z.object({
  message: z.string(),
  cause: z.union(EDIT_USER_ERROR_CAUSES.map((cause) => z.literal(cause))),
});

export type EditUserErrorDto = z.infer<typeof editUserErrorDtoSchema>;
