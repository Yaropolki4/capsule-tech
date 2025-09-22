import { httpTransport } from "@/shared/api/http-transport";
import { z } from "zod";

export const removeBackground = async (file: FormData) => {
  const response = z
    .object({
      data: z.array(z.number()),
      type: z.literal("Buffer"),
    })
    .parse(
      await httpTransport.post("/clothes/remove-bg", {
        json: file,
        params: {
          withAuth: true,
        },
      })
    );

  return new File([Buffer.from(response.data)], "image.png", {
    type: "image/png",
  });
};
