import type { Clothes } from "../model/types";
import { httpTransport } from "@/shared/api/http-transport";
import { createClothesResponseDtoSchema } from "@capsule/common";

function deserializeClothes(clothes: unknown): Clothes {
  const parsed = createClothesResponseDtoSchema.parse(clothes);

  return {
    id: parsed.id,
    brand: parsed.brand,
    category: parsed.category,
    imageUrl: parsed.imageUrl,
    createdById: parsed.createdById,
    sourceUrl: parsed.sourceUrl,
  };
}

export const createClothes = async (data: FormData) => {
  const response = deserializeClothes(
    await httpTransport.post("/clothes", {
      json: data,
      params: {
        withAuth: true,
      },
    })
  );

  return response;
};
