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

export const createClothesFromWildberries = async (item: {
  name: string;
  brand: string | null;
  description: string;
  photo: string;
  url: string;
}) => {
  return deserializeClothes(
    await httpTransport.post("/clothes/from-wildberries", {
      json: item,
      params: { withAuth: true },
    })
  );
};
