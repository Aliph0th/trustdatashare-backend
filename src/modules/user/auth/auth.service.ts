import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { Request } from 'express';
import { TokenType } from '@prisma/client';
import { USER_SALT_ROUNDS } from '#/constants';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TokenService } from '../../token/token.service';
import { AccountService } from '../account/account.service';
import type { RegisterUserDTO } from './dto';

@Injectable()
export class AuthService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly accountService: AccountService,
      private readonly tokenService: TokenService
   ) {}

   async createUser({ email, username, password }: RegisterUserDTO) {
      const candidate = await this.accountService.find({ OR: [{ email }, { username }] });

      if (candidate) {
         throw new ConflictException('User with such email or username already exists');
      }
      const hashedPassword = await bcrypt.hash(password, USER_SALT_ROUNDS);
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
      const id = await this.tokenService.useToken(token, TokenType.EMAIL_VERIFICATION);
      await this.accountService.setVerifiedEmail(id);
      request.user.isEmailVerified = true;
   }
}
