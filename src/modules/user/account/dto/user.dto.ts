import { Exclude } from 'class-transformer';

export class UserDTO {
   id: number;
   email: string;
   username: string;
   isPremium: boolean;
   avatar?: string | null;
   isEmailVerified: boolean;
   createdAt: Date;
   updatedAt: Date;
   hashes: number;

   @Exclude()
   password: string;

   constructor(partial: Partial<UserDTO>) {
      Object.assign(this, partial);
   }
}
