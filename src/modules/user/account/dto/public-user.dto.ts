import { Exclude, Transform } from 'class-transformer';

export class PublicUserDTO {
   id: number;
   username: string;
   @Transform(({ value }) =>
      value ? new URL(`${process.env.S3_AVATAR_FOLDER}/${value}.webp`, process.env.S3_CDN).toString() : null
   )
   avatar?: string;

   @Exclude()
   isEmailVerified: boolean;
   @Exclude()
   createdAt: Date;
   @Exclude()
   updatedAt: Date;
   @Exclude()
   password: string;
   @Exclude()
   email: string;

   constructor(partial: Partial<PublicUserDTO>) {
      Object.assign(this, partial);
   }
}
