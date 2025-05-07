import { ArgumentMetadata, Injectable, PipeTransform, UnprocessableEntityException } from '@nestjs/common';
import { ACCEPTABLE_AVATAR_TYPES, AVATAR_MAX_SIZE } from '#/constants';

@Injectable()
export class FileValidationPipe implements PipeTransform {
   transform(value: Express.Multer.File, _: ArgumentMetadata) {
      if (!ACCEPTABLE_AVATAR_TYPES.includes(value.mimetype)) {
         throw new UnprocessableEntityException('Invalid file type');
      }
      if (value.size > AVATAR_MAX_SIZE) {
         throw new UnprocessableEntityException('File is too big');
      }
      return value;
   }
}
