import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { CapsuleService } from './capsule.service';
import { S3Service } from 'src/s3/s3.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AccessTokenPayload } from 'src/auth/types/access-token-payload';
import { ZodValidationPipe } from 'src/shared/validation/zod-validation.pipe';
import { ValidatedUploadedFile } from 'src/shared/validation/create-parse-pipe-validator';
import {
  createCapsuleRequestDtoSchema,
  CreateCapsuleRequestDto,
  CreateCapsuleResponseDto,
  GetCapsuleResponseDto,
  getUserCapsulesRequestDtoSchema,
  GetUserCapsulesRequestDto,
  GetUserCapsulesResponseDto,
  UploadCapsuleThumbnailResponseDto,
  stylizeCapsuleRequestDtoSchema,
  StylizeCapsuleRequestDto,
  StylizeCapsuleResponseDto,
} from '@capsule/common';

@Controller('capsule')
@UseGuards(JwtGuard)
export class CapsuleController {
  constructor(
    private readonly capsuleService: CapsuleService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('thumbnail')
  @UseInterceptors(FileInterceptor('file'))
  async uploadThumbnail(
    @ValidatedUploadedFile()
    file: Express.Multer.File,
  ): Promise<UploadCapsuleThumbnailResponseDto> {
    const fileId = crypto.randomUUID();

    const thumbnailUrl = await this.s3Service.uploadCapsuleThumbnail(
      fileId,
      file.buffer,
      file.mimetype,
    );

    return { thumbnailUrl };
  }

  @Post('stylize')
  async stylize(
    @Body(new ZodValidationPipe(stylizeCapsuleRequestDtoSchema))
    body: StylizeCapsuleRequestDto,
    @Req() req: Request,
  ): Promise<StylizeCapsuleResponseDto> {
    const user = req.user as AccessTokenPayload;
    const styledImageUrl = await this.capsuleService.stylize(
      body.itemImageUrls,
      user.id,
    );

    return { styledImageUrl };
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createCapsuleRequestDtoSchema))
    body: CreateCapsuleRequestDto,
    @Req() req: Request,
  ): Promise<CreateCapsuleResponseDto> {
    const user = req.user as AccessTokenPayload;
    const capsule = await this.capsuleService.create(body, user.id);

    return {
      id: capsule.id,
      name: capsule.name ?? undefined,
      thumbnailUrl: capsule.thumbnailUrl,
      public: capsule.public,
      createdById: capsule.createdById,
      createdAt: capsule.createdAt.toISOString(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GetCapsuleResponseDto> {
    const capsule = await this.capsuleService.findById(id);

    return {
      id: capsule.id,
      name: capsule.name ?? undefined,
      thumbnailUrl: capsule.thumbnailUrl,
      public: capsule.public,
      createdAt: capsule.createdAt.toISOString(),
      createdBy: {
        id: capsule.createdBy.id,
        name: capsule.createdBy.name,
        avatarUrl: capsule.createdBy.avatarUrl ?? undefined,
      },
      items: capsule.items.map((item) => ({
        id: item.id,
        clothesId: item.clothesId,
        imageUrl: item.clothes.imageUrl,
        brand: item.clothes.brand,
        category: item.clothes.category,
        x: item.x,
        y: item.y,
        rotation: item.rotation,
        scale: item.scale,
        zIndex: item.zIndex,
      })),
    };
  }

  @Get()
  async findByUserId(
    @Query(new ZodValidationPipe(getUserCapsulesRequestDtoSchema))
    { userId }: GetUserCapsulesRequestDto,
  ): Promise<GetUserCapsulesResponseDto> {
    const capsules = await this.capsuleService.findByUserId(userId);

    return capsules.map((capsule) => ({
      id: capsule.id,
      name: capsule.name ?? undefined,
      thumbnailUrl: capsule.thumbnailUrl,
      public: capsule.public,
      createdById: capsule.createdById,
      createdAt: capsule.createdAt.toISOString(),
    }));
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AccessTokenPayload;

    return this.capsuleService.remove(id, user.id);
  }
}
