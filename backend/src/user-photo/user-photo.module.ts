import { Module } from '@nestjs/common';
import { UserPhotoService } from './user-photo.service';
import { UserPhotoController } from './user-photo.controller';
import { UserPhotoRepository } from './user-photo.repository';
import { S3Module } from 'src/s3/s3.module';

@Module({
  controllers: [UserPhotoController],
  providers: [UserPhotoService, UserPhotoRepository],
  imports: [S3Module],
})
export class UserPhotoModule {}
