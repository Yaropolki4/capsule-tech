import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CapsuleRepository } from './capsule.repository';
import { CreateCapsuleRequestDto } from '@capsule/common';
import { CapsuleStylistService } from 'src/llm/capsule-stylist.service';
import { S3Service } from 'src/s3/s3.service';
import { BillingService } from 'src/billing/billing.service';

@Injectable()
export class CapsuleService {
  constructor(
    private readonly capsuleRepository: CapsuleRepository,
    private readonly capsuleStylistService: CapsuleStylistService,
    private readonly s3Service: S3Service,
    private readonly billingService: BillingService,
  ) {}

  async stylize(itemImageUrls: string[], userId: string): Promise<string> {
    await this.billingService.assertHasBudget(userId, 'PHOTO');

    let buffer: Buffer;
    let mimetype: string;
    let costUsd: number;
    let model: string;

    try {
      ({ buffer, mimetype, costUsd, model } =
        await this.capsuleStylistService.stylize(itemImageUrls));
    } catch {
      throw new InternalServerErrorException('Не удалось оформить капсулу');
    }

    await this.billingService.chargeUsage(userId, 'PHOTO', {
      action: 'capsule_stylize',
      model,
      costUsd,
    });

    try {
      return await this.s3Service.uploadCapsuleStyled(
        crypto.randomUUID(),
        buffer,
        mimetype,
      );
    } catch {
      throw new InternalServerErrorException('Не удалось оформить капсулу');
    }
  }

  async create(dto: CreateCapsuleRequestDto, userId: string) {
    const clothesIds = dto.items.map((item) => item.clothesId);
    const ownedClothesIds = await this.capsuleRepository.findClothesOwnedBy(
      userId,
      clothesIds,
    );

    const notOwned = clothesIds.filter((id) => !ownedClothesIds.includes(id));

    if (notOwned.length > 0) {
      throw new BadRequestException(
        'В капсуле есть вещи, которые вам не принадлежат',
      );
    }

    return this.capsuleRepository.createWithItems(
      {
        name: dto.name,
        thumbnailUrl: dto.thumbnailUrl,
        createdById: userId,
        public: dto.public,
      },
      dto.items,
    );
  }

  async findById(id: string) {
    const capsule = await this.capsuleRepository.findById(id);

    if (!capsule) {
      throw new NotFoundException('Капсула не найдена');
    }

    return capsule;
  }

  findByUserId(userId: string) {
    return this.capsuleRepository.findManyByUserId(userId);
  }

  async remove(id: string, userId: string) {
    const capsule = await this.capsuleRepository.findById(id);

    if (!capsule) {
      throw new NotFoundException('Капсула не найдена');
    }

    if (capsule.createdById !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужую капсулу');
    }

    await this.capsuleRepository.deleteById(id, userId);
  }
}
