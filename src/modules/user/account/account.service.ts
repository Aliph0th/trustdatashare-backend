import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '$/core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import * as sharp from 'sharp';
import { Prisma } from '@prisma/client';
import { AVATAR_SIZE, USER_SALT_ROUNDS } from '#/constants';
import { StorageService } from '../../storage/storage.service';
import { PatchUserDTO, UserCredentialsDTO } from './dto';

@Injectable()
export class AccountService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly storage: StorageService,
      private readonly configService: ConfigService
   ) {}

   async isCredentialsAvailable({ email, username }: UserCredentialsDTO) {
      const conditions: Prisma.UserWhereInput[] = [];
      if (email) {
         conditions.push({ email });
      }
      if (username) {
         conditions.push({ username });
      }

      const users = await this.prisma.user.findMany({
         select: { email: true, username: true },
         where: { OR: conditions }
      });

      const availability: { email?: boolean; username?: boolean } = {};
      if (email) {
         availability.email = !users.some(user => user.email === email);
      }
      if (username) {
         availability.username = !users.some(user => user.username === username);
      }
      return availability;
   }

   async setVerifiedEmail(id: number) {
      return await this.prisma.user.update({
         where: { id },
         data: { isEmailVerified: true }
      });
   }

   async findByID(id: number) {
      return this.prisma.user.findUnique({ where: { id } });
   }

   async patch(id: number, dto: PatchUserDTO) {
      if (Object.keys(dto).length === 0) {
         throw new BadRequestException('You should specify at least one update');
      }
      const { repeatedPassword: _, ...updates } = dto;
      if (updates.password) {
         updates.password = await bcrypt.hash(updates.password, USER_SALT_ROUNDS);
      }
      try {
         return await this.prisma.user.update({
            where: { id },
            data: updates
         });
      } catch (error) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
               throw new NotFoundException();
            }
         }
         throw error;
      }
   }

   async find(where: Prisma.UserWhereInput) {
      return this.prisma.user.findFirst({ where });
   }

   async create(data: Prisma.UserCreateInput) {
      return await this.prisma.user.create({ data });
   }

   async changeAvatar(file: Buffer, userID: number) {
      const user = await this.prisma.user.findUnique({ where: { id: userID } });
      if (user.avatar) {
         await this.storage.delete({
            file: user.avatar,
            folder: this.configService.getOrThrow('S3_AVATAR_FOLDER'),
            ext: 'webp'
         });
      }
      const processedBuffer = await sharp(file).resize(AVATAR_SIZE, AVATAR_SIZE).webp({ effort: 3 }).toBuffer();
      const fileID = randomUUID();

      await this.storage.put(
         processedBuffer,
         {
            file: fileID,
            folder: this.configService.getOrThrow('S3_AVATAR_FOLDER'),
            ext: 'webp'
         },
         'public-read'
      );

      await this.prisma.user.update({ where: { id: userID }, data: { avatar: fileID } });

      return {
         url: new URL(
            `${this.configService.getOrThrow('S3_AVATAR_FOLDER')}/${fileID}.webp`,
            this.configService.getOrThrow('S3_CDN')
         ).toString()
      };
   }
}
