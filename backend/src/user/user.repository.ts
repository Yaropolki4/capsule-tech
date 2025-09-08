import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUser } from './types';
import { UpdateUserDto } from './dto/update-user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByName(name: string) {
    return this.prisma.user.findUnique({
      where: { name },
    });
  }

  async create(user: CreateUser) {
    return this.prisma.user.create({
      data: user,
    });
  }

  async update(name: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { name },
      data,
    });
  }

  async updateAvatar(name: string, file: Express.Multer.File) {
    return this.prisma.user.update({
      where: { name },
      data: { avatarUrl: file.filename },
    });
  }
}
