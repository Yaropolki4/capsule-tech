import { httpTransport } from "@/shared/api/http-transport";
import type { User } from "../model/types";
import { meResponseDtoSchema } from "@capsule/common";

const deserializeGetMeData = (data: unknown): User => {
  return meResponseDtoSchema.parse(data);
};

export async function getMe() {
  try {
    return {
      error: null,
      data: deserializeGetMeData(
        await httpTransport.get("/user/me", {
          params: {
            withAuth: true,
          },
        })
      ),
    };
  } catch {
    return {
      error: {
        message: "Ошибка сервера, попробуйте позже",
      },
      data: null,
    };
  }
}
