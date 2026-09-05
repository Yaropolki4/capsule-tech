import { httpTransport } from "@/shared/api/http-transport";
import {
  getUserCapsulesResponseDtoSchema,
  type GetUserCapsulesRequestDto,
} from "@capsule/common";
import type { Capsule } from "../model/types";

function serializeGetUserCapsulesRequestDto(
  userId: string
): GetUserCapsulesRequestDto {
  return { userId };
}

function deserializeCapsules(capsules: unknown): Capsule[] {
  return getUserCapsulesResponseDtoSchema.parse(capsules);
}

export const getUserCapsules = async (userId: string) => {
  return deserializeCapsules(
    await httpTransport.get("/capsule", {
      params: {
        searchParams: serializeGetUserCapsulesRequestDto(userId),
        withAuth: true,
      },
    })
  );
};
