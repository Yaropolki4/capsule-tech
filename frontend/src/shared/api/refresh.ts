import { z } from "zod";
import type { AccessToken } from "./types";
import { sessionStore } from "./session.store";

const refreshResponseSchema = z.object({
  accessToken: z.string(),
});

const deserializeRefreshData = (data: unknown): AccessToken => {
  return {
    accessToken: refreshResponseSchema.parse(data).accessToken,
  };
};

async function getNewAccessToken(
  tokenPromise: () => Promise<{ data: unknown }>
): Promise<
  | {
      error: null;
      data: AccessToken;
    }
  | {
      error: unknown;
      data: null;
    }
> {
  try {
    const data = (await tokenPromise()).data;

    return {
      error: null,
      data: deserializeRefreshData(data),
    };
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

export const refresh = async (
  tokenPromise: () => Promise<{ data: unknown }>
) => {
  const result = await getNewAccessToken(tokenPromise);

  if (result.data) {
    sessionStore.getState().setAccessToken(result.data.accessToken);
  }

  return result;
};
