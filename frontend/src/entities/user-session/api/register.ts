import { httpTransport, isClientError } from "@/shared/api/http-transport";
import type { RegisterData, User } from "../model/types";
import type { AccessToken } from "@/shared/api/types";
import { HttpError } from "@/shared/api/http-error";
import {
  registerErrorDtoSchema,
  type RegisterErrorDto,
  registerDtoResponseSchema,
  type RegisterDtoRequest,
} from "@capsule/common";

const serializeRegisterData = (data: RegisterData): RegisterDtoRequest => {
  return data;
};

const deserializeRegisterData = (
  data: unknown
): AccessToken & { user: User } => {
  return registerDtoResponseSchema.parse(data);
};

const deserializeRegisterError = (data: unknown): RegisterErrorDto => {
  return registerErrorDtoSchema.parse(data);
};

type RegisterResult =
  | {
      error: null;
      data: AccessToken & { user: User };
    }
  | {
      error: {
        cause: RegisterErrorDto["cause"] | "server";
        message: RegisterErrorDto["message"];
      };
      data: null;
    };

export async function register(data: RegisterData): Promise<RegisterResult> {
  try {
    return {
      error: null,
      data: deserializeRegisterData(
        await httpTransport.post("/auth/register", {
          json: serializeRegisterData(data),
        })
      ),
    };
  } catch (error) {
    try {
      if (error instanceof HttpError && isClientError(error)) {
        return {
          error: deserializeRegisterError(error.data),
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
