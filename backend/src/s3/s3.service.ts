import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extension as getFileExtension } from 'mime-types';

const paths = {
  avatar: 'avatars',
  clothes: 'clothes',
};

@Injectable()
export class S3Service {
  private readonly bucket = 'capsule-test';
  private readonly endpoint = 'https://storage.yandexcloud.net';
  private readonly s3: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: 'ru-central1',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'S3_SECRET_ACCESS_KEY_ID',
        ),
      },
    });
  }

  async uploadAvatar(
    filename: string,
    buffer: Buffer,
    mimetype: string,
    prevAvatarUrl: string | null,
  ) {
    try {
      const fileExtension = getFileExtension(mimetype);

      if (!fileExtension) {
        throw new InternalServerErrorException({
          message: 'Ошибка расширения файла',
          cause: 'file',
        });
      }

      const file = `${filename}.${fileExtension}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `${paths.avatar}/${file}`,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      const prevAvatarKey = prevAvatarUrl?.split('/').pop();

      if (prevAvatarKey) {
        await this.s3.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: `${paths.avatar}/${prevAvatarKey}`,
          }),
        );
      }

      return `${this.endpoint}/${this.bucket}/${paths.avatar}/${file}`;
    } catch {
      throw new InternalServerErrorException(
        'Не удалось загрузить изображение',
      );
    }
  }

  async uploadClothes(filename: string, buffer: Buffer, mimetype: string) {
    try {
      const fileExtension = getFileExtension(mimetype);

      if (!fileExtension) {
        throw new InternalServerErrorException({
          message: 'Ошибка расширения файла',
          cause: 'file',
        });
      }

      const file = `${filename}.${fileExtension}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `${paths.clothes}/${file}`,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      return `${this.endpoint}/${this.bucket}/${paths.clothes}/${file}`;
    } catch {
      throw new InternalServerErrorException(
        'Не удалось загрузить изображение',
      );
    }
  }
}
