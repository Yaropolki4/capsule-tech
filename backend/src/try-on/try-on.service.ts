import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TryOnRepository } from './try-on.repository';
import { CreateTryOnRequestDto } from '@capsule/common';
import { TryOnStylistService } from 'src/llm/try-on-stylist.service';
import { S3Service } from 'src/s3/s3.service';
import { BillingService } from 'src/billing/billing.service';

@Injectable()
export class TryOnService {
  constructor(
    private readonly tryOnRepository: TryOnRepository,
    private readonly tryOnStylistService: TryOnStylistService,
    private readonly s3Service: S3Service,
    private readonly billingService: BillingService,
  ) {}

  async create(dto: CreateTryOnRequestDto, userId: string) {
    const userPhoto = await this.tryOnRepository.findUserPhotoOwnedBy(
      userId,
      dto.userPhotoId,
    );

    if (!userPhoto) {
      throw new BadRequestException('Фото вам не принадлежит');
    }

    let itemImageUrls: string[];

    if (dto.clothesId) {
      const clothes = await this.tryOnRepository.findAccessibleClothesById(
        dto.clothesId,
        userId,
      );

      if (!clothes) {
        throw new NotFoundException('Вещь не найдена');
      }

      itemImageUrls = [clothes.imageUrl];
    } else {
      const capsule = await this.tryOnRepository.findAccessibleCapsuleWithItems(
        dto.capsuleId as string,
        userId,
      );

      if (!capsule) {
        throw new NotFoundException('Капсула не найдена');
      }

      itemImageUrls = capsule.items.map((item) => item.clothes.imageUrl);
    }

    await this.billingService.assertHasBudget(userId, 'PHOTO');

    let buffer: Buffer;
    let mimetype: string;
    let costUsd: number;
    let model: string;

    try {
      ({ buffer, mimetype, costUsd, model } =
        await this.tryOnStylistService.tryOn(
          userPhoto.imageUrl,
          itemImageUrls,
        ));
    } catch {
      throw new InternalServerErrorException('Не удалось выполнить примерку');
    }

    await this.billingService.chargeUsage(userId, 'PHOTO', {
      action: 'try_on',
      model,
      costUsd,
    });

    let resultImageUrl: string;

    try {
      resultImageUrl = await this.s3Service.uploadTryOnResult(
        crypto.randomUUID(),
        buffer,
        mimetype,
      );
    } catch {
      throw new InternalServerErrorException('Не удалось выполнить примерку');
    }

    return this.tryOnRepository.create({
      userId,
      userPhotoId: userPhoto.id,
      capsuleId: dto.capsuleId,
      clothesId: dto.clothesId,
      resultImageUrl,
    });
  }

  findByUserId(userId: string) {
    return this.tryOnRepository.findManyByUserId(userId);
  }

  async remove(id: string, userId: string) {
    const tryOn = await this.tryOnRepository.findById(id);

    if (!tryOn) {
      throw new NotFoundException('Примерка не найдена');
    }

    if (tryOn.userId !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужую примерку');
    }

    await this.tryOnRepository.deleteById(id);
  }
}
