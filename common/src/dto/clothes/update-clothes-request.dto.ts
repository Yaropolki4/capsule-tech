import { z } from "zod";
import { createClothesRequestDtoSchema } from "./create-clothes-request.dto";

export const updateClothesRequestDtoSchema =
  createClothesRequestDtoSchema.partial();

export type UpdateClothesRequestDto = z.infer<
  typeof updateClothesRequestDtoSchema
>;
