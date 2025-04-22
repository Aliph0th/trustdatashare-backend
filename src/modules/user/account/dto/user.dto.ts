import { Exclude } from 'class-transformer';
import { User } from '@prisma/client';

export class UserDTO {
   id!: number;
   email!: string;
   username!: string;
   isPremium!: boolean;
   avatar!: string | null;
   bio!: string | null;
   isEmailVerified!: boolean;
   createdAt!: string;
   updatedAt!: string;
   hashes!: number;

   @Exclude()
   password!: string;

   constructor(partial: Partial<User>) {
      Object.assign(this, partial);
   }
}
