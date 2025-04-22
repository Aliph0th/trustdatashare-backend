import { Exclude } from 'class-transformer';
import { Data } from '@prisma/client';

export class DataDTO {
   id: string;
   content?: string;
   ttl: number;
   title?: string;
   description?: string;
   createdAt: Date;
   updatedAt: Date;
   isPublic?: boolean;
   isOwnerHidden?: boolean;
   owner?: {
      id: number;
      username: string;
      isPremium: boolean;
   };

   @Exclude()
   password?: string;
   @Exclude()
   ownerID: number;

   constructor(partial: Partial<Data & { isPublic?: boolean }>) {
      Object.assign(this, partial);
   }
}
