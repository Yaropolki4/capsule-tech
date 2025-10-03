import { httpTransport } from "@/shared/api/http-transport";
import {
  getClothesResponseDtoSchema,
  type GetClothesRequestDto,
} from "@capsule/common";
import type { Clothes } from "../model/types";

function serializeGetClothesRequestDto(userId: string): GetClothesRequestDto {
  return {
    userId,
  };
}

function deserializeClothes(clothes: unknown): Clothes[] {
  return getClothesResponseDtoSchema.parse(clothes);
}

export const getClothes = async (userId: string) => {
  return deserializeClothes(
    await httpTransport.get("/clothes", {
      params: {
        searchParams: serializeGetClothesRequestDto(userId),
        withAuth: true,
      },
    })
  );
};
