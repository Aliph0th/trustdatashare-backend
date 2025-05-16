import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { Prisma, TokenType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class TokenService {
   constructor(private readonly prisma: PrismaService) {}

   async issue(userID: number, type: TokenType, ttl: number) {
      const { token } = await this.prisma.token.create({
         select: { token: true },
         data: {
            token: randomUUID(),
            expires: new Date(Date.now() + ttl),
            userID,
            type
         }
      });
      return token;
   }

   async revokeAll(userID: number, type: TokenType) {
      await this.prisma.token.deleteMany({ where: { userID, type } });
   }

   async useToken(token: string, type: TokenType, userID?: number) {
      const existingToken = await this.prisma.token.findUnique({
         where: { token, type }
      });
      const isExpired = new Date(existingToken?.expires) < new Date();
      console.log(!existingToken, isExpired, userID && existingToken?.userID !== userID);
      if (!existingToken || isExpired || (userID && existingToken?.userID !== userID)) {
         throw new NotFoundException('Token not found');
      }

      await this.delete({ id: existingToken.id, type });

      return existingToken.userID;
   }

   async delete(where: Prisma.TokenWhereUniqueInput) {
      await this.prisma.token.delete({ where });
   }

   @Cron(CronExpression.EVERY_30_MINUTES)
   async deleteExpired() {
      const { count } = await this.prisma.token.deleteMany({ where: { expires: { lt: new Date() } } });
      Logger.log(`Deleting expired tokens: affected ${count} rows`, TokenService.name);
   }
}
