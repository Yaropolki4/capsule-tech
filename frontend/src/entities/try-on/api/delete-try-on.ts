import { httpTransport } from "@/shared/api/http-transport";

export const deleteTryOn = async (id: string) => {
  await httpTransport.delete(`/try-on/${id}`, {
    params: {
      withAuth: true,
    },
  });
};
