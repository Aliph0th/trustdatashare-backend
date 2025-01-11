import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { UserCredentialsDTO } from './dto';

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
}
