import { IsUUID } from 'class-validator';

export class GetDataDTO {
   @IsUUID('4')
   id: string;
}
