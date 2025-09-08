import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createItemDto: CreateItemDto,
    email: string,
    file: Express.Multer.File,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const item = await this.prisma.item.create({
      data: {
        name: createItemDto.name,
        brand: createItemDto.brand,
        category: createItemDto.category,
        createdById: user.id,
      },
    });

    await this.s3Service.uploadItem(item.id, file.buffer, file.mimetype);

    return item;
  }

  async findAll(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.item.findMany({
      where: { createdById: user.id },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} item`;
  }

  update(id: number, updateItemDto: UpdateItemDto) {
    // TODO: Implement update logic
    console.log('Updating item:', id, updateItemDto);
    return `This action updates a #${id} item`;
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }
}
