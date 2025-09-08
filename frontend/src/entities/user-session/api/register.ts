import { httpTransport, isClientError } from "@/shared/api/http-transport";
import type { RegisterData, User } from "../model/types";
import type { AccessToken } from "@/shared/api/types";
import { z } from "zod";
import { HttpError } from "@/shared/api/http-error";
import { REGISTER_ERROR_CAUSES } from "../model/constants";
import { userSchema } from "../model/user.schema";

const registerResponseSchema = z.object({
  access_token: z.string(),
  user: userSchema,
});

const registerErrorDataSchema = z.object({
  message: z.string(),
  cause: z.union(REGISTER_ERROR_CAUSES.map((cause) => z.literal(cause))),
});

type RegisterDataError = z.infer<typeof registerErrorDataSchema>;

type RegisterResult =
  | {
      error: null;
      data: AccessToken & { user: User };
    }
  | {
      error: {
        cause: RegisterDataError["cause"] | "server";
        message: RegisterDataError["message"];
      };
      data: null;
    };

const deserializeRegisterData = (
  data: unknown
): AccessToken & { user: User } => {
  return {
    accessToken: registerResponseSchema.parse(data).access_token,
    user: registerResponseSchema.parse(data).user,
  };
};

const deserializeRegisterError = (data: unknown): RegisterDataError => {
  return registerErrorDataSchema.parse(data);
};

export async function register(data: RegisterData): Promise<RegisterResult> {
  try {
    return {
      error: null,
      data: deserializeRegisterData(
        await httpTransport.post("/auth/register", {
          json: data,
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
