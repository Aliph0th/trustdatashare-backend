import { Injectable } from '@nestjs/common';
import { Prisma, TokenType } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TokenService } from '../../token/token.service';
import { UserCredentialsDTO } from './dto';

@Injectable()
export class AccountService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly tokenService: TokenService
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

   async verifyEmail(token: string) {
      const id = await this.tokenService.useToken(token, TokenType.EMAIL_VERIFICATION);

      const user = await this.prisma.user.update({
         where: { id },
         data: { isEmailVerified: true }
      });
   }

   async findByID(id: number) {
      return this.prisma.user.findUnique({ where: { id } });
   }

   async find(where: Prisma.UserWhereInput) {
      return this.prisma.user.findFirst({ where });
   }

   async create(data: Prisma.UserCreateInput) {
      return await this.prisma.user.create({ data });
   }
}
