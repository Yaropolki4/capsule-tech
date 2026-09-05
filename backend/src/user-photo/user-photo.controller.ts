import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { UserPhotoService } from './user-photo.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AccessTokenPayload } from 'src/auth/types/access-token-payload';
import { ValidatedUploadedFile } from 'src/shared/validation/create-parse-pipe-validator';
import {
  UploadUserPhotoResponseDto,
  GetUserPhotosResponseDto,
} from '@capsule/common';

@Controller('user-photos')
@UseGuards(JwtGuard)
export class UserPhotoController {
  constructor(private readonly userPhotoService: UserPhotoService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @ValidatedUploadedFile()
    file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<UploadUserPhotoResponseDto> {
    const user = req.user as AccessTokenPayload;
    const photo = await this.userPhotoService.upload(file, user.id);

    return {
      id: photo.id,
      imageUrl: photo.imageUrl,
      createdAt: photo.createdAt.toISOString(),
    };
  }

  @Get()
  async findAll(@Req() req: Request): Promise<GetUserPhotosResponseDto> {
    const user = req.user as AccessTokenPayload;
    const photos = await this.userPhotoService.findByUserId(user.id);

    return photos.map((photo) => ({
      id: photo.id,
      imageUrl: photo.imageUrl,
      createdAt: photo.createdAt.toISOString(),
    }));
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const user = req.user as AccessTokenPayload;

    await this.userPhotoService.remove(id, user.id);
  }
}
