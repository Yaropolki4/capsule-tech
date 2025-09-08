type Constructor<T> = {
  new (...args: unknown[]): T;
};

export class BaseError extends Error {
  public params: object;

  constructor(message: string, params: object = {}) {
    super(message, params);
    this.params = params;
  }

  public static is<E extends Error>(
    this: Constructor<E>,
    error: unknown
  ): error is E {
    return error instanceof this;
  }
}
