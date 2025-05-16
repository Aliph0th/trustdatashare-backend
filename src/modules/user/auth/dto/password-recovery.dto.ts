import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { MIN_PASSWORD_LENGTH } from '#/constants';
import { Match } from '#/decorators';

export class PasswordResetDTO {
   @IsEmail({}, { message: 'Invalid email' })
   email: string;
}

export class PasswordUpdateDTO {
   @IsUUID('4')
   token: string;

   @IsString()
   @IsNotEmpty()
   @MinLength(MIN_PASSWORD_LENGTH)
   password: string;

   @IsString()
   @IsNotEmpty()
   @MinLength(MIN_PASSWORD_LENGTH)
   @Match('password')
   repeatedPassword: string;
}
