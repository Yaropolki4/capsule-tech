import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import { cropServerUrlConfig } from 'src/config/env-config/load-config';

@Injectable()
export class HttpClientService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(cropServerUrlConfig.KEY)
    private readonly config: ConfigType<typeof cropServerUrlConfig>,
  ) {}

  async removeBackground(file: Express.Multer.File): Promise<Buffer> {
    try {
      const cropServerUrl = this.config.url;

      const formData = new FormData();
      formData.append('file', Buffer.from(file.buffer), {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const observable = this.httpService.post(
        `${cropServerUrl}/remove-bg`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          responseType: 'arraybuffer',
        },
      );

      const response = await firstValueFrom(observable);

      return Buffer.from(response.data);
    } catch {
      throw new InternalServerErrorException(
        'Не удалось удалить фон с изображения',
      );
    }
  }
}
