import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import {
  CreateClothesRequestDto,
  UpdateClothesRequestDto,
} from '@capsule/common';
import { UserRepository } from 'src/user/user.repository';
import { ClothesRepository } from './clothes.repository';
import { HttpClientService } from 'src/http/http-client.service';

@Injectable()
export class ClothesService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
    private readonly clothesRepository: ClothesRepository,
    private readonly httpClientService: HttpClientService,
  ) {}

  async create(
    createItemDto: CreateClothesRequestDto,
    email: string,
    file: Express.Multer.File,
  ) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const fileId = crypto.randomUUID();

    const imageUrl = await this.s3Service.uploadClothes(
      fileId,
      file.buffer,
      file.mimetype,
    );

    const item = await this.clothesRepository.create({
      brand: createItemDto.brand,
      category: createItemDto.category,
      imageUrl,
      createdById: user.id,
    });

    return item;
  }

  async findAll(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return await this.clothesRepository.getUserClothes(user.id);
  }

  async removeBg(file: Express.Multer.File) {
    return this.httpClientService.removeBackground(file);
  }

  findOne(id: number) {
    return `This action returns a #${id} item`;
  }

  update(id: number, updateItemDto: UpdateClothesRequestDto) {
    // TODO: Implement update logic
    console.log('Updating item:', id, updateItemDto);
    return `This action updates a #${id} item`;
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }
}
