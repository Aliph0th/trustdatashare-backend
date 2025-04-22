import { ForbiddenException, Injectable } from '@nestjs/common';
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
}
