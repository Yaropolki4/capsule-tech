import { httpTransport } from "@/shared/api/http-transport";
import { uploadUserPhotoResponseDtoSchema } from "@capsule/common";
import type { UserPhoto } from "../model/types";

function deserializeUserPhoto(data: unknown): UserPhoto {
  return uploadUserPhotoResponseDtoSchema.parse(data);
}

export const uploadUserPhoto = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return deserializeUserPhoto(
    await httpTransport.post("/user-photos", {
      json: formData,
      params: {
        withAuth: true,
      },
    })
  );
};
