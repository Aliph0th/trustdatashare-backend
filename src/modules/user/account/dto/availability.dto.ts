import { IsDefined, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { MIN_USERNAME_LENGTH } from '#/constants';

export class UserCredentialsDTO {
   @IsOptional()
   @IsEmail()
   email!: string | undefined;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   @MinLength(MIN_USERNAME_LENGTH)
   username!: string | undefined;

   @ValidateIf((o: UserCredentialsDTO) => !o.username && !o.email)
   @IsDefined({ message: 'At least one property must be provided' })
   protected readonly atLeastOne: undefined;
}
