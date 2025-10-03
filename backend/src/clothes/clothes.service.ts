import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import {
  CreateClothesRequestDto,
  UpdateClothesRequestDto,
} from '@capsule/common';
import { UserRepository } from 'src/user/user.repository';
import { ClothesRepository } from './clothes.repository';
import { ClientGrpc } from '@nestjs/microservices';
import {
  ImageProcessingServiceClient,
  IMAGE_PROCESSING_SERVICE_NAME,
} from 'generated/proto/bg-remover';
import { catchError, map } from 'rxjs';

@Injectable()
export class ClothesService implements OnModuleInit {
  private bgRemoverService: ImageProcessingServiceClient;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
    private readonly clothesRepository: ClothesRepository,
    @Inject('IMAGE_PROCESSING_SERVICE') private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.bgRemoverService =
      this.client.getService<ImageProcessingServiceClient>(
        IMAGE_PROCESSING_SERVICE_NAME,
      );
  }

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

  async getUserClothes(userId: string) {
    return await this.clothesRepository.getUserClothes(userId);
  }

  removeBg(file: Express.Multer.File) {
    return this.bgRemoverService
      .removeBackground({
        imageData: file.buffer,
      })
      .pipe(
        map((response) => response.processedImageData),
        catchError(() => {
          throw new InternalServerErrorException('Failed to remove background');
        }),
      );
  }

  findOne(id: number) {
    return `This action returns a #${id} item`;
  }

  update(id: number, updateItemDto: UpdateClothesRequestDto) {
    return `This action updates a #${id} item`;
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }
}
