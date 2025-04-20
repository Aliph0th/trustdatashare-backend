import { IsUUID } from 'class-validator';

export class EmailVerifyDTO {
   @IsUUID('4', { message: 'Invalid token' })
   token!: string;
}
