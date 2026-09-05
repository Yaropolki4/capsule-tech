import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { TryOnService } from './try-on.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AccessTokenPayload } from 'src/auth/types/access-token-payload';
import { ZodValidationPipe } from 'src/shared/validation/zod-validation.pipe';
import {
  createTryOnRequestDtoSchema,
  CreateTryOnRequestDto,
  CreateTryOnResponseDto,
  GetTryOnsResponseDto,
} from '@capsule/common';

type TryOnWithRelations = Prisma.TryOnGetPayload<{
  include: {
    userPhoto: { select: { id: true; imageUrl: true } };
    capsule: { select: { id: true; name: true; thumbnailUrl: true } };
    clothes: {
      select: { id: true; imageUrl: true; brand: true; category: true };
    };
  };
}>;

const toTryOnDto = (tryOn: TryOnWithRelations): CreateTryOnResponseDto => ({
  id: tryOn.id,
  resultImageUrl: tryOn.resultImageUrl,
  createdAt: tryOn.createdAt.toISOString(),
  userPhoto: { id: tryOn.userPhoto.id, imageUrl: tryOn.userPhoto.imageUrl },
  capsule: tryOn.capsule
    ? {
        id: tryOn.capsule.id,
        name: tryOn.capsule.name ?? undefined,
        thumbnailUrl: tryOn.capsule.thumbnailUrl,
      }
    : undefined,
  clothes: tryOn.clothes
    ? {
        id: tryOn.clothes.id,
        imageUrl: tryOn.clothes.imageUrl,
        brand: tryOn.clothes.brand,
        category: tryOn.clothes.category,
      }
    : undefined,
});

@Controller('try-on')
@UseGuards(JwtGuard)
export class TryOnController {
  constructor(private readonly tryOnService: TryOnService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createTryOnRequestDtoSchema))
    body: CreateTryOnRequestDto,
    @Req() req: Request,
  ): Promise<CreateTryOnResponseDto> {
    const user = req.user as AccessTokenPayload;
    const tryOn = await this.tryOnService.create(body, user.id);

    return toTryOnDto(tryOn);
  }

  @Get()
  async findAll(@Req() req: Request): Promise<GetTryOnsResponseDto> {
    const user = req.user as AccessTokenPayload;
    const tryOns = await this.tryOnService.findByUserId(user.id);

    return tryOns.map(toTryOnDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const user = req.user as AccessTokenPayload;

    await this.tryOnService.remove(id, user.id);
  }
}
