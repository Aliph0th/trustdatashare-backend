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
import { DATA_SALT_ROUNDS } from '#/constants';
import { StorageService } from '../storage/storage.service';
import type { CreateDataDTO } from './dto';

@Injectable()
export class DataService {
   constructor(
      private readonly storageService: StorageService,
      private readonly prisma: PrismaService
   ) {}

   async create({ content, description, password, title, ttl, hideOwner }: CreateDataDTO, request?: Request) {
      if (hideOwner && !request.user?.isPremium) {
         throw new ForbiddenException('You are not allowed to hide yourself without premium');
      }
      const storageFile = await this.storageService.upload(content);
      const instance: Prisma.DataCreateInput = {
         id: storageFile,
         description,
         title,
         ttl
      };

      const userID = request.user?.id;
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
      const [prefix, password] = authorization?.split(' ') || [];
      const data = await this.prisma.data.findUnique({
         where: { id },
         include: { owner: { select: { id: true, username: true, isPremium: true } } }
      });
      const isExpired = new Date(data.createdAt).getTime() + data.ttl * 1000 < Date.now();
      if (!data || (data.ttl > 0 && isExpired)) {
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
}
