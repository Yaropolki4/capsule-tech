import { httpTransport } from "@/shared/api/http-transport";

export const updateAvatar = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    return {
      data: await httpTransport.patch(`/user/${id}/avatar`, {
        json: formData,
        params: {
          withAuth: true,
        },
      }),
    };
  } catch (error) {
    console.error(error);
  }
};
