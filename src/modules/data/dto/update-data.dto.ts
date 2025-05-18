import { IsBoolean, IsDefined, IsInt, IsNotIn, IsOptional, Length, Min, ValidateIf } from 'class-validator';
import { MAX_DATA_LENGTH, MIN_DATA_PASSWORD_LENGTH } from '#/constants';

export class UpdateDataDTO {
   @IsOptional()
   @Length(1, MAX_DATA_LENGTH.content)
   content: string;

   @IsOptional()
   @IsInt()
   @IsNotIn([0], { message: 'ttl cannot be 0' })
   @Min(-1)
   ttl?: number;

   @IsOptional()
   @Length(0, MAX_DATA_LENGTH.title)
   title?: string;

   @IsOptional()
   @Length(0, MAX_DATA_LENGTH.description)
   description?: string;

   @IsOptional()
   @IsBoolean()
   isOwnerHidden?: boolean;

   @IsOptional()
   @ValidateIf((_, value) => value === '' || (typeof value === 'string' && value.length >= MIN_DATA_PASSWORD_LENGTH), {
      message: 'Wrong password length'
   })
   password?: string;

   @ValidateIf(
      (o: UpdateDataDTO) =>
         o.content === undefined &&
         o.ttl === undefined &&
         o.title === undefined &&
         o.description === undefined &&
         o.isOwnerHidden === undefined &&
         o.password === undefined
   )
   @IsDefined({ message: 'At least one property must be provided to update' })
   protected readonly atLeastOne: undefined;
}
