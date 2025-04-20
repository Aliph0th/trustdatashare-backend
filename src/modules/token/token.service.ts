import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma, TokenType } from '@prisma/client';
import { EMAIL_VERIFICATION_TOKEN_TTL } from '#/constants';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class TokenService {
   constructor(private readonly prisma: PrismaService) {}

   async issueForEmailVerification(userID: number) {
      const { token } = await this.prisma.token.create({
         select: { token: true },
         data: {
            token: randomUUID(),
            expires: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL),
            userID,
            type: TokenType.EMAIL_VERIFICATION
         }
      });
      return token;
   }

   async useToken(token: string, type: TokenType) {
      const existingToken = await this.prisma.token.findUnique({
         where: { token, type }
      });
      if (!existingToken) {
         throw new NotFoundException('Token not found');
      }

      const isExpired = new Date(existingToken.expires) < new Date();
      if (isExpired) {
         throw new BadRequestException('Token is expired');
      }

      await this.delete({ id: existingToken.id, type });

      return existingToken.userID;
   }

   async delete(where: Prisma.TokenWhereUniqueInput) {
      await this.prisma.token.delete({ where });
   }
}
