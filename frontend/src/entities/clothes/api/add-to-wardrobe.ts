import { httpTransport } from "@/shared/api/http-transport";

export const addClothesToWardrobe = async (clothesId: string) => {
  await httpTransport.post(`/clothes/${clothesId}/wardrobe`, {
    params: { withAuth: true },
  });
};
