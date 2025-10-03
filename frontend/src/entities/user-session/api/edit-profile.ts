import { httpTransport, isClientError } from "@/shared/api/http-transport";
import type { EditUserErrorDto } from "@capsule/common";
import {
  editUserErrorDtoSchema,
  editUserResponseDtoSchema,
} from "@capsule/common";
import type { User } from "../model/types";
import { HttpError } from "@/shared/api/http-error";

function deserializeEditProfileData(data: unknown): Pick<User, "name"> {
  const response = editUserResponseDtoSchema.parse(data);

  return {
    name: response.name,
  };
}

function deserializeEditProfileError(data: unknown): EditUserErrorDto {
  return editUserErrorDtoSchema.parse(data);
}

export async function editProfile(
  username: string,
  data: FormData
): Promise<
  | { error: null; data: Pick<User, "name"> }
  | {
      error: {
        cause: EditUserErrorDto["cause"] | "server";
        message: EditUserErrorDto["message"];
      };
      data: null;
    }
> {
  try {
    return {
      error: null,
      data: deserializeEditProfileData(
        await httpTransport.patch(`/user/${username}`, {
          json: data,
          params: {
            withAuth: true,
          },
        })
      ),
    };
  } catch (error) {
    try {
      if (error instanceof HttpError && isClientError(error)) {
        return {
          error: deserializeEditProfileError(error.data),
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
