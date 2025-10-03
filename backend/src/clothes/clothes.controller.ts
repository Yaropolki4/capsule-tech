import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ClothesService } from './clothes.service';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ZodValidationPipe } from 'src/shared/validation/zod-validation.pipe';
import {
  createClothesRequestDtoSchema,
  CreateClothesRequestDto,
  UpdateClothesRequestDto,
  CreateClothesResponseDto,
  GetClothesResponseDto,
  getClothesRequestDtoSchema,
  GetClothesRequestDto,
} from '@capsule/common';
import { ValidatedUploadedFile } from 'src/shared/validation/create-parse-pipe-validator';
import { AccessTokenPayload } from 'src/auth/types/access-token-payload';

@Controller('clothes')
@UseGuards(JwtGuard)
export class ClothesController {
  constructor(private readonly clothesService: ClothesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body(new ZodValidationPipe(createClothesRequestDtoSchema))
    createItemDto: CreateClothesRequestDto,
    @Req() req: Request,
    @ValidatedUploadedFile()
    file: Express.Multer.File,
  ): Promise<CreateClothesResponseDto> {
    const user = req.user as AccessTokenPayload;

    const item = await this.clothesService.create(
      createItemDto,
      user.email,
      file,
    );

    return {
      brand: item.brand,
      category: item.category,
      imageUrl: item.imageUrl,
      createdById: item.createdById,
    };
  }

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(getClothesRequestDtoSchema))
    { userId }: GetClothesRequestDto,
  ): Promise<GetClothesResponseDto> {
    return (await this.clothesService.getUserClothes(userId)).map(
      (clothes) => ({
        brand: clothes.brand,
        category: clothes.category,
        imageUrl: clothes.imageUrl,
        createdById: clothes.createdById,
      }),
    );
  }

  @Post('remove-bg')
  @UseInterceptors(FileInterceptor('file'))
  removeBg(
    @ValidatedUploadedFile()
    file: Express.Multer.File,
  ) {
    return this.clothesService.removeBg(file);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clothesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateClothesRequestDto,
  ) {
    return this.clothesService.update(+id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clothesService.remove(+id);
  }
}
