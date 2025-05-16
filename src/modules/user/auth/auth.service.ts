import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '$/core/prisma/prisma.service';
import { RedisService } from '$/core/redis/redis.service';
import * as bcrypt from 'bcryptjs';
import type { Request } from 'express';
import { TokenType } from '@prisma/client';
import {
   EMAIL_VERIFICATION_TOKEN_TTL,
   EMAIL_VERIFY_RESEND_COOLDOWN,
   PASSWORD_RECOVERY_COOLDOWN,
   PASSWORD_RESET_TOKEN_TTL,
   REDIS_KEYS,
   USER_SALT_ROUNDS
} from '#/constants';
import { buildCacheKey } from '#/utils';
import { MailService } from '../../mail/mail.service';
import { SessionService } from '../../session/session.service';
import { TokenService } from '../../token/token.service';
import { AccountService } from '../account/account.service';
import type { RegisterUserDTO } from './dto';

@Injectable()
export class AuthService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly accountService: AccountService,
      private readonly tokenService: TokenService,
      private readonly mailService: MailService,
      private readonly redis: RedisService,
      private readonly configService: ConfigService,
      private readonly sessionService: SessionService
   ) {}

   async createUser({ email, username, password }: RegisterUserDTO) {
      const candidate = await this.accountService.find({ OR: [{ email }, { username }] });

      if (candidate) {
         throw new ConflictException('User with such email or username already exists');
      }
      const hashedPassword = await bcrypt.hash(password, USER_SALT_ROUNDS);

      const prefix = `/api/v${this.configService.getOrThrow('ACTUAL_VERSION')}`;
      await Promise.all([
         this.redis.invalidate(buildCacheKey({ path: `${prefix}/users/availability`, query: { email } })),
         this.redis.invalidate(buildCacheKey({ path: `${prefix}/users/availability`, query: { username } })),
         this.redis.invalidate(buildCacheKey({ path: `${prefix}/users/availability`, query: { email, username } }))
      ]);

      return await this.accountService.create({ email, username, password: hashedPassword });
   }

   async validateUser(login: string, password: string) {
      const user = await this.prisma.user.findFirst({ where: { OR: [{ email: login }, { username: login }] } });
      if (!user) {
         throw new BadRequestException('Invalid login or password');
      }

      const isPasswordsMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordsMatch) {
         throw new BadRequestException('Invalid login or password');
      }

      return user;
   }

   async verifyEmail(token: string, request: Request) {
      if (request.user.isEmailVerified) {
         throw new BadRequestException('Email is already verified');
      }
      const id = await this.tokenService.useToken(token, TokenType.EMAIL_VERIFICATION, request.user.id);
      await this.accountService.setVerifiedEmail(id);
      request.user.isEmailVerified = true;
   }

   async resendVerificationEmail(userID: number) {
      const { email, username, isEmailVerified } = await this.prisma.user.findUnique({
         where: { id: userID },
         select: { email: true, username: true, isEmailVerified: true }
      });
      if (isEmailVerified) {
         throw new BadRequestException('Email is already verified');
      }
      const cooldown = await this.redis.ttl(REDIS_KEYS.COOLDOWN_EMAIL_VERIFY_RESEND(userID));
      if (cooldown > 0) {
         throw new HttpException(`Try again in ${cooldown} seconds`, HttpStatus.TOO_MANY_REQUESTS);
      }

      await this.tokenService.revokeAll(userID, TokenType.EMAIL_VERIFICATION);
      const token = await this.tokenService.issue(userID, TokenType.EMAIL_VERIFICATION, EMAIL_VERIFICATION_TOKEN_TTL);

      await this.mailService.sendEmailVerification(email, username, token);

      await this.redis.set(REDIS_KEYS.COOLDOWN_EMAIL_VERIFY_RESEND(userID), 1, 'EX', EMAIL_VERIFY_RESEND_COOLDOWN);

      return EMAIL_VERIFY_RESEND_COOLDOWN;
   }

   async resetPassword(email: string, req: Request) {
      const cooldown = await this.redis.ttl(REDIS_KEYS.COOLDOWN_RECOVERY(email));
      if (cooldown > 0) {
         throw new HttpException(`Try again in ${cooldown} seconds`, HttpStatus.TOO_MANY_REQUESTS);
      }
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
         return PASSWORD_RECOVERY_COOLDOWN;
      }

      await this.tokenService.revokeAll(user.id, TokenType.PASSWORD_RESET);

      const metadata = this.sessionService.getSessionMetadata(req);
      const token = await this.tokenService.issue(user.id, TokenType.PASSWORD_RESET, PASSWORD_RESET_TOKEN_TTL);

      await this.mailService.sendPasswordReset(email, user.username, token, metadata);

      await this.redis.set(REDIS_KEYS.COOLDOWN_RECOVERY(email), 1, 'EX', PASSWORD_RECOVERY_COOLDOWN);

      return PASSWORD_RECOVERY_COOLDOWN;
   }

   async setupPassword(token: string, password: string) {
      const id = await this.tokenService.useToken(token, TokenType.PASSWORD_RESET);
      await this.accountService.updatePassword(id, password);
   }
}
