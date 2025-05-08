import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class NumericDTO {
   @IsInt()
   @Min(1)
   @Transform(({ value }) => +value)
   id: number;
}
