import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { extension as getFileExtension } from 'mime-types';
import { s3Config } from 'src/config/env-config/load-config';

const paths = {
  avatar: 'avatars',
  clothes: 'clothes',
  capsuleThumbnails: 'capsule-thumbnails',
  capsuleStyled: 'capsule-styled',
  userPhotos: 'user-photos',
  tryOnResults: 'try-on-results',
};

@Injectable()
export class S3Service {
  private readonly bucket = 'capsule-test';
  private readonly endpoint = 'https://storage.yandexcloud.net';
  private readonly s3: S3Client;

  constructor(
    @Inject(s3Config.KEY) private readonly config: ConfigType<typeof s3Config>,
  ) {
    this.s3 = new S3Client({
      region: 'ru-central1',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.config.s3AccessKeyId,
        secretAccessKey: this.config.s3SecretAccessKeyId,
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

  async uploadCapsuleThumbnail(
    filename: string,
    buffer: Buffer,
    mimetype: string,
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
          Key: `${paths.capsuleThumbnails}/${file}`,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      return `${this.endpoint}/${this.bucket}/${paths.capsuleThumbnails}/${file}`;
    } catch {
      throw new InternalServerErrorException(
        'Не удалось загрузить изображение',
      );
    }
  }

  async uploadCapsuleStyled(
    filename: string,
    buffer: Buffer,
    mimetype: string,
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
          Key: `${paths.capsuleStyled}/${file}`,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      return `${this.endpoint}/${this.bucket}/${paths.capsuleStyled}/${file}`;
    } catch {
      throw new InternalServerErrorException(
        'Не удалось загрузить изображение',
      );
    }
  }

  async uploadUserPhoto(filename: string, buffer: Buffer, mimetype: string) {
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
          Key: `${paths.userPhotos}/${file}`,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      return `${this.endpoint}/${this.bucket}/${paths.userPhotos}/${file}`;
    } catch {
      throw new InternalServerErrorException(
        'Не удалось загрузить изображение',
      );
    }
  }

  async uploadTryOnResult(filename: string, buffer: Buffer, mimetype: string) {
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
          Key: `${paths.tryOnResults}/${file}`,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      return `${this.endpoint}/${this.bucket}/${paths.tryOnResults}/${file}`;
    } catch {
      throw new InternalServerErrorException(
        'Не удалось загрузить изображение',
      );
    }
  }
}
