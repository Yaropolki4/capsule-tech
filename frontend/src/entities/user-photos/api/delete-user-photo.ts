import { httpTransport } from "@/shared/api/http-transport";

export const deleteUserPhoto = async (id: string) => {
  await httpTransport.delete(`/user-photos/${id}`, {
    params: {
      withAuth: true,
    },
  });
};
