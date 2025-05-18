import { Exclude, Expose, Transform } from 'class-transformer';

export class DataDTO {
   id: string;
   content?: string;
   ttl: number;
   title?: string;
   description?: string;
   createdAt: Date;
   updatedAt: Date;

   @Transform(({ obj }) => !obj.password)
   @Expose()
   isPublic?: boolean;
   isOwnerHidden?: boolean;

   @Transform(({ obj, value }) => (obj.isOwnerHidden ? null : value))
   owner?: {
      id: number;
      username: string;
   };

   isYours: boolean;

   @Exclude()
   password?: string;
   @Exclude()
   ownerID: number;

   constructor(partial: Partial<DataDTO>) {
      Object.assign(this, partial);
   }
}
