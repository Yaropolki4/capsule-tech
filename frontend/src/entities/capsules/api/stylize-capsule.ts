import { httpTransport } from "@/shared/api/http-transport";
import { stylizeCapsuleResponseDtoSchema } from "@capsule/common";

export const stylizeCapsule = async (itemImageUrls: string[]) => {
  const response = stylizeCapsuleResponseDtoSchema.parse(
    await httpTransport.post("/capsule/stylize", {
      json: { itemImageUrls },
      params: {
        withAuth: true,
      },
    })
  );

  return response.styledImageUrl;
};
