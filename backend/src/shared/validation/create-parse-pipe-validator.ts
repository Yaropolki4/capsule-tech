import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
} from '@nestjs/common';

const createParseFilePipe = (maxSize: number) => {
  return new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({
        maxSize,
        message: 'Слишком большой файл',
      }),
      new FileTypeValidator({
        fileType: /(image\/jpeg|image\/png|image\/jpg)/,
      }),
    ],
    fileIsRequired: true,
  });
};

export const ValidatedUploadedFile = (maxSize: number = 1024 * 1024 * 5) => {
  return UploadedFile(createParseFilePipe(maxSize));
};
