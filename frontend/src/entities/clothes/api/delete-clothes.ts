import { httpTransport } from "@/shared/api/http-transport";

export const deleteClothes = async (id: string) => {
  await httpTransport.delete(`/clothes/${id}`, {
    params: {
      withAuth: true,
    },
  });
};
