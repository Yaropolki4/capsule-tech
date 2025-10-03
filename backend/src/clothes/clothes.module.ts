import { Module } from '@nestjs/common';
import { ClothesService } from './clothes.service';
import { ClothesController } from './clothes.controller';
import { S3Module } from 'src/s3/s3.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ClothesRepository } from './clothes.repository';
import { HttpClientModule } from 'src/http/http.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { IMAGE_PROCESSING_PACKAGE_NAME } from 'generated/proto/bg-remover';

@Module({
  controllers: [ClothesController],
  providers: [ClothesService, ClothesRepository],
  imports: [
    AuthModule,
    S3Module,
    UserModule,
    HttpClientModule,
    ClientsModule.register([
      {
        name: 'IMAGE_PROCESSING_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: IMAGE_PROCESSING_PACKAGE_NAME,
          protoPath: join(
            __dirname,
            '../../../../../contracts/proto/bg-remover.proto',
          ),
          url: 'localhost:6001',
        },
      },
    ]),
  ],
})
export class ClothesModule {}
