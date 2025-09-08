import { BaseError } from "@/shared/lib/errors/base-error";

export class AbortError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}
