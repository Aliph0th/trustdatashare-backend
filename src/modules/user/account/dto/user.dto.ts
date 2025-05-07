import { Exclude, Transform } from 'class-transformer';

export class UserDTO {
   id: number;
   email: string;
   username: string;
   @Transform(({ value }) =>
      value ? new URL(`${process.env.S3_AVATAR_FOLDER}/${value}.webp`, process.env.S3_CDN).toString() : null
   )
   avatar?: string;
   isEmailVerified: boolean;
   createdAt: Date;
   updatedAt: Date;

   @Exclude()
   password: string;

   constructor(partial: Partial<UserDTO>) {
      Object.assign(this, partial);
   }
}
