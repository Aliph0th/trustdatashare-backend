import { IsBoolean, IsDefined, IsIn, IsInt, IsOptional, Length, Min, MinLength, ValidateIf } from 'class-validator';
import { MAX_DATA_LENGTH, MIN_DATA_PASSWORD_LENGTH } from '#/constants';

export class UpdateDataDTO {
   @IsOptional()
   @Length(1, MAX_DATA_LENGTH.content)
   content: string;

   @IsOptional()
   @IsInt()
   @IsIn([0], { message: 'ttl cannot be 0' })
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

   @ValidateIf((o: UpdateDataDTO) => !o.content && !o.ttl && !o.title && !o.description && !o.hideOwner && !o.password)
   @IsDefined({ message: 'At least one property must be provided to update' })
   protected readonly atLeastOne: undefined;
}
