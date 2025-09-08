import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<unknown>) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);

      return parsedValue;
    } catch (error: unknown) {
      if (error instanceof ZodError && error.issues.length > 0) {
        throw new BadRequestException({
          message: error.issues[0].message,
          cause: error.issues[0].path[0],
        });
      }
      throw new BadRequestException('Ошибка валидации');
    }
  }
}
