import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserPhotoRepository } from './user-photo.repository';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class UserPhotoService {
  constructor(
    private readonly userPhotoRepository: UserPhotoRepository,
    private readonly s3Service: S3Service,
  ) {}

  async upload(file: Express.Multer.File, userId: string) {
    const imageUrl = await this.s3Service.uploadUserPhoto(
      crypto.randomUUID(),
      file.buffer,
      file.mimetype,
    );

    return this.userPhotoRepository.create({ imageUrl, userId });
  }

  findByUserId(userId: string) {
    return this.userPhotoRepository.findManyByUserId(userId);
  }

  async remove(id: string, userId: string) {
    const photo = await this.userPhotoRepository.findById(id);

    if (!photo) {
      throw new NotFoundException('Фото не найдено');
    }

    if (photo.userId !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужое фото');
    }

    await this.userPhotoRepository.deleteById(id);
  }
}
