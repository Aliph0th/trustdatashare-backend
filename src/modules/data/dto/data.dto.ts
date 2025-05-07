import { Exclude } from 'class-transformer';

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
   };

   @Exclude()
   password?: string;
   @Exclude()
   ownerID: number;

   constructor(partial: Partial<DataDTO>) {
      Object.assign(this, partial);
   }
}
