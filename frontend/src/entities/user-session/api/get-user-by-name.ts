import { httpTransport, isClientError } from "@/shared/api/http-transport";
import { getUserByNameResponseDtoSchema } from "@capsule/common";
import type { User } from "../model/types";
import { HttpError } from "@/shared/api/http-error";

function deserializeGetUserData(data: unknown): Omit<User, "email"> {
  return getUserByNameResponseDtoSchema.parse(data);
}

export const getUserByName = async (userName: string, signal?: AbortSignal) => {
  try {
    return {
      data: deserializeGetUserData(
        await httpTransport.get(`/user/by-name/${userName}`, {
          signal,
          params: {
            withAuth: true,
          },
        })
      ),
      error: null,
    };
  } catch (error) {
    if (
      error instanceof HttpError &&
      isClientError(error) &&
      error.params.status === 404
    ) {
      return {
        data: null,
        error: {
          cause: "not_found",
          message: "User not found",
        },
      };
    }

    return {
      data: null,
      error: {
        cause: "server",
        message: "Failed to get user by name",
      },
    };
  }
};
