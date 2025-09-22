import { httpTransport } from "@/shared/api/http-transport";
import { getClothesResponseDtoSchema } from "@capsule/common";
import type { Clothes } from "../model/types";

function deserializeClothes(clothes: unknown): Clothes[] {
  return getClothesResponseDtoSchema.parse(clothes);
}

export const getClothes = async () => {
  return deserializeClothes(
    await httpTransport.get("/clothes", {
      params: {
        withAuth: true,
      },
    })
  );
};
