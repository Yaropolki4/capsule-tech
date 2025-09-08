import { httpTransport } from "@/shared/api/http-transport";
import { resetAccessToken } from "@/shared/api/session.store";
import { resetUser } from "../model/user.store";

export async function logout() {
  try {
    await httpTransport.post("/auth/logout", {
      withCredentials: true,
    });

    resetAccessToken();
    resetUser();
  } catch {
    return {
      error: {
        message: "Ошибка сервера, попробуйте позже",
      },
    };
  }
}
