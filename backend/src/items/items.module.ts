import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { S3Service } from 'src/s3/s3.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService, S3Service],
  imports: [AuthModule],
})
export class ItemsModule {}
