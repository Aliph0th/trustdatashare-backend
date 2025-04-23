import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH } from '#/constants';
import { Match } from '#/decorators';

export class RegisterUserDTO {
   @IsEmail()
   email: string;

   @IsString()
   @IsNotEmpty()
   @MinLength(MIN_PASSWORD_LENGTH)
   password: string;

   @IsString()
   @IsNotEmpty()
   @MinLength(MIN_PASSWORD_LENGTH)
   @Match('password')
   repeatedPassword: string;

   @IsString()
   @IsNotEmpty()
   @MinLength(MIN_USERNAME_LENGTH)
   username: string;
}
