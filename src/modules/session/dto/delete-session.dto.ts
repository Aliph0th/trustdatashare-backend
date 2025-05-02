import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteSessionsDTO {
   @IsArray()
   @ArrayNotEmpty()
   @IsUUID('4', { each: true })
   sessions: string[];
}
