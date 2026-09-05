import { z } from "zod";
import { chatMessageDtoSchema } from "./shared";

export const getThreadMessagesResponseDtoSchema = z.array(chatMessageDtoSchema);

export type GetThreadMessagesResponseDto = z.infer<
  typeof getThreadMessagesResponseDtoSchema
>;
