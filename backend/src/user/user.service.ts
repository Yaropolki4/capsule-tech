import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { S3Service } from 'src/s3/s3.service';
import { CreateUser } from './types';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
  ) {}

  async create(user: CreateUser) {
    return this.userRepository.create(user);
  }

  async update(name: string, data: UpdateUserDto, email: string) {
    const user = await this.userRepository.findByName(name);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email !== email) {
      throw new ForbiddenException();
    }

    return this.userRepository.update(name, data);
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
      await this.s3Service.uploadAvatar(user.id, file.buffer, file.mimetype);
    } catch {
      throw new InternalServerErrorException('Failed to upload avatar');
    }
  }
}
