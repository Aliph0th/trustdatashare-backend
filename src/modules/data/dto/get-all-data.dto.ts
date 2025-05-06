import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetAllDataDTO {
   @IsOptional()
   @IsInt()
   @Min(0)
   @Transform(({ value }) => +value)
   page: number = 0;

   @IsOptional()
   @IsInt()
   @Min(1)
   @Transform(({ value }) => +value)
   limit: number = 10;
}
