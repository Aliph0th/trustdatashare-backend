import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '$/core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { USER_SALT_ROUNDS } from '#/constants';
import { PatchUserDTO, UserCredentialsDTO } from './dto';

@Injectable()
export class AccountService {
   constructor(private readonly prisma: PrismaService) {}

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
}
