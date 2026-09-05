import { httpTransport } from "@/shared/api/http-transport";
import { createTryOnResponseDtoSchema } from "@capsule/common";
import type { TryOn } from "../model/types";

function deserializeTryOn(data: unknown): TryOn {
  return createTryOnResponseDtoSchema.parse(data);
}

export const createTryOn = async (data: {
  userPhotoId: string;
  clothesId?: string;
  capsuleId?: string;
}) => {
  return deserializeTryOn(
    await httpTransport.post("/try-on", {
      json: data,
      params: {
        withAuth: true,
      },
    })
  );
};
