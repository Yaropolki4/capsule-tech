import { httpTransport } from "@/shared/api/http-transport";

export const deleteCapsule = async (id: string) => {
  await httpTransport.delete(`/capsule/${id}`, {
    params: {
      withAuth: true,
    },
  });
};
