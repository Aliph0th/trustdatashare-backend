import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '$/core/prisma/prisma.service';
import { RedisService } from '$/core/redis/redis.service';
import * as bcrypt from 'bcryptjs';
import type { Request } from 'express';
import { TokenType } from '@prisma/client';
import { EMAIL_VERIFY_RESEND_COOLDOWN, REDIS_KEYS, USER_SALT_ROUNDS } from '#/constants';
import { buildCacheKey } from '#/utils';
import { MailService } from '../../mail/mail.service';
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
      private readonly configService: ConfigService
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
      const id = await this.tokenService.useToken(token, request.user.id, TokenType.EMAIL_VERIFICATION);
      await this.accountService.setVerifiedEmail(id);
      request.user.isEmailVerified = true;
   }

   async resendEmail(userID: number) {
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
      const token = await this.tokenService.issueForEmailVerification(userID);

      await this.mailService.sendEmailVerification(email, username, token);

      await this.redis.set(REDIS_KEYS.COOLDOWN_EMAIL_VERIFY_RESEND(userID), 1, 'EX', EMAIL_VERIFY_RESEND_COOLDOWN);

      return EMAIL_VERIFY_RESEND_COOLDOWN;
   }
}
