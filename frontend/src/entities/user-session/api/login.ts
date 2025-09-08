import { httpTransport, isClientError } from "@/shared/api/http-transport";
import type { LoginData, User } from "../model/types";
import type { AccessToken } from "@/shared/api/types";
import { HttpError } from "@/shared/api/http-error";
import {
  loginDtoResponseSchema,
  type LoginErrorDto,
  loginErrorDtoSchema,
  type LoginDtoRequest,
} from "@capsule/common";

export const serializeLoginData = (data: LoginData): LoginDtoRequest => {
  return data;
};

const deserializeLoginData = (data: unknown): AccessToken & { user: User } => {
  return loginDtoResponseSchema.parse(data);
};

const deserializeLoginError = (data: unknown): LoginErrorDto => {
  return loginErrorDtoSchema.parse(data);
};

type LoginResult =
  | {
      error: null;
      data: AccessToken & { user: User };
    }
  | {
      error: {
        cause: LoginErrorDto["cause"] | "server";
        message: LoginErrorDto["message"];
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
