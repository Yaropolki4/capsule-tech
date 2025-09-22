import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';

@Injectable()
export class HttpClientService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async removeBackground(file: Express.Multer.File): Promise<Buffer> {
    try {
      const pythonServerUrl = this.configService.getOrThrow<string>(
        'PYTHON_CROP_SERVER_URL',
      );

      const formData = new FormData();
      formData.append('file', Buffer.from(file.buffer), {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      console.log(formData);

      const observable = this.httpService.post(
        `${pythonServerUrl}/remove-bg`,
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
