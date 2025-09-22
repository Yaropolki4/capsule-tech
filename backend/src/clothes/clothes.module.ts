import { Module } from '@nestjs/common';
import { ClothesService } from './clothes.service';
import { ClothesController } from './clothes.controller';
import { S3Module } from 'src/s3/s3.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ClothesRepository } from './clothes.repository';
import { HttpClientModule } from 'src/http/http.module';

@Module({
  controllers: [ClothesController],
  providers: [ClothesService, ClothesRepository],
  imports: [AuthModule, S3Module, UserModule, HttpClientModule],
})
export class ClothesModule {}
