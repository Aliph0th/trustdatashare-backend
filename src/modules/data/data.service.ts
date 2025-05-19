import {
   ForbiddenException,
   Injectable,
   InternalServerErrorException,
   Logger,
   NotFoundException,
   UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '$/core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { deleteExpiredPosts, getPostsFromUser } from '@prisma/client/sql';
import { DATA_SALT_ROUNDS, MAX_GUEST_DATA_TTL } from '#/constants';
import '#/constants/api.constants';
import { RedisService } from '../../core/redis/redis.service';
import { KmsService } from '../kms/kms.service';
import { StorageService } from '../storage/storage.service';
import type { CreateDataDTO, UpdateDataDTO } from './dto';

@Injectable()
export class DataService {
   constructor(
      private readonly storageService: StorageService,
      private readonly prisma: PrismaService,
      private readonly kmsService: KmsService,
      private readonly configService: ConfigService,
      private readonly redis: RedisService
   ) {}

   async create({ content, description, password, title, ttl, isOwnerHidden }: CreateDataDTO, request?: Request) {
      const userID = request?.user?.id;
      const fileID = randomUUID();
      const encrypted = await this.kmsService.encrypt(content, { fileID });
      if (!encrypted) {
         throw new InternalServerErrorException();
      }

      await this.storageService.put(encrypted.ciphertext, {
         file: fileID,
         folder: this.configService.getOrThrow('S3_DATA_FOLDER')
      });
      if (!userID && ttl === -1) {
         ttl = MAX_GUEST_DATA_TTL;
      }
      const instance: Prisma.DataCreateInput = {
         id: fileID,
         description,
         title,
         isOwnerHidden,
         ttl: userID ? ttl : Math.min(ttl, MAX_GUEST_DATA_TTL)
      };
      if (userID) {
         instance.owner = { connect: { id: userID } };
         let apiPrefix = this.configService.getOrThrow('API_PREFIX');
         if (apiPrefix && !apiPrefix.startsWith('/')) {
            apiPrefix = '/' + apiPrefix;
         }
         const prefix = `${apiPrefix}/v${this.configService.getOrThrow('ACTUAL_VERSION')}`;
         await this.redis.invalidate(`${prefix}/data/my|${userID}|`);
         if (!isOwnerHidden) {
            await this.redis.invalidate(`${prefix}/data/visible/${userID}`);
         }
      }
      if (password) {
         instance.password = await bcrypt.hash(password, DATA_SALT_ROUNDS);
      }

      return await this.prisma.data.create({
         data: instance,
         include: { owner: { select: { id: true, username: true } } }
      });
   }

   async getByID({
      id,
      userID,
      authorization,
      ownPost
   }: {
      id: string;
      userID?: number;
      authorization?: string;
      ownPost?: boolean;
   }) {
      const data = await this.prisma.data.findUnique({
         where: { id },
         include: { owner: { select: { id: true, username: true } } }
      });

      const [prefix, password] = authorization?.split(' ') || [];
      const isExpired = new Date(data?.createdAt).getTime() + data?.ttl * 1000 < Date.now();
      if (!data || (data?.ttl > 0 && isExpired)) {
         throw new NotFoundException();
      }
      if (ownPost && data.ownerID !== userID) {
         throw new ForbiddenException('You are not the owner of this post');
      }
      if (data.password && data.ownerID !== userID) {
         if (!prefix || !password) {
            throw new UnauthorizedException('No password provided');
         }
         if (prefix?.toLowerCase() !== 'basic') {
            throw new UnauthorizedException('Invalid authorization header prefix');
         }
         const isCorrect = await bcrypt.compare(password || '', data.password);
         if (!isCorrect) {
            throw new UnauthorizedException('Invalid password');
         }
      }

      const encrypted = await this.storageService.get({
         file: data.id,
         folder: this.configService.getOrThrow('S3_DATA_FOLDER')
      });
      const plain = await this.kmsService.decrypt(encrypted.toString(), { fileID: data.id });
      if (!plain) {
         throw new InternalServerErrorException();
      }
      return { data, content: plain.plaintext };
   }

   async getUserPosts(page: number, limit: number, userID: number, visibleOnly = false) {
      const user = await this.prisma.user.findUnique({
         where: { id: userID },
         select: { id: true }
      });
      if (!user) {
         throw new NotFoundException();
      }
      const userPosts = await this.prisma.$queryRawTyped(getPostsFromUser(userID, page * limit, limit, visibleOnly));
      const total = userPosts?.[0]?.total || 0;
      const hasMore = (page + 1) * limit < total;
      return { data: userPosts.map(({ total: _, ...post }) => post), hasMore };
   }

   async patch(id: string, dto: UpdateDataDTO, userID?: number) {
      const data = await this.prisma.data.findFirst({
         where: { id },
         select: { id: true, createdAt: true, ttl: true, owner: { select: { id: true } } }
      });
      const isExpired = new Date(data?.createdAt).getTime() + data?.ttl * 1000 < Date.now();
      if (!data || (data?.ttl > 0 && isExpired)) {
         throw new NotFoundException();
      }
      if (data.owner.id !== userID) {
         throw new ForbiddenException();
      }
      const { content, ...updates } = dto;

      if (content) {
         const encrypted = await this.kmsService.encrypt(content, { fileID: data.id });
         await this.storageService.put(encrypted.ciphertext, {
            file: data.id,
            folder: this.configService.getOrThrow('S3_DATA_FOLDER')
         });
      }

      if (updates.password) {
         updates.password = await bcrypt.hash(updates.password, DATA_SALT_ROUNDS);
      }

      if (updates.ttl) {
         const delta = new Date().getTime() - data.createdAt.getTime();
         updates.ttl += delta / 1000;
      }

      const sanitizedUpdates = Object.fromEntries(
         Object.entries(updates).map(([key, value]) => [key, value === '' ? null : value])
      );

      const updated = await this.prisma.data.update({
         where: { id },
         data: {
            ...sanitizedUpdates,
            updatedAt: new Date()
         },
         include: { owner: { select: { id: true, username: true } } }
      });

      return { data: updated, content };
   }

   async delete(id: string, userID: number) {
      const data = await this.prisma.data.findUnique({
         where: { id },
         include: { owner: { select: { id: true } } }
      });
      const isExpired = new Date(data?.createdAt).getTime() + data?.ttl * 1000 < Date.now();
      if (!data || (data?.ttl > 0 && isExpired)) {
         throw new NotFoundException();
      }
      if (data.owner.id !== userID) {
         throw new ForbiddenException();
      }

      await this.storageService.delete({
         file: data.id,
         folder: this.configService.getOrThrow('S3_DATA_FOLDER')
      });

      await this.prisma.data.delete({ where: { id } });
   }

   @Cron(CronExpression.EVERY_2_HOURS)
   async deleteExpired() {
      const ids = (await this.prisma.$queryRawTyped(deleteExpiredPosts())).map(data => data.id);
      const promises = ids.map(id =>
         this.storageService.delete({ file: id, folder: this.configService.getOrThrow('S3_DATA_FOLDER') })
      );
      await Promise.all(promises);
      Logger.log(`Deleting expired posts: affected ${ids.length} rows`, DataService.name);
   }
}
