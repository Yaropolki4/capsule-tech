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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClothesService } from './clothes.service';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ZodValidationPipe } from 'src/shared/validation/zod-validation.pipe';
import {
  createClothesFromWildberriesRequestDtoSchema,
  CreateClothesFromWildberriesRequestDto,
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
    @Req() req: Request,
    @ValidatedUploadedFile()
    file: Express.Multer.File,
  ): Promise<CreateClothesResponseDto> {
    const user = req.user as AccessTokenPayload;

    const item = await this.clothesService.create(user.email, file);

    return {
      id: item.id,
      brand: item.brand,
      category: item.category,
      imageUrl: item.imageUrl,
      createdById: item.createdById,
      sourceUrl: item.sourceUrl,
    };
  }

  @Post('from-wildberries')
  async createFromWildberries(
    @Body(new ZodValidationPipe(createClothesFromWildberriesRequestDtoSchema))
    createItemDto: CreateClothesFromWildberriesRequestDto,
    @Req() req: Request,
  ): Promise<CreateClothesResponseDto> {
    const user = req.user as AccessTokenPayload;

    const item = await this.clothesService.createFromWildberries(
      createItemDto,
      user.id,
    );

    return {
      id: item.id,
      brand: item.brand,
      category: item.category,
      imageUrl: item.imageUrl,
      createdById: item.createdById,
      sourceUrl: item.sourceUrl,
    };
  }

  @Get()
  findAll(
    @Query(new ZodValidationPipe(getClothesRequestDtoSchema))
    { userId }: GetClothesRequestDto,
  ): Promise<GetClothesResponseDto> {
    return this.clothesService.getUserClothes(userId);
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
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AccessTokenPayload;

    return this.clothesService.remove(id, user.id);
  }

  @Post(':id/wardrobe')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addToWardrobe(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const user = req.user as AccessTokenPayload;

    await this.clothesService.addToWardrobe(id, user.id);
  }
}
