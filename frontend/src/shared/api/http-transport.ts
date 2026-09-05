import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { HttpError } from "./http-error";
import { AbortError } from "./abort-error";
import { isNumber } from "lodash-es";
import { getAccessToken, isAccessTokenExpired } from "./session.store";
import { refresh } from "./refresh";
import type { AccessToken } from "./types";

interface HttpTransportOptions {
  retryCount?: number;
  prefixUrl?: string;
  timeout?: number;
}

interface RequestOptions {
  json?: unknown;
  searchParams?: Record<string, string | number>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  withCredentials?: boolean;
  params?: {
    searchParams?: Record<string, string | number>;
    withAuth?: boolean;
  };
}

const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 30000;

export class HttpTransport {
  private client: AxiosInstance;
  private retryCount: number;

  constructor(
    options: HttpTransportOptions = {},
    private adapter: {
      getAccessToken: () => string;
      isAccessTokenExpired: () => boolean;
      refreshTokens: (
        tokenPromise: () => Promise<{ data: unknown }>
      ) => Promise<
        | {
            error: null;
            data: AccessToken;
          }
        | {
            error: unknown;
            data: null;
          }
      >;
    }
  ) {
    this.retryCount = options.retryCount || DEFAULT_RETRY_COUNT;

    this.client = axios.create({
      baseURL: options.prefixUrl,
      timeout: options.timeout || DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (
          error.code === "ECONNABORTED" &&
          error.message.includes("timeout")
        ) {
          throw new HttpError("Request timeout", {
            status: 408,
          });
        }

        if (axios.isCancel(error)) {
          throw new AbortError("Request was cancelled");
        }

        if (error.response) {
          throw new HttpError(error.response.data?.message || error.message, {
            status: error.response.status,
            data: error.response.data,
            message: error.response.data?.message,
          });
        }

        throw error;
      }
    );

    this.client.interceptors.request.use(async (config) => {
      const newConfig = { ...config };
      newConfig.params = { ...config.params?.searchParams };

      if (config.data instanceof FormData) {
        newConfig.headers["Content-Type"] = "multipart/form-data";
      }

      if (config.params?.searchParams) {
        newConfig.params = config.params.searchParams;
      }

      if (!config.params?.withAuth) {
        return newConfig;
      }

      if (this.adapter.isAccessTokenExpired()) {
        try {
          await this.adapter.refreshTokens(() =>
            this.client.post("/auth/refresh", undefined, {
              withCredentials: true,
            })
          );
        } catch {
          throw new HttpError("Failed to refresh access token", {
            status: 401,
          });
        }
      }

      newConfig.headers.Authorization = `Bearer ${this.adapter.getAccessToken()}`;

      return newConfig;
    });
  }

  private async executeWithRetry<T>(
    operation: () => Promise<AxiosResponse<T>>,
    retryCount = this.retryCount
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await operation();

        return response.data;
      } catch (error) {
        lastError = error as Error;

        // Не пытаемся повторить запрос в случае ошибок клиента (4xx) или отмены
        if (
          error instanceof HttpError &&
          error.params &&
          typeof error.params === "object" &&
          "status" in error.params
        ) {
          if (isClientError(error)) {
            throw error;
          }
        }

        if (error instanceof AbortError) {
          throw error;
        }

        // Если это последняя попытка, выбрасываем ошибку
        if (attempt === retryCount) {
          throw lastError;
        }

        // Задержка перед повторной попыткой (экспоненциальная задержка)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    throw lastError!;
  }

  private buildConfig(options?: RequestOptions): AxiosRequestConfig {
    const config: AxiosRequestConfig = {};

    if (options?.headers) {
      config.headers = options.headers;
    }

    if (options?.searchParams) {
      config.params = options.searchParams;
    }

    if (options?.signal) {
      config.signal = options.signal;
    }

    if (options?.withCredentials) {
      config.withCredentials = options.withCredentials;
    }

    if (options?.params) {
      config.params = options.params;
    }

    return config;
  }

  public async get<T = unknown>(
    url: string,
    options?: RequestOptions
  ): Promise<T> {
    const config = this.buildConfig(options);

    return this.executeWithRetry(() => this.client.get<T>(url, config));
  }

  public async post<T = unknown>(
    url: string,
    options?: RequestOptions
  ): Promise<T> {
    const config = this.buildConfig(options);

    return this.executeWithRetry(() =>
      this.client.post<T>(url, options?.json, config)
    );
  }

  public async patch<T = unknown>(
    url: string,
    options?: RequestOptions
  ): Promise<T> {
    const config = this.buildConfig(options);

    return this.executeWithRetry(() =>
      this.client.patch<T>(url, options?.json, config)
    );
  }

  public async delete<T = unknown>(
    url: string,
    options?: RequestOptions
  ): Promise<T> {
    const config = this.buildConfig(options);

    return this.executeWithRetry(() => this.client.delete<T>(url, config));
  }

  public async put<T = unknown>(
    url: string,
    options?: RequestOptions
  ): Promise<T> {
    const config = this.buildConfig(options);

    return this.executeWithRetry(() =>
      this.client.put<T>(url, options?.json, config)
    );
  }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555";

export const httpTransport = new HttpTransport(
  { prefixUrl: API_BASE_URL },
  {
    getAccessToken,
    isAccessTokenExpired,
    refreshTokens: refresh,
  }
);

export function isClientError(
  error: HttpError
): error is HttpError & { params: { status: number } } {
  return (
    error instanceof HttpError &&
    "status" in error.params &&
    isNumber(error.params.status) &&
    error.params.status >= 400 &&
    error.params.status < 500
  );
}
