import { httpTransport } from "@/shared/api/http-transport";
import { getUserPhotosResponseDtoSchema } from "@capsule/common";
import type { UserPhoto } from "../model/types";

function deserializeUserPhotos(data: unknown): UserPhoto[] {
  return getUserPhotosResponseDtoSchema.parse(data);
}

export const getUserPhotos = async () => {
  return deserializeUserPhotos(
    await httpTransport.get("/user-photos", {
      params: {
        withAuth: true,
      },
    })
  );
};
