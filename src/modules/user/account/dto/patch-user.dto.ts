import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { User } from '@prisma/client';
import { MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH } from '#/constants';
import { Match } from '#/decorators';

export class PatchUserDTO {
   @IsOptional()
   @IsString()
   @IsNotEmpty()
   @MinLength(MIN_PASSWORD_LENGTH)
   @Match('repeatedPassword')
   password?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   @MinLength(MIN_PASSWORD_LENGTH)
   @Match('password')
   repeatedPassword?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   @MinLength(MIN_USERNAME_LENGTH)
   username?: string;

   constructor(partial: Partial<User>) {
      Object.assign(this, partial);
   }
}
