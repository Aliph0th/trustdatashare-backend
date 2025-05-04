import { IsUUID } from 'class-validator';

export class UuidDTO {
   @IsUUID('4')
   id: string;
}
