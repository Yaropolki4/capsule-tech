import { BaseError } from "@/shared/lib/errors/base-error";

export class HttpError extends BaseError {
  public visible: boolean;
  public data: unknown;

  constructor(
    message: string,
    params: {
      status?: number;
      message?: string;
      stack?: string;
      visible?: boolean;
      data?: unknown;
    }
  ) {
    super(message, params);
    this.visible = params.visible ?? true;
    this.data = params.data;
  }
}
