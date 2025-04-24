import {
   BadRequestException,
   ForbiddenException,
   Injectable,
   NotFoundException,
   UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from '$/core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { DATA_SALT_ROUNDS, MAX_GUEST_DATA_TTL } from '#/constants';
import '#/constants/api.constants';
import { StorageService } from '../storage/storage.service';
import type { CreateDataDTO, UpdateDataDTO } from './dto';

@Injectable()
export class DataService {
   constructor(
      private readonly storageService: StorageService,
      private readonly prisma: PrismaService
   ) {}

   async create({ content, description, password, title, ttl, hideOwner }: CreateDataDTO, request?: Request) {
      if (hideOwner && !request?.user?.isPremium) {
         throw new ForbiddenException('You are not allowed to hide yourself without premium');
      }

      const userID = request?.user?.id;
      const storageFile = await this.storageService.upload(content);
      if (!userID && ttl === -1) {
         ttl = MAX_GUEST_DATA_TTL;
      }
      const instance: Prisma.DataCreateInput = {
         id: storageFile,
         description,
         title,
         ttl: userID ? ttl : Math.min(ttl, MAX_GUEST_DATA_TTL)
      };

      if (userID) {
         instance.owner = { connect: { id: userID } };
      }

      if (password) {
         instance.password = await bcrypt.hash(password, DATA_SALT_ROUNDS);
      }

      return await this.prisma.data.create({
         data: instance,
         include: { owner: { select: { id: true, username: true, isPremium: true } } }
      });
   }

   async getByID(id: string, authorization?: string) {
      const data = await this.prisma.data.findUnique({
         where: { id },
         include: { owner: { select: { id: true, username: true, isPremium: true } } }
      });

      const [prefix, password] = authorization?.split(' ') || [];
      const isExpired = new Date(data?.createdAt).getTime() + data?.ttl * 1000 < Date.now();
      if (!data || (data?.ttl > 0 && isExpired)) {
         throw new NotFoundException();
      }
      if (data.password) {
         if (prefix?.toLowerCase() !== 'basic') {
            throw new BadRequestException('Invalid authorization header prefix');
         }
         const isCorrect = await bcrypt.compare(password || '', data.password);
         if (!isCorrect) {
            throw new UnauthorizedException();
         }
      }

      const content = (await this.storageService.get(data.id)).toString();
      return { data, content };
   }

   async patch(id: string, dto: UpdateDataDTO, userID?: number) {
      if (Object.keys(dto).length === 0) {
         throw new BadRequestException('You should specify at least one update');
      }

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
         await this.storageService.upload(content, data.id);
      }

      const updated = await this.prisma.data.update({
         where: { id },
         data: {
            ...updates,
            updatedAt: new Date()
         },
         include: { owner: { select: { id: true, username: true, isPremium: true } } }
      });

      return { data: updated, content };
   }
}
