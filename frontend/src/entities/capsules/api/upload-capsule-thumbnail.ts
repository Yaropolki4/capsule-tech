import { httpTransport } from "@/shared/api/http-transport";
import { uploadCapsuleThumbnailResponseDtoSchema } from "@capsule/common";

export const uploadCapsuleThumbnail = async (file: Blob) => {
  const formData = new FormData();
  formData.append("file", file, "thumbnail.png");

  const response = uploadCapsuleThumbnailResponseDtoSchema.parse(
    await httpTransport.post("/capsule/thumbnail", {
      json: formData,
      params: {
        withAuth: true,
      },
    })
  );

  return response.thumbnailUrl;
};
