import { Exclude } from 'class-transformer';
import { User } from '@prisma/client';
import { ActiveSession } from '#/types';

export class UserDTO {
   id: number;
   email: string;
   username: string;
   isPremium: boolean;
   avatar?: string | null;
   bio?: string | null;
   isEmailVerified: boolean;
   createdAt: Date;
   updatedAt: Date;
   hashes: number;
   sessions?: {
      current?: ActiveSession;
      sessions: ActiveSession[];
   };

   @Exclude()
   password: string;

   constructor(partial: Partial<UserDTO>) {
      Object.assign(this, partial);
   }
}
