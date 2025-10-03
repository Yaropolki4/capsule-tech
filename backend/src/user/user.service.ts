import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { CreateUser } from './types';
import { UserRepository } from './user.repository';
import { EditUserRequestDto, EditUserResponseDto } from '@capsule/common';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
  ) {}

  async create(user: CreateUser) {
    return this.userRepository.create(user);
  }

  async update(
    userToUpdateName: string,
    data: EditUserRequestDto & { avatarUrl?: string },
    email: string,
  ): Promise<EditUserResponseDto> {
    const user = await this.userRepository.findByName(userToUpdateName);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.email !== email) {
      throw new ForbiddenException('Ошибка доступа');
    }

    const userToUpdate = await this.userRepository.findByName(userToUpdateName);

    if (!userToUpdate) {
      throw new BadRequestException({
        message: 'Пользователь не найден',
        cause: 'name',
      });
    }

    const newUserName = data.name;

    if (!newUserName) {
      const updatedUser = await this.userRepository.update(
        userToUpdateName,
        data,
      );

      return {
        name: updatedUser.name,
      };
    }

    const possibleUserWithNewName =
      await this.userRepository.findByName(newUserName);

    if (!possibleUserWithNewName) {
      const updatedUser = await this.userRepository.update(
        userToUpdateName,
        data,
      );

      return {
        name: updatedUser.name,
      };
    }

    if (possibleUserWithNewName.id !== userToUpdate.id) {
      throw new BadRequestException({
        message: 'Пользователь с таким именем уже существует',
        cause: 'name',
      });
    }

    const updatedUser = await this.userRepository.update(
      userToUpdateName,
      data,
    );

    return {
      name: updatedUser.name,
    };
  }

  async updateAvatar(name: string, file: Express.Multer.File, email: string) {
    const user = await this.userRepository.findByName(name);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email !== email) {
      throw new ForbiddenException();
    }

    try {
      const avatarUrl = await this.s3Service.uploadAvatar(
        crypto.randomUUID(),
        file.buffer,
        file.mimetype,
        user.avatarUrl,
      );

      return avatarUrl;
    } catch {
      throw new InternalServerErrorException('Failed to upload avatar');
    }
  }
}
