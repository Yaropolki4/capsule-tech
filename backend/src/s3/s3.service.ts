import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class S3Service {
  private readonly bucket = 'capsule-test';
  private readonly s3 = new S3Client({
    region: 'ru-central1',
    endpoint: 'https://storage.yandexcloud.net',
    credentials: {
      accessKeyId: 'REDACTED_S3_ACCESS_KEY_ID',
      secretAccessKey: 'REDACTED_S3_SECRET_ACCESS_KEY',
    },
  });

  async uploadAvatar(filename: string, buffer: Buffer, mimetype: string) {
    try {
      const uploadResult = await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `avatars/${filename}.jpeg`,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      return uploadResult;
    } catch {
      throw new InternalServerErrorException('Failed to upload avatar');
    }
  }

  async uploadItem(filename: string, buffer: Buffer, mimetype: string) {
    try {
      const uploadResult = await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `items/${filename}.jpeg`,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      return uploadResult;
    } catch {
      throw new InternalServerErrorException('Failed to upload item');
    }
  }
}
