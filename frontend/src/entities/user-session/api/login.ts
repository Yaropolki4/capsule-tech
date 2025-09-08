import type { LoginDto } from "@/shared/api/dto/login.dto";
import { httpTransport, isClientError } from "@/shared/api/http-transport";
import type { LoginData, User } from "../model/types";
import type { AccessToken } from "@/shared/api/types";
import { HttpError } from "@/shared/api/http-error";
import { z } from "zod";
import { AUTH_ERROR_CAUSES } from "../model/constants";
import { userSchema } from "../model/user.schema";

export const serializeLoginData = (data: LoginData): LoginDto => {
  return {
    email: data.email,
    password: data.password,
  };
};

const loginResponseSchema = z.object({
  access_token: z.string(),
  user: userSchema,
});

const loginErrorDataSchema = z.object({
  message: z.string(),
  cause: z.union(AUTH_ERROR_CAUSES.map((cause) => z.literal(cause))),
});

type LoginDataError = z.infer<typeof loginErrorDataSchema>;

const deserializeLoginData = (data: unknown): AccessToken & { user: User } => {
  const parsedData = loginResponseSchema.parse(data);

  return {
    accessToken: parsedData.access_token,
    user: parsedData.user,
  };
};

const deserializeLoginError = (data: unknown): LoginDataError => {
  return loginErrorDataSchema.parse(data);
};

type LoginResult =
  | {
      error: null;
      data: AccessToken & { user: User };
    }
  | {
      error: {
        cause: LoginDataError["cause"] | "server";
        message: LoginDataError["message"];
      };
      data: null;
    };

export async function login(data: LoginData): Promise<LoginResult> {
  try {
    return {
      error: null,
      data: deserializeLoginData(
        await httpTransport.post("/auth/login", {
          json: serializeLoginData(data),
          withCredentials: true,
        })
      ),
    };
  } catch (error) {
    try {
      if (error instanceof HttpError && isClientError(error)) {
        return {
          error: deserializeLoginError(error.data),
          data: null,
        };
      } else {
        return {
          error: {
            cause: "server",
            message: "Ошибка сервера, попробуйте позже",
          },
          data: null,
        };
      }
    } catch {
      return {
        error: {
          cause: "server",
          message: "Ошибка сервера, попробуйте позже",
        },
        data: null,
      };
    }
  }
}
