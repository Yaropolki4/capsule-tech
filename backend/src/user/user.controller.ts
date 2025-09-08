import {
  Controller,
  Param,
  Patch,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserRepository } from './user.repository';
import { AccessTokenPayload } from 'src/auth/types/access-token-payload';
import { MeResponseDto } from '@capsule/common';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
  ) {}

  @Get('me')
  public async me(@Req() req: Request): Promise<MeResponseDto> {
    const userPayload = req.user as AccessTokenPayload;
    const user = await this.userRepository.findByEmail(userPayload.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;

    return await this.userService.update(id, body, user.email);
  }

  @Patch(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  public async updateAvatar(
    @Param('id') id: string,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const user = req.user as User;

    return await this.userService.updateAvatar(id, file, user.email);
  }
}
