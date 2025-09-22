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
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserRepository } from './user.repository';
import { AccessTokenPayload } from 'src/auth/types/access-token-payload';
import {
  editUserRequestDtoSchema,
  GetUserByNameResponseDto,
  MeResponseDto,
  EditUserRequestDto,
} from '@capsule/common';
import { ZodValidationPipe } from 'src/shared/validation/zod-validation.pipe';
import { ValidatedUploadedFile } from 'src/shared/validation/create-parse-pipe-validator';

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

    return {
      id: user.id,
      email: user.email,
      bio: user.bio,
      capsulesQuantity: user.capsulesQuantity,
      fullName: user.fullName,
      name: user.name,
      avatarUrl: user.avatarUrl ?? undefined,
    };
  }

  @Get('by-name/:id')
  public async get(@Param('id') id: string): Promise<GetUserByNameResponseDto> {
    const user = await this.userRepository.findByName(id);

    if (!user) {
      throw new NotFoundException();
    }

    return {
      id: user.id,
      name: user.name,
      fullName: user.fullName,
      bio: user.bio,
      capsulesQuantity: user.capsulesQuantity,
      avatarUrl: user.avatarUrl ?? undefined,
    };
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  public async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(editUserRequestDtoSchema))
    body: EditUserRequestDto,
    @Req() req: Request,
    @ValidatedUploadedFile()
    file?: Express.Multer.File,
  ) {
    const user = req.user as AccessTokenPayload;

    const currentUser = await this.userRepository.findByEmail(user.email);

    if (!currentUser) {
      throw new UnauthorizedException();
    }

    const newAvatarUrl = file
      ? await this.userService.updateAvatar(id, file, user.email)
      : undefined;

    return await this.userService.update(
      id,
      { ...body, avatarUrl: newAvatarUrl },
      user.email,
    );
  }

  @Patch(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  public async updateAvatar(
    @Param('id') id: string,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5,
            message: 'Слишком большой файл',
          }),
          new FileTypeValidator({
            fileType: /(image\/jpeg|image\/png|image\/jpg)/,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const user = req.user as User;
    console.log(file.mimetype);

    return await this.userService.updateAvatar(id, file, user.email);
  }
}
