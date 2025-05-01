import { IsBoolean, IsInt, IsNotIn, IsOptional, Length, Min, MinLength } from 'class-validator';
import { MAX_DATA_LENGTH, MIN_DATA_PASSWORD_LENGTH } from '#/constants';

export class CreateDataDTO {
   @Length(1, MAX_DATA_LENGTH.content)
   content: string;

   @IsOptional()
   @IsInt()
   @IsNotIn([0], { message: 'ttl cannot be 0' })
   @Min(-1)
   ttl?: number;

   @IsOptional()
   @Length(1, MAX_DATA_LENGTH.title)
   title?: string;

   @IsOptional()
   @Length(1, MAX_DATA_LENGTH.description)
   description?: string;

   @IsOptional()
   @IsBoolean()
   hideOwner?: boolean;

   @IsOptional()
   @MinLength(MIN_DATA_PASSWORD_LENGTH)
   password?: string;
}
