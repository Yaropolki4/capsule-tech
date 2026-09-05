import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { ClothesSource } from '@prisma/client';
import {
  CreateClothesFromWildberriesRequestDto,
  UpdateClothesRequestDto,
} from '@capsule/common';
import { UserRepository } from 'src/user/user.repository';
import { ClothesRepository } from './clothes.repository';
import { ClothesCharacterizerService } from 'src/llm/clothes-characterizer.service';
import { BillingService } from 'src/billing/billing.service';

@Injectable()
export class ClothesService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
    private readonly clothesRepository: ClothesRepository,
    private readonly clothesCharacterizerService: ClothesCharacterizerService,
    private readonly billingService: BillingService,
  ) {}

  async create(email: string, file: Express.Multer.File) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.billingService.assertHasBudget(user.id, 'PHOTO');

    const fileId = crypto.randomUUID();

    const [
      imageUrl,
      { category, brand, description, embedding, costUsd, model },
    ] = await Promise.all([
      this.s3Service.uploadClothes(fileId, file.buffer, file.mimetype),
      this.clothesCharacterizerService.analyzeImage({
        imageBuffer: file.buffer,
        mimeType: file.mimetype,
      }),
    ]);

    await this.billingService.chargeUsage(user.id, 'PHOTO', {
      action: 'clothes_analyze',
      model,
      costUsd,
    });

    const item = await this.clothesRepository.create({
      brand,
      category,
      imageUrl,
      createdById: user.id,
      description,
      embedding,
    });

    return item;
  }

  async createFromWildberries(
    input: CreateClothesFromWildberriesRequestDto,
    userId: string,
  ) {
    await this.billingService.assertHasBudget(userId, 'PHOTO');

    const { buffer, mimetype } = await this.downloadImage(input.photo);

    const imageUrl = await this.s3Service.uploadClothes(
      crypto.randomUUID(),
      buffer,
      mimetype,
    );

    const { category, brand, costUsd, model } =
      await this.clothesCharacterizerService.classifyCatalogItem({
        title: input.name,
        tags: input.description,
      });

    await this.billingService.chargeUsage(userId, 'PHOTO', {
      action: 'clothes_from_wildberries',
      model,
      costUsd,
    });

    return this.clothesRepository.create({
      brand: input.brand ?? brand,
      category,
      imageUrl,
      createdById: userId,
      description: input.description,
      source: ClothesSource.WEB,
      sourceUrl: input.url,
    });
  }

  private async downloadImage(
    url: string,
  ): Promise<{ buffer: Buffer; mimetype: string }> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new InternalServerErrorException(
        `Не удалось скачать изображение товара: ${response.status}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const mimetype = response.headers.get('content-type') ?? 'image/webp';

    return { buffer: Buffer.from(arrayBuffer), mimetype };
  }

  async getUserClothes(userId: string) {
    return (
      await this.clothesRepository.getUserClothes(userId, {
        sortedByCreatedAt: true,
      })
    ).map((clothes) => ({
      brand: clothes.brand,
      category: clothes.category,
      imageUrl: clothes.imageUrl,
      createdById: clothes.createdById,
      id: clothes.id,
      sourceUrl: clothes.sourceUrl,
    }));
  }

  async remove(id: string, userId: string) {
    return this.clothesRepository.remove(id, userId);
  }

  async addToWardrobe(id: string, userId: string) {
    const clothes = await this.clothesRepository.findById(id);

    if (!clothes) {
      throw new NotFoundException('Вещь не найдена');
    }

    await this.clothesRepository.addToWardrobe(userId, id);
  }

  findOne(id: number) {
    return `This action returns a #${id} item`;
  }

  update(id: number, updateItemDto: UpdateClothesRequestDto) {
    return `This action updates a #${id} item`;
  }
}
