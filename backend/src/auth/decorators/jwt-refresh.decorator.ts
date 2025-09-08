import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtRefreshGuard } from '../guards/jwt-refresh-guard';

export const JwtRefresh = () => {
  return applyDecorators(
    SetMetadata('isPublic', true),
    UseGuards(JwtRefreshGuard),
  );
};
